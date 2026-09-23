import { expect, test } from '@playwright/test';

test('title to world map renders all lesson islands without browser errors', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });

  await page.goto('/');
  await expect(page.locator('.title-scene h1')).toBeVisible();
  await page.getByRole('button', { name: /모험 시작|이어서 모험/ }).click();
  await expect(page.locator('.map-scene')).toBeVisible();
  await expect(page.locator('button.island')).toHaveCount(12);

  expect(failures).toEqual([]);
});
