import './style.css';
import { SceneManager } from './core/scene';
import { titleScene } from './scenes/title';
import { worldmapScene } from './scenes/worldmap';
import { storyScene } from './scenes/story';
import { gameScene } from './scenes/game';
import { resultScene } from './scenes/result';
import { soonScene } from './scenes/soon';

const stage = document.getElementById('stage')!;

// ---------- 1280x800 스테이지를 화면에 맞게 스케일 ----------
// 세로모드에서도 화면에 맞춰 축소되어 그대로 플레이 가능 (가로 권장 안내만 표시)
let hintTimer: number | null = null;

function fit() {
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
  (stage as HTMLElement).style.transform = `scale(${scale})`;
  const portrait = window.innerHeight > window.innerWidth;
  const wasPortrait = document.body.classList.contains('portrait');
  document.body.classList.toggle('portrait', portrait);

  // 세로모드로 처음/다시 진입할 때만 안내 토스트를 4초간 표시
  const hint = document.getElementById('rotate-hint');
  if (hint && portrait && !wasPortrait) {
    hint.classList.add('show');
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = window.setTimeout(() => hint.classList.remove('show'), 4000);
  }
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);
fit();

// ---------- 씬 등록 ----------
const mgr = new SceneManager(stage as HTMLElement);
mgr.register('title', titleScene(mgr));
mgr.register('worldmap', worldmapScene(mgr));
mgr.register('story', storyScene(mgr));
mgr.register('game', gameScene(mgr));
mgr.register('result', resultScene(mgr));
mgr.register('soon', soonScene(mgr));
mgr.go('title');

// ---------- PWA 서비스워커 ----------
if ('serviceWorker' in navigator && !location.hostname.includes('localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* 오프라인 캐시는 선택 기능 - 실패해도 게임은 동작 */
    });
  });
}
