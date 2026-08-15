import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openGame(page: Page, lessonId: number) {
  await page.goto('/');
  await page.evaluate((id) => import('/src/main.ts').then(({ mgr }) => mgr.go('game', { lessonId: id })), lessonId);
  await page.getByRole('button', { name: /시작/ }).click();
}

async function seriousViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
}

test('game04 characterization preserves all six cases, score, and finish', async ({ page }) => {
  await openGame(page, 4);
  const accounts = ['축구광팬99', '동네소식통', '특종헌터', '급식왕', '찐뉴스TV', '누군지몰라요'];
  const real = [false, true, false, true, false, false];

  for (let index = 0; index < accounts.length; index++) {
    await expect(page.locator('.g04-account')).toContainText(accounts[index]);
    await expect(page.locator('.g04-badge')).toHaveText(`사건 ${index + 1}/6`);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: real[index] ? /진짜야/ : /가짜야/ }).click();
    await expect(page.locator('.g04-next')).toBeVisible({ timeout: 2_500 });
    await page.locator('.g04-next').click();
  }

  const result = page.locator('.game-over-overlay');
  await expect(result).toContainText('정확한 판정: 6 / 6');
  await expect(result).toContainText('발견한 단서: 0 /');
  await page.getByRole('button', { name: '결과 보기 🏆', exact: true }).click();
  await expect(page.locator('.summary-card')).toBeVisible();
});

async function revealEvidence(page: Page) {
  await page.getByRole('button', { name: /증거를 살펴보자/ }).click();
  const cards = page.locator('.g10-ev');
  await expect(cards).toHaveCount(3);
  for (let index = 0; index < 3; index++) await cards.nth(index).click();
  await page.getByRole('button', { name: /판결 준비/ }).click();
}

async function placePieces(page: Page, name: string, count: number) {
  const card = page.locator('.g10-def').filter({ hasText: name }).first();
  for (let index = 0; index < count; index++) {
    await card.click();
    await expect(page.locator('.g10-fly')).toHaveCount(0, { timeout: 2_000 });
  }
}

test('game10 characterization preserves all phases, cases, scoring, and finish', async ({ page }) => {
  await openGame(page, 10);
  const cases = [
    { title: '노란 신호 사건', placements: [['만든 회사', 3], ['차 주인', 3]] as const },
    { title: '진흙 센서 사건', placements: [['차 주인', 6]] as const },
    { title: '낡은 지도 사건', placements: [['도로관리소', 3], ['만든 회사', 3]] as const }
  ];

  for (let index = 0; index < cases.length; index++) {
    await expect(page.locator('.g10-title')).toContainText(cases[index].title);
    await revealEvidence(page);
    for (const [name, count] of cases[index].placements) await placePieces(page, name, count);
    await page.getByRole('button', { name: /^판결!/ }).click();
    await expect(page.locator('.g10-casescore')).toHaveText('이번 사건 점수 100점');
    await page.getByRole('button', { name: index === 2 ? /최종 판결 보기/ : /다음 사건/ }).click();
  }

  await expect(page.locator('.g10-over-score')).toHaveText('100점');
  await page.getByRole('button', { name: '결과 보기 🏆', exact: true }).click();
  await expect(page.locator('.summary-card')).toBeVisible();
});

test('game10 evidence and responsibility cards support keyboard activation', async ({ page }) => {
  await openGame(page, 10);
  await page.getByRole('button', { name: /증거를 살펴보자/ }).click();
  await page.getByRole('button', { name: '그만두기' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.g10-ev').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.g10-ev').first()).toHaveClass(/flip/);

  await page.locator('.g10-ev').nth(1).click();
  await page.locator('.g10-ev').nth(2).click();
  await page.getByRole('button', { name: /판결 준비/ }).click();
  await page.getByRole('button', { name: '그만두기' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.g10-def').first()).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('.g10-token.empty')).toHaveCount(1, { timeout: 1_500 });
});

test('game04 and game10 retain 44px physical primary targets on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openGame(page, 4);
  const marker = await page.locator('.g04-marker').first().boundingBox();
  const verdict = await page.getByRole('button', { name: /진짜야/ }).boundingBox();
  expect(marker?.width).toBeGreaterThanOrEqual(43.5);
  expect(marker?.height).toBeGreaterThanOrEqual(43.5);
  expect(verdict?.height).toBeGreaterThanOrEqual(43.5);

  await openGame(page, 10);
  const action = await page.getByRole('button', { name: /증거를 살펴보자/ }).boundingBox();
  expect(action?.height).toBeGreaterThanOrEqual(43.5);
});

test('game04 and game10 interactive states have no serious axe violations', async ({ page }) => {
  await openGame(page, 4);
  expect(await seriousViolations(page)).toEqual([]);

  await openGame(page, 10);
  await page.getByRole('button', { name: /증거를 살펴보자/ }).click();
  expect(await seriousViolations(page)).toEqual([]);
});
