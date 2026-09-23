import type { SceneManager } from '../core/scene';
import { el, button, starsHtml } from '../ui/components';
import { LESSONS } from '../data/curriculum';
import { save } from '../core/save';
import { audio } from '../core/audio';
import { charImg, sceneBg } from '../assets-manifest';
import { prefersReducedMotion } from '../core/motion';

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
      isl.disabled = !unlocked;
      if (lesson.id === current.id && unlocked) {
        isl.classList.add('current');
        isl.setAttribute('aria-current', 'step');
      }
      const previous = LESSONS.find((candidate) => candidate.id === lesson.id - 1);
      const stateLabel = unlocked
        ? rec.cleared
          ? `완료, 별 ${rec.stars}개`
          : '도전 가능'
        : previous
          ? `잠김, ${previous.id}차시를 먼저 완료해 주세요`
          : '잠김';
      isl.setAttribute('aria-label', `${lesson.id}차시 ${lesson.islandName}, ${stateLabel}`);

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
          // 왜 잠겨 있는지 + 무엇을 하면 열리는지 안내
          const prev = LESSONS.find((x) => x.id === lesson.id - 1);
          showMapToast(
            prev
              ? `🔒 먼저 ${prev.id}차시 「${prev.islandName}」을 클리어하면 열려요!`
              : '🔒 아직 잠겨 있어요!'
          );
          if (!prefersReducedMotion()) {
            isl.animate(
              [
                { transform: 'translate(-50%,-50%) rotate(0deg)' },
                { transform: 'translate(-50%,-50%) rotate(-4deg)' },
                { transform: 'translate(-50%,-50%) rotate(4deg)' },
                { transform: 'translate(-50%,-50%) rotate(0deg)' }
              ],
              { duration: 300 }
            );
          }
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

    // ---------- 잠긴 섬 안내 토스트 ----------
    let toastTimer: number | null = null;
    function showMapToast(msg: string) {
      let toast = scene.querySelector<HTMLElement>('.map-toast');
      if (!toast) {
        toast = el('div', 'map-toast');
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        scene.appendChild(toast);
      }
      toast.textContent = msg;
      toast.classList.add('show');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast!.classList.remove('show'), 2400);
    }

    // 상단 HUD
    const hud = el('div', 'hud');
    const home = button('🏠', () => mgr.go('title'), 'icon-btn', '타이틀로 가기');
    const title = el('h1', 'hud-title', '🗺️ AI 윤리 월드맵');
    const spacer = el('div', 'spacer');
    const allCleared = save.clearedCount() === LESSONS.length;
    const total = el(
      'div',
      'map-total',
      `${allCleared ? '👑 ' : ''}⭐ ${save.totalStars()} / ${LESSONS.length * 3} &nbsp;·&nbsp; 🏝️ ${save.clearedCount()} / ${LESSONS.length}`
    );
    const mute = button(audio.isMuted() ? '🔇' : '🔊', () => {
      audio.setMuted(!audio.isMuted());
      mute.textContent = audio.isMuted() ? '🔇' : '🔊';
      mute.setAttribute('aria-label', audio.isMuted() ? '소리 켜기' : '소리 끄기');
    }, 'icon-btn', audio.isMuted() ? '소리 켜기' : '소리 끄기');
    const settings = button('⚙️', () => openSettings(), 'icon-btn', '설정');
    hud.append(home, title, spacer, total, mute, settings);
    scene.appendChild(hud);

    // ---------- 설정 (진행 초기화 - 공용 태블릿에서 학급 교체 시 사용) ----------
    function openSettings() {
      const overlay = el('div', 'quit-confirm');
      const card = el('div', 'card quit-card');
      let errCount = 0;
      try {
        errCount = (JSON.parse(localStorage.getItem('miniethics-errlog') || '[]') as unknown[])
          .length;
      } catch {
        /* 무시 */
      }
      card.innerHTML = `
        <div style="font-size:52px">⚙️</div>
        <h2>설정</h2>
        <p>진행을 처음부터 다시 시작할 수 있어요.<br>
        (다음 친구가 이 태블릿을 쓸 때 선생님이 사용해요)</p>
        <p style="font-size:15px">버전 v${__APP_VERSION__}${errCount ? ` · 최근 오류 기록 ${errCount}건` : ''}</p>`;
      const btns = el('div', 'quit-btns');
      const summaryBtn = button('📋 진행 요약', () => {
        overlay.remove();
        openSummary();
      }, 'btn');
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
      btns.append(summaryBtn, reset, close);
      card.appendChild(btns);
      overlay.appendChild(card);
      scene.appendChild(overlay);
    }

    // ---------- 진행 요약 (교사 순회 지도·성취 확인용) ----------
    function openSummary() {
      const overlay = el('div', 'quit-confirm');
      const card = el('div', 'card quit-card summary-table-card');
      const rows = LESSONS.map((l) => {
        const r = save.record(l.id);
        return `<div class="sum-row ${r.cleared ? '' : 'todo'}">
          <span class="sum-id">${l.id}</span>
          <span class="sum-name">${l.gameName}</span>
          <span class="sum-stars">${r.cleared ? starsHtml(r.stars) : '—'}</span>
          <span class="sum-score">${r.cleared ? `${r.bestScore}점 · 퀴즈 ${r.quizBest}/3` : '미완료'}</span>
        </div>`;
      }).join('');
      card.innerHTML = `
        <h2>📋 진행 요약</h2>
        <p>⭐ ${save.totalStars()} / ${LESSONS.length * 3} · 완료 ${save.clearedCount()} / ${LESSONS.length}차시</p>
        <div class="sum-list">${rows}</div>`;
      card.appendChild(button('닫기', () => overlay.remove(), 'btn mint'));
      overlay.appendChild(card);
      scene.appendChild(overlay);
    }

    // ---------- 전체 완주 축하: AI 윤리 수호자 임명장 (최초 1회) ----------
    const GUARDIAN_KEY = 'miniethics-guardian-shown';
    let guardianShown = false;
    try {
      guardianShown = localStorage.getItem(GUARDIAN_KEY) === '1';
    } catch {
      /* 저장 불가 시 매번 표시하지 않도록 아래에서 세션 내 처리 */
    }
    if (allCleared && !guardianShown) {
      const overlay = el('div', 'quit-confirm');
      const card = el('div', 'card quit-card guardian-card');
      card.innerHTML = `
        <div style="font-size:72px">🏅</div>
        <h2>AI 윤리 수호자 임명장</h2>
        <p>12개의 섬을 모두 지켜 냈어요!<br>
        ⭐ ${save.totalStars()}개의 별과 함께, 당신을<br>
        <b>AI 윤리 수호자</b>로 임명합니다.<br><br>
        배운 것을 생활 속에서 실천하는 것,<br>그것이 진짜 수호자의 힘이에요! 💪`;
      const ok = button('멋지게 실천할게요! 🙌', () => {
        try {
          localStorage.setItem(GUARDIAN_KEY, '1');
        } catch {
          /* 무시 */
        }
        overlay.remove();
        audio.fanfare();
      }, 'btn big yellow');
      card.appendChild(ok);
      overlay.appendChild(card);
      scene.appendChild(overlay);
      audio.fanfare();
    }

    root.appendChild(scene);

    // ---------- 다음 차시 에셋 프리페치 (스토리 진입 시 배경·캐릭터 팝인 방지) ----------
    const idle: (cb: () => void) => void =
      'requestIdleCallback' in window
        ? (cb) => (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(cb)
        : (cb) => window.setTimeout(cb, 400);
    idle(() => {
      const nn = String(current.id).padStart(2, '0');
      const urls = [
        `./assets/game${nn}/bg.webp`,
        `./assets/game${nn}/${current.chars.right}.webp`,
        `./assets/common/eti.webp`
      ];
      for (const u of urls) {
        const img = new Image();
        img.src = u;
      }
    });
  };
}
