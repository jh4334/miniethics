import type { SceneManager, SceneParams } from '../core/scene';
import { el, button } from '../ui/components';
import { getLesson } from '../data/curriculum';
import { getGame } from '../games/registry';
import { audio } from '../core/audio';

export function gameScene(mgr: SceneManager) {
  return (root: HTMLElement, params: SceneParams) => {
    const lesson = getLesson(Number(params.lessonId));
    const game = getGame(lesson.id);
    if (!game) {
      mgr.go('soon', { lessonId: lesson.id });
      return;
    }

    const scene = el('div', 'scene');
    const container = el('div', 'game-wrap');
    scene.appendChild(container);
    root.appendChild(scene);

    let cleanup: void | (() => void) = undefined;
    let done = false;

    // 게임 방법 안내 오버레이 → 확인 후 게임 마운트
    const overlay = el('div', 'howto-overlay');
    const card = el('div', 'card howto-card');
    card.innerHTML = `
      <h2>🎮 ${lesson.gameName}</h2>
      <div class="howto-icons">${lesson.howtoIcons}</div>
      <div class="howto-desc">${lesson.howto}</div>`;
    const start = button('시작! 🚀', () => {
      overlay.remove();
      cleanup = game.mount(container, {
        audio,
        finish(score: number) {
          if (done) return;
          done = true;
          mgr.go('result', { lessonId: lesson.id, score: Math.round(score) });
        },
        quit() {
          // 실수로 이탈 버튼을 눌러 진행을 날리지 않도록 확인을 거친다
          if (done || scene.querySelector('.quit-confirm')) return;
          const confirm = el('div', 'quit-confirm');
          const card = el('div', 'card quit-card');
          card.innerHTML = `
            <div style="font-size:56px">🤔</div>
            <h2>정말 그만둘까?</h2>
            <p>지금 하던 게임 내용은 사라져요.<br>(지금까지 모은 별은 안전해요!)</p>`;
          const btns = el('div', 'quit-btns');
          btns.append(
            button('계속 할래! 💪', () => confirm.remove(), 'btn big mint'),
            button('그만둘래', () => {
              if (done) return;
              done = true;
              mgr.go('worldmap');
            }, 'btn ghost')
          );
          card.appendChild(btns);
          confirm.appendChild(card);
          scene.appendChild(confirm);
        }
      });
    }, 'btn big yellow');
    card.appendChild(start);
    overlay.appendChild(card);
    scene.appendChild(overlay);

    return () => {
      if (cleanup) cleanup();
    };
  };
}
