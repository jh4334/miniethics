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
function fit() {
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
  (stage as HTMLElement).style.transform = `scale(${scale})`;
  document.body.classList.toggle('portrait', window.innerHeight > window.innerWidth);
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
