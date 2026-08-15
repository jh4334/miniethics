import { expect, test } from '@playwright/test';

for (let lessonId = 1; lessonId <= 12; lessonId += 1) {
  test(`lesson ${lessonId} opens from its map island and mounts its registered game`, async ({ page }) => {
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(message.text());
    });

    const records = Object.fromEntries(
      Array.from({ length: lessonId - 1 }, (_, index) => [
        String(index + 1),
        { stars: 1, bestScore: 50, quizBest: 1, cleared: true }
      ])
    );
    await page.addInitScript((seed) => {
      localStorage.setItem('miniethics-save-v1', JSON.stringify({ records: seed }));
    }, records);
    await page.goto('/');
    await page.getByRole('button', { name: /모험/ }).click();
    await page.getByRole('button', { name: new RegExp(`^${lessonId}차시`) }).click();

    await expect(page.locator('.story-scene h1')).toContainText(`${lessonId}차시`);
    await expect(page.locator('.story-char')).toHaveCount(2);
    await expect
      .poll(() =>
        page.locator('.story-scene img').evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
          )
        )
      )
      .toBe(true);

    await page.getByRole('button', { name: /건너뛰기/ }).click();
    await page.getByRole('button', { name: /게임 시작/ }).click();
    await page.getByRole('button', { name: /시작/ }).click();
    const gameClass = lessonId < 4 ? `g${lessonId}-scene` : `g${String(lessonId).padStart(2, '0')}-scene`;
    await expect(page.locator(`.game-wrap.${gameClass}`)).toBeVisible();
    expect(failures, `lesson ${lessonId} emitted browser errors`).toEqual([]);
  });
}
