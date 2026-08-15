import type { SceneManager, SceneParams } from '../core/scene';
import { el, button } from '../ui/components';
import { getLessonFromParam } from '../data/curriculum';
import { charImg, sceneBg } from '../assets-manifest';
import { audio } from '../core/audio';
import { createLifecycleScope } from '../core/lifecycle';

export function storyScene(mgr: SceneManager) {
  return (root: HTMLElement, params: SceneParams) => {
    const lesson = getLessonFromParam(params.lessonId);
    const scene = el('div', 'scene story-scene');
    scene.style.background = `linear-gradient(180deg, ${lesson.color}55 0%, #fff8e6 100%)`;
    // 차시별 배경 이미지 (public/assets/gameNN/bg.png가 있으면 자동 적용)
    scene.appendChild(sceneBg(`./assets/game${String(lesson.id).padStart(2, '0')}/bg.png`));

    // 등장인물
    const floor = el('div', 'story-stagefloor');
    const leftChar = charImg(lesson.chars.left, 'story-char', '에티');
    const rightChar = charImg(lesson.chars.right, 'story-char', lesson.rightName);
    floor.append(leftChar, rightChar);
    scene.appendChild(floor);

    // HUD
    const hud = el('div', 'hud');
    const back = button('🗺️', () => mgr.go('worldmap'), 'icon-btn', '월드맵으로 가기');
    hud.append(
      back,
      el('div', 'hud-title', `${lesson.id}차시 · ${lesson.title}`),
      el('div', 'spacer')
    );
    const skip = button('건너뛰기 ⏩', () => showMission(), 'btn ghost');
    skip.style.fontSize = '20px';
    skip.style.padding = '10px 22px';
    hud.append(skip);
    scene.appendChild(hud);

    // 대화 상자
    const box = el('div', 'dialog-box');
    const speakerTag = el('div', 'speaker');
    const textEl = el('div', 'dialog-text');
    const hint = el('div', 'next-hint', '▼ 화면을 눌러 계속');
    box.append(speakerTag, textEl, hint);
    scene.appendChild(box);

    let idx = 0;
    const lifecycle = createLifecycleScope();
    let typing: number | null = null;
    let missionShown = false;

    function showLine() {
      const line = lesson.intro[idx];
      speakerTag.textContent = line.speaker;
      leftChar.classList.toggle('dim', line.side !== 'left');
      rightChar.classList.toggle('dim', line.side !== 'right');
      leftChar.classList.toggle('talking', line.side === 'left');
      rightChar.classList.toggle('talking', line.side === 'right');

      // 타자기 효과 (태그 깨짐 방지를 위해 전체 HTML을 점진 노출)
      const plain = line.text;
      let i = 0;
      textEl.innerHTML = '';
      lifecycle.clearInterval(typing);
      typing = lifecycle.setInterval(() => {
        i += 2;
        textEl.innerHTML = plain.slice(0, i);
        if (i >= plain.length) {
          textEl.innerHTML = plain;
          lifecycle.clearInterval(typing);
          typing = null;
        }
      }, 24);
      audio.pop();
    }

    function advance() {
      if (missionShown) return;
      const line = lesson.intro[idx];
      // 타이핑 중이면 즉시 전체 표시
      if (typing) {
        lifecycle.clearInterval(typing);
        typing = null;
        textEl.innerHTML = line.text;
        return;
      }
      if (idx < lesson.intro.length - 1) {
        idx++;
        showLine();
      } else {
        showMission();
      }
    }

    function showMission() {
      if (missionShown) return;
      missionShown = true;
      if (typing) {
        lifecycle.clearInterval(typing);
        typing = null;
      }
      leftChar.classList.remove('talking', 'dim');
      rightChar.classList.remove('talking', 'dim');
      box.remove();
      skip.remove();

      const overlay = el('div', 'howto-overlay');
      const card = el('div', 'card howto-card mission-card');
      card.innerHTML = `
        <div class="mission-badge">🚩 미션!</div>
        <h2>${lesson.gameName}</h2>
        <p>${lesson.mission}</p>`;
      const go = button('게임 시작! 🎮', () => mgr.go('game', { lessonId: lesson.id }), 'btn big yellow');
      go.style.marginTop = '20px';
      card.appendChild(go);
      overlay.appendChild(card);
      scene.appendChild(overlay);
      audio.fanfare();
    }

    box.addEventListener('click', advance);
    // 데스크톱/발표용: Enter·Space로도 대화 진행
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    showLine();

    root.appendChild(scene);
    return () => {
      window.removeEventListener('keydown', onKey);
      lifecycle.dispose();
    };
  };
}
