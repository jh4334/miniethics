const SHELL_CACHE = 'miniethics-shell-v3';
const RUNTIME_CACHE = 'miniethics-runtime-v3';
const RUNTIME_LIMIT = 160;
// 학교 와이파이가 느리거나 30대가 동시에 접속할 때, 캐시가 있으면 이 시간 이상 기다리지 않는다
const NAVIGATION_TIMEOUT_MS = 3000;
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
  const network = fetch(request);
  const fallback = await caches.match('./index.html');
  if (!fallback) {
    try {
      return await network;
    } catch {
      return Response.error();
    }
  }
  // 네트워크 우선이되, 응답이 늦으면 캐시로 즉시 시작한다. 늦게 온 새 셸은 다음 실행을 위해 캐시에 반영한다.
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), NAVIGATION_TIMEOUT_MS);
  });
  const fresh = network.then(
    async (response) => {
      if (isCacheable(response)) {
        try {
          const cache = await caches.open(SHELL_CACHE);
          await cache.put('./index.html', response.clone());
        } catch {
          /* 캐시 갱신 실패는 무시 */
        }
      }
      return response;
    },
    () => null
  );
  const winner = await Promise.race([fresh, timeout]);
  clearTimeout(timer);
  return winner ?? fallback;
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
