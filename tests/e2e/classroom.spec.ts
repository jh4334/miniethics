import { expect, test, type Page } from '@playwright/test';

function collectFailures(page: Page): string[] {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  return failures;
}

async function openMap(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /모험/ }).click();
  await expect(page.locator('.map-scene')).toBeVisible();
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

test('a lesson first cleared today keeps the next island closed with a moon notice', async ({ page }) => {
  const failures = collectFailures(page);
  await page.addInitScript((day) => {
    localStorage.setItem('miniethics-save-v1', JSON.stringify({
      records: { 1: { stars: 2, bestScore: 70, quizBest: 2, cleared: true, clearedAt: day } }
    }));
  }, today());
  await openMap(page);

  const island2 = page.getByRole('button', { name: /^2차시.*다음 수업 날/ });
  await expect(island2).toBeDisabled();
  await expect(island2.locator('.island-next')).toHaveText(/다음 수업 날/);
  // 현재 위치 표시는 마지막으로 열린 1차시에 머문다
  await expect(page.getByRole('button', { name: /^1차시/ })).toHaveAttribute('aria-current', 'step');
  expect(failures).toEqual([]);
});

test('teacher creates a PIN, opens lessons, and turns the daily rule off without touching stars', async ({ page }) => {
  const failures = collectFailures(page);
  await page.addInitScript((day) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('miniethics-save-v1', JSON.stringify({
      records: { 1: { stars: 2, bestScore: 70, quizBest: 2, cleared: true, clearedAt: day } }
    }));
  }, today());
  await openMap(page);

  await page.getByRole('button', { name: '설정' }).click();
  await page.getByRole('button', { name: /선생님 메뉴/ }).click();
  await page.getByLabel('새 PIN 4자리').fill('4321');
  await page.getByRole('button', { name: 'PIN 저장' }).click();

  const dialog = page.getByRole('dialog', { name: '선생님 메뉴' });
  for (let i = 0; i < 4; i += 1) await dialog.getByRole('button', { name: '열어 둘 차시 늘리기' }).click();
  await expect(dialog.locator('.teacher-value')).toHaveText('4차시');
  await dialog.getByRole('button', { name: '켜짐' }).click();
  await expect(dialog.getByRole('button', { name: '꺼짐' })).toHaveAttribute('aria-pressed', 'false');
  await dialog.getByRole('button', { name: '닫기' }).click();

  await expect(page.getByRole('button', { name: /^4차시.*도전 가능/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /^5차시.*잠김/ })).toBeDisabled();
  await expect(page.locator('.map-total')).toContainText('⭐ 2 / 36');
  await expect(page.locator('.map-total')).toContainText('🏝️ 1 / 12');

  // 다시 열면 PIN을 묻고, 틀리면 들어갈 수 없다
  await page.getByRole('button', { name: '설정' }).click();
  await page.getByRole('button', { name: /선생님 메뉴/ }).click();
  await page.getByLabel('선생님 PIN').fill('0000');
  await page.getByRole('button', { name: '확인' }).click();
  await expect(page.locator('.pin-msg')).toHaveText('PIN이 맞지 않아요.');
  await expect(page.getByRole('button', { name: /기록 처음부터/ })).toHaveCount(0);
  await page.getByLabel('선생님 PIN').fill('4321');
  await page.getByRole('button', { name: '확인' }).click();
  await expect(page.getByRole('button', { name: /기록 처음부터/ })).toBeVisible();
  expect(failures).toEqual([]);
});

test('leaving the app mid-game stops the game and offers a clean retry', async ({ page }) => {
  const failures = collectFailures(page);
  await openMap(page);
  await page.getByRole('button', { name: /^1차시/ }).click();
  await page.getByRole('button', { name: /건너뛰기/ }).click();
  await page.getByRole('button', { name: /게임 시작/ }).click();
  await page.getByRole('button', { name: /시작/ }).click();
  await expect(page.locator('.game-wrap.g1-scene')).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  await expect(page.getByRole('heading', { name: '게임이 잠시 멈췄어요' })).toBeVisible();
  await expect(page.locator('.game-wrap')).toBeEmpty();

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
  });
  await page.getByRole('button', { name: /다시 도전/ }).click();
  await page.getByRole('button', { name: /시작/ }).click();
  await expect(page.locator('.game-wrap.g1-scene')).toBeVisible();
  expect(failures).toEqual([]);
});
