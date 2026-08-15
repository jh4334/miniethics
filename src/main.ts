import './style.css';
import { SceneManager } from './core/scene';
import { titleScene } from './scenes/title';
import { worldmapScene } from './scenes/worldmap';
import { storyScene } from './scenes/story';
import { gameScene } from './scenes/game';
import { resultScene } from './scenes/result';
import { soonScene } from './scenes/soon';
import { renderSceneError } from './ui/scene-error';

const stage = requireStage();

function requireStage(): HTMLElement {
  const element = document.getElementById('stage');
  if (!element) throw new Error('stage element is missing');
  return element;
}

// ---------- 1280x800 스테이지를 화면에 맞게 스케일 ----------
// 세로모드에서도 화면에 맞춰 축소되어 그대로 플레이 가능 (가로 권장 안내만 표시)
let hintTimer: number | null = null;

function fit() {
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
  stage.style.transform = `scale(${scale})`;
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
export const mgr = new SceneManager(stage);
mgr.register('title', titleScene(mgr));
mgr.register('worldmap', worldmapScene(mgr));
mgr.register('story', storyScene(mgr));
mgr.register('game', gameScene(mgr));
mgr.register('result', resultScene(mgr));
mgr.register('soon', soonScene(mgr));
mgr.onError = (id, error) => {
  logError(error instanceof Error ? error.message : String(error));
  const destination = id === 'worldmap' ? 'title' : 'worldmap';
  renderSceneError(stage, destination, () => mgr.go(destination));
};
// ---------- 뒤로가기: 앱 이탈 대신 상위 화면으로 ----------
// 태블릿/폰의 뒤로가기(브라우저 back)가 앱을 종료시키지 않고
// 게임→월드맵→타이틀 순서로 한 단계씩 올라가게 한다
import type { SceneId } from './core/scene';
const PARENT: Record<SceneId, SceneId | null> = {
  title: null,
  worldmap: 'title',
  story: 'worldmap',
  game: 'worldmap',
  result: 'worldmap',
  soon: 'worldmap'
};
let popNav = false;
mgr.onNavigate = (id) => {
  if (!popNav && id !== 'title') history.pushState({ scene: id }, '');
};
window.addEventListener('popstate', () => {
  // 게임 중 뒤로가기는 즉시 이동하지 않고, 게임 씬의 이탈 확인 대화상자로 위임한다
  if (mgr.current === 'game') {
    history.pushState({ scene: 'game' }, ''); // 소비된 히스토리 엔트리 복원
    window.dispatchEvent(new CustomEvent('miniethics-back'));
    return;
  }
  const parent = mgr.current ? PARENT[mgr.current] : null;
  if (!parent) return; // 타이틀에서는 브라우저 기본 동작(이탈) 허용
  popNav = true;
  try {
    mgr.go(parent);
  } finally {
    popNav = false;
  }
});

mgr.go('title');

// ---------- 전역 에러 복구 ----------
// 게임 도중 예기치 못한 오류가 나도 멈추지 않고 월드맵으로 돌아갈 수 있게 한다
let errorShown = false;

/** 최근 오류 5건을 저장해 두어 교사/개발자가 설정 화면에서 확인할 수 있게 한다 */
function logError(detail: string) {
  try {
    const KEY = 'miniethics-errlog';
    const log: { t: string; m: string }[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    log.push({ t: new Date().toISOString(), m: detail.slice(0, 300) });
    localStorage.setItem(KEY, JSON.stringify(log.slice(-5)));
  } catch {
    /* 로그 실패는 무시 */
  }
}

function showErrorRecovery(e?: Event) {
  const detail =
    e instanceof ErrorEvent
      ? e.message
      : e instanceof PromiseRejectionEvent
        ? String(e.reason)
        : 'unknown';
  logError(detail);
  if (errorShown) return;
  errorShown = true;
  const overlay = document.createElement('div');
  overlay.className = 'error-recovery';
  overlay.innerHTML = `
    <div class="card error-card">
      <div style="font-size:64px">😵</div>
      <h2>앗, 문제가 생겼어요!</h2>
      <p>걱정 마세요. 지금까지의 별과 진행은 안전하게 저장되어 있어요.</p>
    </div>`;
  const btn = document.createElement('button');
  btn.className = 'btn big yellow';
  btn.textContent = '🗺️ 월드맵으로 돌아가기';
  btn.addEventListener('click', () => {
    errorShown = false;
    overlay.remove();
    try {
      mgr.go('worldmap');
    } catch {
      location.reload();
    }
  });
  overlay.querySelector('.error-card')!.appendChild(btn);
  stage.appendChild(overlay);
}
window.addEventListener('error', showErrorRecovery);
window.addEventListener('unhandledrejection', showErrorRecovery);

// ---------- PWA 서비스워커 ----------
if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '[::1]') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => registration.update())
      .catch((error: unknown) => {
        if (import.meta.env.DEV) console.warn('[miniethics] service worker unavailable', error);
      });
  });
}
