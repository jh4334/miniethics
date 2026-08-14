// 오프라인 캐시 서비스워커 v2
// - 같은 출처의 정상(200) 응답만 캐시
// - 런타임 캐시를 최대 160개로 제한(오래된 것부터 정리)해 저장소 무한 누적 방지
const CACHE_VERSION = 'miniethics-v2';
const RUNTIME_LIMIT = 160;
const PRECACHE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
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

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= RUNTIME_LIMIT) return;
  // 앞쪽(오래된) 항목부터 제거
  for (const key of keys.slice(0, keys.length - RUNTIME_LIMIT)) {
    await cache.delete(key);
  }
}

// 네트워크 우선, 실패 시 캐시 (수업 중 오프라인 대비)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return; // 타 출처는 관여하지 않음

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches
            .open(CACHE_VERSION)
            .then(async (cache) => {
              await cache.put(e.request, copy);
              await trimCache(cache);
            })
            .catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
