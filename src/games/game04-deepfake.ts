// 4차시: 진짜가짜 탐정단 (딥페이크 판별)
// SNS 게시물 6건을 수사한다. 사건마다 돋보기 3번으로 사진 속 지점을 조사해
// 단서(손가락·글자·그림자·경계선·출처)를 모으고, 진짜⭕/가짜❌를 판정한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';


/** 사진 장면을 구성하는 이모지/도형 하나 (좌표는 사진 영역 % 기준, 중심점) */
import { CASES, TOTAL_CLUES } from './game04/data';
import { LENS_PER_CASE, PHOTO, TIME_LIMIT, type Spot } from './game04/model';
import { GAME04_CSS as CSS } from './game04/style';

export const game04: MiniGame = {
  lessonId: 4,
  mount(container: HTMLElement, ctx: GameCtx) {
    // ---------- 전용 스타일 주입 ----------
    const styleEl = document.createElement('style');
    styleEl.id = 'g04-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    const wrap = el('div', 'game-wrap g04-scene');
    container.appendChild(wrap);

    // ---------- 상태 ----------
    type Phase = 'investigate' | 'verdict' | 'explain' | 'over';
    let phase: Phase = 'investigate';
    let caseIdx = 0;
    let correctCount = 0;
    let clueCount = 0;
    let lensLeft = LENS_PER_CASE;
    let timeLeft = TIME_LIMIT;
    /** 사건 전환 직후 판정 입력을 무시할 시각(ms) — 연속 탭 오판정 방지 */
    let judgeLockUntil = 0;
    const JUDGE_LOCK_MS = 450;
    let ended = false; // 게임 종료(오버레이 표시)
    let done = false; // finish/quit 중복 방지
    const timers: number[] = [];
    /** 이번 사건에서 이미 조사한 지점 index */
    let used = new Set<number>();
    /** 이번 사건의 마커 엘리먼트 */
    let markers: HTMLButtonElement[] = [];

    function safeFinish(score: number) {
      if (done) return;
      done = true;
      ctx.finish(score);
    }
    function safeQuit() {
      if (done) return;
      done = true;
      ctx.quit();
    }
    function later(fn: () => void, ms: number) {
      timers.push(window.setTimeout(fn, ms));
    }
    function curScore() {
      return correctCount * 10 + clueCount * 5;
    }

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quitBtn = button('🗺️', () => safeQuit(), 'icon-btn', '그만두기');
    const nameEl = el('div', 'game-name', '🔍 진짜가짜 탐정단');
    const timer = el('div', 'timer-bar');
    const fill = el('div', 'timer-fill');
    timer.appendChild(fill);
    const lensEl = el('div', 'g04-lens', '🔍×3');
    const scoreEl = el('div', 'game-score', '점수 0');
    topbar.append(quitBtn, nameEl, timer, lensEl, scoreEl);
    wrap.appendChild(topbar);

    // ---------- 게시물 카드 / 수사 노트 ----------
    const post = el('div', 'g04-post');
    const note = el('div', 'card g04-note');
    wrap.append(post, note);

    function updateHud() {
      lensEl.textContent = `🔍×${lensLeft}`;
      scoreEl.textContent = `점수 ${curScore()}`;
    }

    // ---------- 사건 렌더링 ----------
    let photo: HTMLElement;
    let bubble: HTMLElement;
    let notesBox: HTMLElement;
    let notesTitle: HTMLElement;
    let verdictRow: HTMLElement;

    function say(text: string) {
      if (bubble) bubble.textContent = text;
    }

    function renderCase() {
      const c = CASES[caseIdx];
      phase = 'investigate';
      closeZoom();
      lensLeft = LENS_PER_CASE;
      timeLeft = TIME_LIMIT;
      used = new Set<number>();
      markers = [];
      fill.style.width = '100%';
      fill.classList.remove('danger');
      updateHud();

      // --- 게시물 ---
      post.innerHTML = '';
      const head = el('div', 'g04-post-head');
      const avatar = el('div', 'g04-avatar', c.avatar);
      const account = el('div', 'g04-account', c.account);
      const badge = el('div', 'g04-badge', `사건 ${caseIdx + 1}/6`);
      head.append(avatar, account, badge);

      photo = el('div', 'g04-photo');
      photo.style.background = c.bg;
      for (const o of c.scene) {
        const d = el('div', 'g04-obj', o.html);
        d.style.left = `${o.x}%`;
        d.style.top = `${o.y}%`;
        if (o.size) d.style.fontSize = `${o.size}px`;
        if (o.css) Object.assign(d.style, o.css);
        photo.appendChild(d);
      }
      c.spots.forEach((spot, i) => {
        const m = el('button', 'g04-marker', '✨');
        m.style.left = `${spot.x}%`;
        m.style.top = `${spot.y}%`;
        m.setAttribute('aria-label', `${spot.label} 조사하기`);
        m.addEventListener('click', () => investigate(i, m));
        photo.appendChild(m);
        markers.push(m);
      });

      const caption = el('div', 'g04-caption', c.caption);
      const meta = el('div', 'g04-meta', `❤️ ${c.likes}   🔁 ${c.shares}`);
      post.append(head, photo, caption, meta);

      // --- 수사 노트 ---
      note.innerHTML = '';
      const detective = el('div', 'g04-detective');
      bubble = el('div', 'g04-bubble', '이 게시물, 진짜일까?');
      detective.append(charImg('char04', '', '찰칵이'), bubble);

      notesTitle = el('div', 'g04-notes-title', '📓 수사 노트');
      notesBox = el('div', 'g04-notes');
      notesBox.innerHTML =
        '<div class="g04-empty">사진 위 <b>✨ 돋보기 지점</b>을 탭해서 살펴보자! (3번 가능)</div>';

      verdictRow = el('div', 'g04-verdict g04-lock');
      const realBtn = button('진짜야! ⭕', () => judge(true), 'btn big mint');
      const fakeBtn = button('가짜야! ❌', () => judge(false), 'btn big pink');
      verdictRow.append(realBtn, fakeBtn);

      note.append(detective, notesTitle, notesBox, verdictRow);

      // 이전 화면의 '다음 사건 ▶' 버튼과 판정 버튼이 같은 자리에 있어서,
      // 빠르게 두 번 탭하면 두 번째 탭이 새 사건의 판정으로 떨어질 수 있다.
      // 사건이 시작된 직후 잠깐(0.45초) 판정 입력을 막는다.
      judgeLockUntil = Date.now() + JUDGE_LOCK_MS;
      const lockedRow = verdictRow;
      later(() => lockedRow.classList.remove('g04-lock'), JUDGE_LOCK_MS);
    }

    function addNote(cls: string, text: string) {
      const empty = notesBox.querySelector('.g04-empty');
      if (empty) empty.remove();
      const line = el('div', `g04-line ${cls}`, text);
      notesBox.appendChild(line);
      notesBox.scrollTop = notesBox.scrollHeight;
    }

    // ---------- 돋보기 조사 ----------
    function investigate(i: number, marker: HTMLButtonElement) {
      if (phase !== 'investigate' || ended) return;
      if (used.has(i) || lensLeft <= 0) return;
      const c = CASES[caseIdx];
      const spot = c.spots[i];
      used.add(i);
      lensLeft--;

      const fx = PHOTO.left + (spot.x / 100) * PHOTO.w;
      const fy = PHOTO.top + (spot.y / 100) * PHOTO.h;

      if (spot.isClue) {
        clueCount++;
        marker.className = 'g04-marker found';
        marker.textContent = '📌';
        ctx.audio.good();
        floater(wrap, fx, fy, '단서 발견! 🔎', true);
        addNote('clue', `🔎 단서: ${spot.note}`);
        say('오오, 예리한데!');
      } else {
        marker.className = 'g04-marker checked';
        marker.textContent = '✅';
        ctx.audio.pop();
        floater(wrap, fx, fy, '이상 없음 ✅', true);
        addNote('ok', `✅ 이상 없음: ${spot.note}`);
      }
      updateHud();
      showZoom(spot);

      if (lensLeft <= 0) {
        markers.forEach((m, idx) => {
          if (!used.has(idx)) {
            m.classList.add('off');
            m.disabled = true;
          }
        });
        say('돋보기를 다 썼어! 이제 판정할 시간이야.');
      }
    }

    let zoomEls: HTMLElement[] = [];
    function closeZoom() {
      zoomEls.forEach((e) => e.remove());
      zoomEls = [];
    }

    function showZoom(spot: Spot) {
      closeZoom();
      const back = el('div', 'g04-zoom-back');
      const cardEl = el('div', 'g04-zoom');
      cardEl.innerHTML = `
        <div class="g04-zoom-emoji">${spot.zoom}</div>
        <div class="g04-zoom-title">🔍 ${spot.label} 확대</div>
        <div class="g04-zoom-text">${spot.text}</div>`;
      cardEl.appendChild(button('닫기 ✖️', () => closeZoom(), 'btn'));
      back.addEventListener('click', () => closeZoom());
      zoomEls = [back, cardEl];
      photo.append(back, cardEl);
    }

    // ---------- 판정 ----------
    function judge(guess: boolean | null) {
      if (phase !== 'investigate' || ended) return;
      // 사건 전환 직후의 연속 탭은 무시 (시간 초과 판정 guess===null 은 예외)
      if (guess !== null && Date.now() < judgeLockUntil) return;
      judgeLockUntil = 0;
      phase = 'verdict';
      closeZoom();
      const c = CASES[caseIdx];
      const ok = guess !== null && guess === c.real;

      // 남은 마커 잠그기
      markers.forEach((m, idx) => {
        m.disabled = true;
        if (!used.has(idx)) m.classList.add('off');
      });

      const stamp = el('div', `g04-stamp ${ok ? 'ok' : 'no'}`);
      if (ok) {
        correctCount++;
        stamp.textContent = c.real ? '⭕ 진짜 확인' : '❌ 가짜 판정';
        ctx.audio.good();
        say('역시 탐정단이야!');
      } else {
        stamp.textContent = guess === null ? '⏰ 시간 초과!' : '💦 판정 실패';
        ctx.audio.bad();
        say('괜찮아, 다음 사건에서 만회하자!');
      }
      photo.appendChild(stamp);
      updateHud();
      later(showExplain, 1100);
    }

    // ---------- 해설 ----------
    function showExplain() {
      if (ended) return;
      phase = 'explain';
      const c = CASES[caseIdx];

      // 못 찾은 단서를 사진 위에 공개
      const missed: Spot[] = [];
      c.spots.forEach((spot, idx) => {
        if (spot.isClue && !used.has(idx)) {
          missed.push(spot);
          const m = markers[idx];
          m.className = 'g04-marker found';
          m.textContent = '📌';
        }
      });

      notesTitle.textContent = '📢 사건의 진실';
      notesBox.innerHTML = '';
      const answer = el(
        'div',
        `g04-answer ${c.real ? 'ok' : 'no'}`,
        c.real ? '이 게시물은 진짜! ⭕' : '이 게시물은 가짜! ❌'
      );
      let body = c.explain;
      if (missed.length) {
        body += '<br><br><b>놓친 단서 📌</b><br>';
        body += missed.map((s) => `· ${s.note}`).join('<br>');
      }
      const explainBox = el('div', 'g04-explain-text', body);

      verdictRow.innerHTML = '';
      const last = caseIdx >= CASES.length - 1;
      const nextBtn = button(
        last ? '수사 결과 보기 🏆' : '다음 사건 ▶',
        () => nextCase(),
        'btn big yellow g04-next'
      );
      verdictRow.appendChild(nextBtn);

      note.innerHTML = '';
      const detective = el('div', 'g04-detective');
      const b = el('div', 'g04-bubble', bubble.textContent || '');
      bubble = b;
      detective.append(charImg('char04', '', '찰칵이'), b);
      note.append(detective, notesTitle, answer, explainBox, verdictRow);
    }

    function nextCase() {
      if (ended) return;
      if (caseIdx >= CASES.length - 1) {
        gameOver();
        return;
      }
      caseIdx++;
      renderCase();
    }

    // ---------- 종료 ----------
    function gameOver() {
      if (ended) return;
      ended = true;
      phase = 'over';
      const score = Math.max(0, Math.min(100, curScore()));
      const grade =
        score >= 90
          ? '전설의 탐정! 🕵️✨'
          : score >= 70
            ? '베테랑 탐정! 🔍'
            : score >= 40
              ? '견습 탐정 💪'
              : '신입 탐정 🌱';

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>${grade}</h2>
        <div class="howto-icons">🔍🕵️📰</div>
        <div class="howto-desc">
          정확한 판정: <b>${correctCount} / ${CASES.length}</b><br>
          발견한 단서: <b>${clueCount} / ${TOTAL_CLUES}</b><br><br>
          겉모습만 믿지 말고 단서와 출처를 확인하는 것, 그게 진짜 탐정이야!
        </div>`;
      const doneBtn = button('결과 보기 🏆', () => safeFinish(score), 'btn big yellow');
      cardEl.appendChild(doneBtn);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      if (score >= 70) ctx.audio.fanfare();
      else ctx.audio.star();
    }

    // ---------- 타이머 ----------
    const tick = window.setInterval(() => {
      if (ended || phase !== 'investigate') return;
      timeLeft -= 0.2;
      const pct = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
      fill.style.width = `${pct}%`;
      fill.classList.toggle('danger', pct < 25);
      if (timeLeft <= 0) judge(null);
    }, 200);

    renderCase();

    return () => {
      ended = true;
      clearInterval(tick);
      timers.forEach((t) => clearTimeout(t));
      styleEl.remove();
      wrap.remove();
    };
  }
};
