import type { SceneManager, SceneParams } from '../core/scene';
import { el, button } from '../ui/components';
import { getLessonFromParam } from '../data/curriculum';

export function soonScene(mgr: SceneManager) {
  return (root: HTMLElement, params: SceneParams) => {
    const lesson = getLessonFromParam(params.lessonId);
    const scene = el('div', 'scene soon-scene');
    scene.innerHTML = `
      <div class="soon-emoji">${lesson.emoji}</div>
      <h2>${lesson.id}차시 · ${lesson.title}</h2>
      <p>「${lesson.gameName}」은 지금 열심히 만들고 있어요!<br>다음 업데이트를 기다려 주세요 🛠️</p>`;
    scene.appendChild(button('🗺️ 월드맵으로 돌아가기', () => mgr.go('worldmap'), 'btn big'));
    root.appendChild(scene);
  };
}
