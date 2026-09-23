import { expect, test } from '@playwright/test';

test('invalid lesson navigation renders one recovery action and returns to the map', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });

  await page.goto('/');
  await page.evaluate("import('/src/main.ts').then(({ mgr }) => mgr.go('story', { lessonId: 999 }))");

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText('화면을 여는 중 문제가 생겼어요');
  await expect(alert).not.toContainText('UnknownLessonError');
  await page.getByRole('button', { name: '🗺️ 월드맵으로 돌아가기' }).click();
  await expect(page.locator('.map-scene')).toBeVisible();
  expect(failures).toEqual([]);
});
