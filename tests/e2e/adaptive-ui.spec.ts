import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { name: 'phone-portrait', width: 375, height: 812 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1280, height: 800 }
] as const;

async function expectContained(page: Page) {
  const state = await page.evaluate(() => {
    const stage = document.querySelector<HTMLElement>('#stage');
    const viewport = document.querySelector<HTMLElement>('#viewport');
    const buttons = [...document.querySelectorAll<HTMLElement>('button:not([disabled]), [role="button"]')]
      .filter((element) => getComputedStyle(element).visibility !== 'hidden')
      .map((element) => {
        const box = element.getBoundingClientRect();
        return { width: box.width, height: box.height, text: element.textContent?.trim().slice(0, 30) };
      });
    if (!stage || !viewport) throw new Error('adaptive shell is missing');
    const stageBox = stage.getBoundingClientRect();
    const viewportBox = viewport.getBoundingClientRect();
    return {
      stageInside:
        stageBox.left >= viewportBox.left - 1 &&
        stageBox.right <= viewportBox.right + 1 &&
        stageBox.top >= viewportBox.top - 1 &&
        stageBox.bottom <= viewportBox.bottom + 1,
      logicalSize: { width: stage.offsetWidth, height: stage.offsetHeight },
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      undersized: buttons.filter((button) => button.width < 43.5 || button.height < 43.5)
    };
  });

  expect(state.stageInside).toBe(true);
  expect(state.logicalSize).toEqual({ width: 1280, height: 800 });
  expect(state.overflowX).toBe(false);
  expect(state.undersized).toEqual([]);
}

for (const viewport of viewports) {
  test(`${viewport.name} keeps the title, map, and Korean story usable`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    if (viewport.width >= viewport.height) {
      await expect(page.locator('#rotate-hint')).toBeHidden();
    }
    await expectContained(page);

    await page.getByRole('button', { name: /모험 시작|이어서 모험/ }).click();
    await expectContained(page);
    await page.locator('button.island').first().click();
    await expect(page.locator('.dialog-text')).toContainText('여기는 배움의 섬');
    await expectContained(page);
  });
}

test('a 200 percent equivalent viewport retains content and touch targets', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 400 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /모험 시작|이어서 모험/ })).toBeVisible();
  await expectContained(page);
});

test('higher contrast and forced colors retain visible focus', async ({ page }) => {
  await page.emulateMedia({ contrast: 'more', forcedColors: 'active' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await expect(page.locator('.skip-link')).toHaveCSS('outline-style', 'solid');
});

test('the viewport allows browser zoom and the install policy supports portrait play', async ({ page }) => {
  await page.goto('/');
  const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(viewport).not.toContain('user-scalable=no');
  expect(viewport).not.toContain('maximum-scale=1');

  const manifest = await page.request.get('/manifest.webmanifest');
  expect((await manifest.json()).orientation).toBe('any');
});
