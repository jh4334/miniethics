import type { SceneManager } from '../core/scene';
import { el, button, starsHtml } from '../ui/components';
import { LESSONS } from '../data/curriculum';
import { save } from '../core/save';
import { audio } from '../core/audio';
import { charImg, sceneBg } from '../assets-manifest';

export function worldmapScene(mgr: SceneManager) {
  return (root: HTMLElement) => {
    const scene = el('div', 'scene map-scene');
    scene.appendChild(sceneBg('./assets/bg/worldmap.png'));

    // 바다 물결 장식
    const sea = el('div', 'map-sea');
    for (let i = 0; i < 14; i++) {
      const w = el('div', 'map-wave', '🌊');
      w.style.left = `${(i * 137) % 1240}px`;
      w.style.top = `${100 + ((i * 211) % 640)}px`;
      w.style.animationDelay = `${(i % 5) * 0.4}s`;
      sea.appendChild(w);
    }
    scene.appendChild(sea);

    // 섬을 잇는 점선 길
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    path.setAttribute('class', 'map-path');
    path.setAttribute('viewBox', '0 0 1280 800');
    const pts = LESSONS.map((l) => `${(l.x / 100) * 1280},${(l.y / 100) * 800}`).join(' ');
    path.innerHTML = `<polyline points="${pts}" fill="none" stroke="#ffffff"
      stroke-width="10" stroke-dasharray="4 22" stroke-linecap="round" opacity="0.85"/>`;
    scene.appendChild(path);

    // 현재 도전할 차시: 아직 클리어하지 않은 첫 번째 열린 차시
    const current =
      LESSONS.find((l) => save.isUnlocked(l.id) && !save.record(l.id).cleared) ??
      LESSONS[LESSONS.length - 1];

    // 섬 배치
    LESSONS.forEach((lesson) => {
      const unlocked = save.isUnlocked(lesson.id);
      const rec = save.record(lesson.id);
      const isl = el('button', 'island');
      isl.style.left = `${lesson.x}%`;
      isl.style.top = `${lesson.y}%`;
      isl.style.setProperty('--island-color', lesson.color);
      if (!unlocked) isl.classList.add('locked');
      if (lesson.id === current.id && unlocked) isl.classList.add('current');

      isl.innerHTML = `
        <div class="island-num">${lesson.id}</div>
        <div class="island-img">${unlocked ? lesson.emoji : ''}
          ${!unlocked ? '<span class="lock-badge">🔒</span>' : ''}
          ${unlocked && !lesson.playable ? '<span class="soon-badge">준비 중</span>' : ''}
        </div>
        ${rec.cleared ? `<div class="island-stars">${starsHtml(rec.stars)}</div>` : ''}
        <div class="island-label">${lesson.islandName}</div>`;

      isl.addEventListener('click', () => {
        if (!unlocked) {
          audio.bad();
          isl.animate(
            [
              { transform: 'translate(-50%,-50%) rotate(0deg)' },
              { transform: 'translate(-50%,-50%) rotate(-4deg)' },
              { transform: 'translate(-50%,-50%) rotate(4deg)' },
              { transform: 'translate(-50%,-50%) rotate(0deg)' }
            ],
            { duration: 300 }
          );
          return;
        }
        audio.click();
        if (!lesson.playable) {
          mgr.go('soon', { lessonId: lesson.id });
        } else {
          mgr.go('story', { lessonId: lesson.id });
        }
      });
      scene.appendChild(isl);
    });

    // 현재 섬 위의 주인공
    if (save.isUnlocked(current.id)) {
      const hero = charImg('hero', 'map-hero', '주인공');
      hero.style.left = `${current.x}%`;
      hero.style.top = `calc(${current.y}% - 52px)`;
      scene.appendChild(hero);
    }

    // 상단 HUD
    const hud = el('div', 'hud');
    const home = button('🏠', () => mgr.go('title'), 'icon-btn');
    const title = el('div', 'hud-title', '🗺️ AI 윤리 월드맵');
    const spacer = el('div', 'spacer');
    const total = el(
      'div',
      'map-total',
      `⭐ ${save.totalStars()} / ${LESSONS.length * 3} &nbsp;·&nbsp; 🏝️ ${save.clearedCount()} / ${LESSONS.length}`
    );
    const mute = button(audio.isMuted() ? '🔇' : '🔊', () => {
      audio.setMuted(!audio.isMuted());
      mute.textContent = audio.isMuted() ? '🔇' : '🔊';
    }, 'icon-btn');
    const settings = button('⚙️', () => openSettings(), 'icon-btn');
    hud.append(home, title, spacer, total, mute, settings);
    scene.appendChild(hud);

    // ---------- 설정 (진행 초기화 - 공용 태블릿에서 학급 교체 시 사용) ----------
    function openSettings() {
      const overlay = el('div', 'quit-confirm');
      const card = el('div', 'card quit-card');
      card.innerHTML = `
        <div style="font-size:52px">⚙️</div>
        <h2>설정</h2>
        <p>진행을 처음부터 다시 시작할 수 있어요.<br>
        (다음 친구가 이 태블릿을 쓸 때 선생님이 사용해요)</p>`;
      const btns = el('div', 'quit-btns');
      const reset = button('🗑️ 처음부터 다시 시작', () => {
        // 실수 방지 2단계 확인
        reset.remove();
        const really = button(`정말 초기화 (⭐ ${save.totalStars()}개 삭제)`, () => {
          save.reset();
          mgr.go('title');
        }, 'btn pink');
        btns.prepend(really);
      }, 'btn ghost');
      const close = button('닫기', () => overlay.remove(), 'btn mint');
      btns.append(reset, close);
      card.appendChild(btns);
      overlay.appendChild(card);
      scene.appendChild(overlay);
    }

    root.appendChild(scene);
  };
}
