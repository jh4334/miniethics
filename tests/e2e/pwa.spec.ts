import { expect, test } from '@playwright/test';

async function clearWorkerState(page: import('@playwright/test').Page): Promise<void> {
  await page.context().setOffline(false);
  await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  });
}

test.afterEach(async ({ page }) => {
  await clearWorkerState(page);
});

test('activation removes only stale miniethics caches', async ({ page }) => {
  await page.route('**/', (route) => route.fulfill({ contentType: 'text/html', body: '<main>blank</main>' }));
  await page.goto('/');
  await page.evaluate(async () => {
    await caches.open('third-party-cache');
    await caches.open('miniethics-runtime-v1');
    await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => caches.keys().then((keys) => !keys.includes('miniethics-runtime-v1')));
  const keys = await page.evaluate(() => caches.keys());

  expect(keys).toContain('third-party-cache');
  expect(keys).not.toContain('miniethics-runtime-v1');
});

test('visited navigation works offline without returning HTML for a missing image', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await expect(page.locator('.title-scene')).toBeVisible();

  await page.context().setOffline(true);
  await page.reload();
  await expect(page.locator('.title-scene')).toBeVisible();
  const missing = await page.evaluate(async () => {
    try {
      const response = await fetch('./missing-never-cached.png');
      return { ok: response.ok, type: response.headers.get('content-type') };
    } catch {
      return { ok: false, type: null };
    }
  });

  expect(missing.ok).toBe(false);
  expect(missing.type ?? '').not.toContain('text/html');
});
