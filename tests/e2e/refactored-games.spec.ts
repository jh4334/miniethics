import { expect, test } from '@playwright/test';

async function openGame(page: import('@playwright/test').Page, lessonId: number) {
  await page.goto('/');
  await page.evaluate((id) => import('/src/main.ts').then(({ mgr }) => mgr.go('game', { lessonId: id })), lessonId);
  await page.getByRole('button', { name: /시작/ }).click();
}

test('deepfake investigation still reveals a clue and consumes one lens', async ({ page }) => {
  await openGame(page, 4);

  await page.getByRole('button', { name: '선수의 오른손 조사하기' }).click();
  await expect(page.locator('.g04-zoom')).toBeVisible();
  await expect(page.locator('.g04-notes')).toContainText('손가락이 여섯 개');
  await expect(page.locator('.g04-lens')).toHaveText('🔍×2');
});

test('responsibility court still unlocks judgment after all evidence is read', async ({ page }) => {
  await openGame(page, 10);

  await page.getByRole('button', { name: /증거를 살펴보자/ }).click();
  const evidenceCards = page.locator('.g10-ev');
  await expect(evidenceCards).toHaveCount(3);
  for (const card of await evidenceCards.all()) await card.click();

  await expect(page.getByRole('button', { name: /판결 준비/ })).toHaveClass(/yellow/);
  await expect(page.locator('.g10-say')).toContainText('증거를 다 봤구나');
});
