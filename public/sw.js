// 간단한 오프라인 캐시 서비스워커
// 배포마다 CACHE_VERSION을 올리면 이전 캐시가 정리됩니다.
const CACHE_VERSION = 'miniethics-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(['./', './index.html'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패 시 캐시 (수업 중 오프라인 대비)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
