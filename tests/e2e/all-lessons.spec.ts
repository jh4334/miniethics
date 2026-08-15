import { expect, test } from '@playwright/test';

test('all twelve lessons render their story assets and mount their registered game', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });

  await page.goto('/');
  for (let lessonId = 1; lessonId <= 12; lessonId += 1) {
    await page.evaluate((id) => import('/src/main.ts').then(({ mgr }) => mgr.go('story', { lessonId: id })), lessonId);
    await expect(page.locator('.story-scene h1')).toContainText(`${lessonId}차시`);
    await expect(page.locator('.story-char')).toHaveCount(2);
    await expect
      .poll(() =>
        page.locator('.story-scene img').evaluateAll((images) =>
          images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)
        )
      )
      .toBe(true);

    await page.getByRole('button', { name: /건너뛰기/ }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();
    await page.getByRole('button', { name: /시작/ }).click();
    await expect(page.locator(`.game-wrap.g${lessonId < 4 ? lessonId : String(lessonId).padStart(2, '0')}-scene`)).toBeVisible();
  }

  expect(failures).toEqual([]);
});
