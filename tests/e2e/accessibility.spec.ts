import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function seriousViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`);
}

test('core scenes expose landmarks, focus, and locked lesson semantics', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('main#stage')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#stage')).toBeFocused();

  await page.getByRole('button', { name: /모험 시작|이어서 모험/ }).press('Enter');
  await expect(page.locator('.map-scene h1')).toBeFocused();
  await expect(page.locator('button.island.locked').first()).toBeDisabled();
  await expect(page.locator('button.island.current')).toHaveAttribute('aria-current', 'step');
  await expect(page.getByRole('button', { name: /소리/ })).toHaveAttribute('aria-label', /소리 (켜기|끄기)/);
});

test('keyboard-only journey reaches the first game', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /모험 시작|이어서 모험/ }).press('Enter');
  await page.locator('button.island').first().press('Enter');

  await expect(page.locator('.story-scene h1')).toBeFocused();
  await expect(page.locator('.dialog-box')).toHaveAttribute('role', 'button');
  await expect(page.locator('.dialog-text')).toHaveAttribute('aria-live', 'polite');
  await page.getByRole('button', { name: /건너뛰기/ }).press('Enter');
  await expect(page.getByRole('button', { name: /게임 시작/ })).toBeFocused();
  await page.getByRole('button', { name: /게임 시작/ }).press('Enter');
  await page.getByRole('button', { name: /시작/ }).press('Enter');
  await expect(page.locator('.game-wrap.g1-scene')).toBeVisible();
});

test('reduced motion resolves story text immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate("import('/src/main.ts').then(({ mgr }) => mgr.go('story', { lessonId: 1 }))");

  const text = page.locator('.dialog-text');
  await expect(text).not.toBeEmpty();
  const content = await text.textContent();
  await page.waitForTimeout(80);
  await expect(text).toHaveText(content ?? '');
  const running = await page.locator('.story-scene').evaluate((scene) =>
    scene.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length
  );
  expect(running).toBe(0);
});

test('quiz feedback disables choices, announces the result, and moves focus', async ({ page }) => {
  await page.goto('/');
  await page.evaluate("import('/src/main.ts').then(({ mgr }) => mgr.go('result', { lessonId: 1, score: 80 }))");
  await page.getByRole('button', { name: /확인 퀴즈/ }).press('Enter');

  await expect(page.locator('.quiz-card h3')).toBeFocused();
  await page.locator('.quiz-choice').first().press('Enter');
  expect(await page.locator('.quiz-choice').evaluateAll((choices) => choices.every((choice) => choice instanceof HTMLButtonElement && choice.disabled))).toBe(true);
  await expect(page.locator('.quiz-explain')).toHaveAttribute('role', 'status');
  await expect(page.getByRole('button', { name: /다음 문제/ })).toBeFocused();
});

test('title, map, story, and result have no serious axe violations', async ({ page }) => {
  await page.goto('/');
  expect(await seriousViolations(page)).toEqual([]);

  await page.getByRole('button', { name: /모험 시작|이어서 모험/ }).click();
  expect(await seriousViolations(page)).toEqual([]);

  await page.locator('button.island').first().click();
  expect(await seriousViolations(page)).toEqual([]);

  await page.evaluate("import('/src/main.ts').then(({ mgr }) => mgr.go('result', { lessonId: 1, score: 80 }))");
  expect(await seriousViolations(page)).toEqual([]);
});
