// 서비스 워커: 오프라인에서도 동작하도록 앱 파일 캐시
const CACHE = 'ai-ethics-game-v1';
const CORE = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/main.js',
  'js/state.js',
  'js/audio.js',
  'js/data/lessons.js',
  'js/data/assets.js',
  'js/games/engine.js',
  'js/games/g01_classify.js',
  'js/games/g02_training.js',
  'js/games/g03_bias.js',
  'js/games/g04_bubble.js',
  'js/games/g05_privacy.js',
  'js/games/g06_deepfake.js',
  'js/games/g07_copyright.js',
  'js/games/g08_prompt.js',
  'js/games/g09_think.js',
  'js/games/g10_inclusive.js',
  'js/games/g11_driving.js',
  'js/games/g12_goldenbell.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 네트워크 우선, 실패하면 캐시 (업데이트가 잘 반영되도록)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
