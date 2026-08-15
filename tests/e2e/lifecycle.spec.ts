import { expect, test } from '@playwright/test';

test('result stars reveal in order without browser errors', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });

  await page.goto('/');
  await page.evaluate("import('/src/main.ts').then(({ mgr }) => mgr.go('result', { lessonId: 1, score: 80 }))");
  await page.getByRole('button', { name: /확인 퀴즈/ }).click();

  for (let index = 0; index < 3; index++) {
    await page.locator('.quiz-choice').first().click();
    await page.getByRole('button', { name: index < 2 ? /다음 문제/ : /결과 보기/ }).click();
  }

  const stars = page.locator('[data-star]');
  await expect(stars).toHaveCount(3);
  await expect.poll(async () => stars.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).opacity))).toEqual(['1', '1', '1']);
  expect(failures).toEqual([]);
});
