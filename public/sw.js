const SHELL_CACHE = 'miniethics-shell-v2';
const RUNTIME_CACHE = 'miniethics-runtime-v2';
const RUNTIME_LIMIT = 160;
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith('miniethics-') && key !== SHELL_CACHE && key !== RUNTIME_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trimRuntimeCache(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - RUNTIME_LIMIT))) {
    await cache.delete(key);
  }
}

function isCacheable(response) {
  return response.ok && response.type === 'basic';
}

function isAssetRequest(request) {
  return (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image'
  );
}

async function cacheRuntime(request, response) {
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
  await trimRuntimeCache(cache);
}

async function respondToNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const fallback = await caches.match('./index.html');
    return fallback ?? Response.error();
  }
}

async function respondToAsset(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) {
    try {
      await cacheRuntime(request, response);
    } catch (error) {
      console.warn('[miniethics] runtime cache write failed', error);
    }
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(respondToNavigation(request));
    return;
  }
  if (isAssetRequest(request)) event.respondWith(respondToAsset(request));
});
