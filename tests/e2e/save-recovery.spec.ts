import { expect, test, type Page } from '@playwright/test';

function collectFailures(page: Page): string[] {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  return failures;
}

test('valid progress survives beside a malformed lesson record', async ({ page }) => {
  const failures = collectFailures(page);
  await page.addInitScript(() => {
    localStorage.setItem('miniethics-save-v1', JSON.stringify({
      records: {
        1: { stars: 2, bestScore: 81, quizBest: 2, cleared: true },
        2: { stars: 'bad', bestScore: 40, quizBest: 1, cleared: true }
      }
    }));
  });

  await page.goto('/');
  await page.getByRole('button', { name: /모험 시작|이어서 모험/ }).click();

  await expect(page.locator('.map-scene')).toBeVisible();
  await expect(page.locator('button.island').nth(1)).not.toHaveClass(/locked/);
  await expect(page.locator('.map-total')).toContainText('⭐ 2 / 36');
  expect(failures).toEqual([]);
});

test('corrupt JSON starts safely with an empty progress map', async ({ page }) => {
  const failures = collectFailures(page);
  await page.addInitScript(() => {
    localStorage.setItem('miniethics-save-v1', '{not-json');
  });

  await page.goto('/');
  await page.getByRole('button', { name: /모험 시작|이어서 모험/ }).click();

  await expect(page.locator('.map-scene')).toBeVisible();
  await expect(page.locator('button.island').first()).not.toHaveClass(/locked/);
  await expect(page.locator('.map-total')).toContainText('⭐ 0 / 36');
  expect(failures).toEqual([]);
});
