// 10차시: 자율주행 법정 (AI의 실수, 책임은 누구에게?)
// 플레이어는 판사가 되어 자율주행차 로봇 '부릉이'의 사고 3건을 재판한다.
// 사건 재생(A) → 증거 조사(B) → 책임 조각 나누기(C) → 판결 결과(D)를 반복하며,
// AI 피고석에는 책임 조각이 붙지 않고 미끄러지는 연출로
// 'AI는 스스로 책임질 수 없다 → 사람이 나눠 책임진다'를 손끝으로 체험한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

// ============================================================
// ============================================================
import { AI_LINES, CASES, PIECES, SAY } from './game10/data';
import type { Defendant, Evidence } from './game10/model';
import { GAME10_CSS as CSS } from './game10/style';

export const game10: MiniGame = {
  lessonId: 10,
  mount(container: HTMLElement, ctx: GameCtx) {
    const styleEl = document.createElement('style');
    styleEl.id = 'g10-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    const wrap = el('div', 'game-wrap g10-scene');
    container.appendChild(wrap);

    const timers: number[] = [];
    let exited = false; // finish/quit 중복 방지
    let caseIdx = 0;
    const caseScores: number[] = [];
    let aiTryCount = 0; // AI에게 조각을 시도한 횟수(대사 순환용)
    let tipShown = false; // 에티 안내 팝업 1회

    function later(fn: () => void, ms: number) {
      timers.push(window.setTimeout(fn, ms));
    }

    // 단계 A(사건 재생)의 연출 예약 타이머 — 화면이 바뀌면 즉시 취소한다
    const actorTimers: number[] = [];
    function laterActor(fn: () => void, ms: number) {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      actorTimers.push(id);
    }
    function clearActorTimers() {
      actorTimers.forEach((t) => clearTimeout(t));
      actorTimers.length = 0;
    }

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quitBtn = button(
      '🗺️',
      () => {
        if (exited) return;
        exited = true;
        ctx.quit();
      },
      'icon-btn', '그만두기');
    const nameEl = el('div', 'game-name', '🚗 자율주행 법정');
    const spacer = el('div', 'g10-spacer');
    const scoreEl = el('div', 'game-score', '사건 1/3 · ⭐0점');
    topbar.append(quitBtn, nameEl, spacer, scoreEl);
    wrap.appendChild(topbar);

    function avgScore(): number {
      if (!caseScores.length) return 0;
      return Math.round(caseScores.reduce((s, n) => s + n, 0) / caseScores.length);
    }
    function updateHud() {
      scoreEl.textContent = `사건 ${Math.min(caseIdx + 1, 3)}/3 · ⭐${avgScore()}점`;
    }

    // ---------- 좌측 피고인석 ----------
    const dock = el('div', 'g10-dock');
    const sayEl = el('div', 'g10-say', SAY.a);
    const bodyEl = el('div', 'g10-body');
    bodyEl.appendChild(charImg('char10', '', '부릉이'));
    const dockName = el('div', 'g10-dock-name', '🚗 부릉이');
    const dockTag = el('div', 'g10-dock-tag', '피고인석');
    dock.append(sayEl, bodyEl, dockName, dockTag);
    wrap.appendChild(dock);

    function say(text: string) {
      sayEl.textContent = text;
    }
    function shake() {
      bodyEl.classList.remove('shake');
      void bodyEl.offsetWidth;
      bodyEl.classList.add('shake');
    }

    // ---------- 무대 ----------
    const stage = el('div', 'g10-stage');
    wrap.appendChild(stage);

    /** wrap 기준 논리좌표(1280x800)로 엘리먼트 중심 구하기 */
    function centerOf(target: HTMLElement) {
      const r = target.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      const scale = w.width > 0 ? w.width / 1280 : 1;
      return {
        x: (r.left + r.width / 2 - w.left) / scale,
        y: (r.top + r.height / 2 - w.top) / scale
      };
    }

    // ============================================================
    // 단계 A: 사건 재생
    // ============================================================
    function phaseA() {
      const c = CASES[caseIdx];
      clearActorTimers();
      stage.innerHTML = '';
      say(SAY.a);
      updateHud();

      const title = el(
        'div',
        'g10-title',
        `⚖️ 사건 ${caseIdx + 1} 「${c.title}」<small>재판을 시작합니다</small>`
      );
      const panel = el('div', 'g10-panel');
      const play = el('div', 'g10-play');
      play.appendChild(el('div', 'g10-road'));
      const desc = el('div', 'g10-desc', c.desc);
      panel.append(play, desc);
      const center = el('div', 'g10-center');
      center.appendChild(
        button('증거를 살펴보자 🔍', () => phaseB(), 'btn big mint')
      );
      stage.append(title, panel, center);

      ctx.audio.pop();
      c.actors.forEach((a) => {
        const d = el('div', 'g10-actor', a.emoji);
        d.style.left = `${a.x}px`;
        d.style.top = `${a.y}px`;
        d.style.fontSize = `${a.size ?? 70}px`;
        if (a.at !== undefined) d.style.opacity = '0';
        play.appendChild(d);

        if (a.at !== undefined) {
          laterActor(() => {
            if (!d.isConnected) return; // 이미 다음 화면으로 넘어갔으면 연출/효과음 생략
            d.style.opacity = '1';
            d.classList.add('g10-in');
            if (a.sound === 'bad') ctx.audio.bad();
            if (a.sound === 'pop') ctx.audio.pop();
          }, a.at);
        }
        if (a.tx !== undefined) {
          laterActor(() => {
            if (!d.isConnected) return;
            d.style.transition = `left ${a.dur ?? 1700}ms linear, opacity .25s ease`;
            d.style.left = `${a.tx}px`;
          }, 60);
        }
      });
    }

    // ============================================================
    // 단계 B: 증거 조사
    // ============================================================
    function phaseB() {
      const c = CASES[caseIdx];
      clearActorTimers(); // 사건 재생 중 남은 효과음/이동 예약 취소
      stage.innerHTML = '';
      say(SAY.b);

      const flipped = c.evidence.map(() => false);

      const title = el(
        'div',
        'g10-title',
        `🔍 증거 조사<small>카드 3장을 모두 탭해서 확인하세요</small>`
      );
      const row = el('div', 'g10-evrow');

      c.evidence.forEach((ev, i) => {
        const card = el('div', 'g10-ev');
        const inner = el('div', 'g10-ev-inner');
        const front = el(
          'div',
          'g10-face front',
          `<div class="g10-q">❓</div><div class="g10-n">증거 ${i + 1}</div>`
        );
        const back = el(
          'div',
          'g10-face back',
          `<div class="g10-ico">${ev.icon}</div>
           <div class="g10-t">${ev.title}</div>
           <div class="g10-d">${ev.desc}</div>
           <div class="g10-more">👆 다시 탭하면 크게 보기</div>`
        );
        inner.append(front, back);
        card.appendChild(inner);
        row.appendChild(card);

        card.addEventListener('click', () => {
          if (!flipped[i]) {
            flipped[i] = true;
            card.classList.add('flip');
            ctx.audio.pop();
            const doneAll = flipped.every(Boolean);
            if (doneAll) {
              gateBtn.className = 'btn big yellow';
              hint.textContent = '증거를 모두 확인했어요! 이제 판결을 준비하세요.';
              say('증거를 다 봤구나. 이제 책임을 나눠 줘…');
              ctx.audio.good();
            } else {
              hint.textContent = `아직 증거 ${flipped.filter((f) => !f).length}장이 남았어요.`;
            }
          } else {
            openEvidence(ev);
          }
        });
      });

      const gate = el('div', 'g10-gate');
      const gateBtn = button(
        '판결 준비 ⚖️',
        () => {
          if (!flipped.every(Boolean)) {
            ctx.audio.bad();
            say('증거를 다 보기 전엔 판결할 수 없어!');
            shake();
            floater(wrap, 790, 620, '증거부터 확인! 🔍', false);
            return;
          }
          phaseC();
        },
        'btn big g10-off'
      );
      const hint = el('div', 'g10-hint', '증거 3장을 모두 뒤집어야 판결을 시작할 수 있어요.');
      gate.append(gateBtn, hint);
      stage.append(title, row, gate);
    }

    function openEvidence(ev: Evidence) {
      ctx.audio.click();
      const modal = el('div', 'g10-modal');
      const card = el(
        'div',
        'g10-modal-card',
        `<div class="g10-ico">${ev.icon}</div>
         <div class="g10-t">${ev.title}</div>
         <div class="g10-d">${ev.desc}</div>`
      );
      card.appendChild(button('닫기 ✖', () => modal.remove(), 'btn ghost'));
      modal.appendChild(card);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
      stage.appendChild(modal);
    }

    // ============================================================
    // 단계 C: 책임 나누기
    // ============================================================
    function phaseC() {
      const c = CASES[caseIdx];
      stage.innerHTML = '';
      say(SAY.c);

      const placed: Record<string, number> = {};
      c.defendants.forEach((d) => (placed[d.key] = 0));
      let remain = PIECES;
      let busy = false;

      const title = el(
        'div',
        'g10-title',
        `⚖️ 책임 나누기<small>피고를 탭하면 조각이 놓이고, 놓인 조각을 탭하면 돌아와요</small>`
      );
      const row = el('div', 'g10-defrow');

      const slotEls: Record<string, HTMLElement> = {};

      c.defendants.forEach((d) => {
        const card = el('div', `g10-def${d.ai ? ' ai' : ''}`);
        const ico = el('div', 'g10-def-ico');
        if (d.ai) {
          ico.appendChild(charImg('char10', '', '부릉이'));
        } else {
          ico.textContent = d.icon;
        }
        const nm = el('div', 'g10-def-name', d.name);
        const sub = el('div', 'g10-def-sub', d.sub);
        const slots = el('div', 'g10-slots');
        slotEls[d.key] = slots;
        card.append(ico, nm, sub, slots);
        row.appendChild(card);

        card.addEventListener('click', (e) => {
          if (busy) return;
          // 놓인 조각 영역을 탭하면 되돌리기
          if (!d.ai && slots.contains(e.target as Node) && placed[d.key] > 0) {
            placed[d.key]--;
            remain++;
            ctx.audio.click();
            renderSlots(d);
            renderTray();
            return;
          }
          if (d.ai) {
            tryAi(card);
            return;
          }
          if (remain <= 0) {
            ctx.audio.bad();
            floater(wrap, centerOf(card).x, centerOf(card).y, '조각이 없어요!', false);
            return;
          }
          placeOne(d, card);
        });
      });

      const tray = el('div', 'g10-tray');
      const judgeWrap = el('div', 'g10-center');
      const judgeBtn = button(
        '판결! 🔨',
        () => {
          // 조각이 날아가는 중(busy)에는 placed 값이 아직 반영되지 않았으므로 판결 금지
          if (busy) return;
          if (remain > 0) {
            ctx.audio.bad();
            say(`아직 조각이 ${remain}개 남았어. 전부 나눠 줘!`);
            shake();
            return;
          }
          phaseD(placed);
        },
        'btn big g10-off'
      );
      judgeWrap.appendChild(judgeBtn);
      stage.append(title, row, tray, judgeWrap);

      function renderSlots(d: Defendant) {
        const s = slotEls[d.key];
        const n = placed[d.key];
        if (d.ai) {
          s.className = 'g10-slots';
          s.innerHTML = `<div class="g10-slots-hint">조각을 받을 수 없어요 🚫</div>`;
          return;
        }
        s.className = `g10-slots${n > 0 ? ' on' : ''}`;
        s.innerHTML = n > 0
          ? '<div class="g10-chip">⚖️</div>'.repeat(n) + `<div class="g10-slots-hint">${n}조각</div>`
          : '<div class="g10-slots-hint">여기를 탭해 조각 놓기</div>';
      }

      function renderTray() {
        tray.innerHTML = '';
        tray.appendChild(el('div', 'g10-tray-label', '책임 조각'));
        for (let i = 0; i < PIECES; i++) {
          tray.appendChild(el('div', `g10-token${i < remain ? '' : ' empty'}`, '⚖️'));
        }
        tray.appendChild(el('div', 'g10-tray-label', `남은 조각 ${remain}개`));
        judgeBtn.className = remain === 0 && !busy ? 'btn big yellow' : 'btn big g10-off';
      }

      /**
       * 트레이 → 피고 카드로 조각 날리기.
       * slip=true(AI 피고)면 착지 후 미끄러지다가 트레이로 되돌아오고,
       * 되돌아온 시점에 onReturn이 호출된다.
       */
      function fly(
        toEl: HTMLElement,
        slip: boolean,
        onLand: () => void,
        onReturn?: () => void
      ) {
        const from = centerOf(tray);
        const to = centerOf(toEl);
        const t = el('div', 'g10-fly', '⚖️');
        t.style.left = `${from.x}px`;
        t.style.top = `${from.y}px`;
        wrap.appendChild(t);
        later(() => {
          t.style.left = `${to.x}px`;
          t.style.top = `${to.y}px`;
        }, 20);
        later(() => {
          if (slip) {
            t.classList.add('slip');
            // 흔들림이 끝나면 트레이 쪽으로 되돌아가는 비행
            later(() => {
              t.classList.remove('slip');
              const back = centerOf(tray);
              t.style.left = `${back.x}px`;
              t.style.top = `${back.y}px`;
            }, 450);
            later(() => {
              t.remove();
              onReturn?.();
            }, 810);
          } else {
            t.remove();
          }
          onLand();
        }, 380);
      }

      function placeOne(d: Defendant, card: HTMLElement) {
        busy = true;
        remain--;
        renderTray();
        card.classList.add('hot');
        fly(slotEls[d.key], false, () => {
          placed[d.key]++;
          renderSlots(d);
          ctx.audio.pop();
          card.classList.remove('hot');
          busy = false;
          renderTray(); // 착지 후에야 판결 버튼이 활성화된다
        });
      }

      function tryAi(card: HTMLElement) {
        if (remain <= 0) {
          ctx.audio.bad();
          say(AI_LINES[aiTryCount % AI_LINES.length]);
          aiTryCount++;
          shake();
          return;
        }
        busy = true;
        card.classList.add('hot');
        // 비행 중에도 조각 총합이 6개로 보이도록 트레이에서 하나를 잠시 비운다
        remain--;
        renderTray();
        fly(
          slotEls['ai'],
          true,
          () => {
            ctx.audio.bad();
            shake();
            say(AI_LINES[aiTryCount % AI_LINES.length]);
            aiTryCount++;
            card.classList.remove('hot');
            floater(wrap, centerOf(card).x, centerOf(card).y + 60, '미끄러졌어! 🚫', false);
          },
          () => {
            // 미끄러진 조각은 트레이로 되돌아온다
            remain++;
            busy = false;
            renderTray();
            ctx.audio.pop();
            floater(wrap, centerOf(tray).x, centerOf(tray).y - 70, '조각이 돌아왔어! ↩️', false);
            if (!tipShown) {
              tipShown = true;
              later(showTip, 400);
            }
          }
        );
      }

      c.defendants.forEach(renderSlots);
      renderTray();
    }

    function showTip() {
      const tip = el('div', 'g10-tip');
      const card = el('div', 'g10-tip-card');
      card.appendChild(charImg('eti', '', '에티'));
      card.appendChild(
        el(
          'div',
          'g10-tip-text',
          '봤지? <b>AI는 책임 조각을 받을 수 없어.</b><br>반성할 마음도, 물어 줄 돈도 없거든.<br>그래서 AI의 실수는 늘 <b>사람들이 나눠서</b> 책임져야 해!'
        )
      );
      card.appendChild(button('알겠어!', () => tip.remove(), 'btn big yellow'));
      tip.appendChild(card);
      wrap.appendChild(tip);
      ctx.audio.star();
    }

    // ============================================================
    // 단계 D: 판결 결과
    // ============================================================
    function phaseD(placed: Record<string, number>) {
      const c = CASES[caseIdx];
      stage.innerHTML = '';

      const gavel = el('div', 'g10-gavel', '🔨');
      wrap.appendChild(gavel);
      ctx.audio.good();
      later(() => gavel.remove(), 750);

      // 피고별 연출용 예약 타이머 — 다음 사건으로 넘어가면 즉시 취소한다
      const rowTimers: number[] = [];
      function laterRow(fn: () => void, ms: number) {
        const id = window.setTimeout(fn, ms);
        timers.push(id);
        rowTimers.push(id);
      }
      function clearRowTimers() {
        rowTimers.forEach((t) => clearTimeout(t));
        rowTimers.length = 0;
      }

      let devSum = 0;
      c.defendants.forEach((d) => {
        if (d.ai) return;
        const n = placed[d.key] ?? 0;
        const dev = n < d.min ? d.min - n : n > d.max ? n - d.max : 0;
        devSum += dev;
      });
      const caseScore = Math.max(0, 100 - 15 * devSum);
      caseScores[caseIdx] = caseScore;

      const title = el(
        'div',
        'g10-title',
        `🔨 판결 결과<small>사건 ${caseIdx + 1} 「${c.title}」</small>`
      );
      const panel = el('div', 'g10-panel');

      c.defendants.forEach((d, i) => {
        const n = placed[d.key] ?? 0;
        const inRange = n >= d.min && n <= d.max;
        const rowEl = el('div', 'g10-vrow');
        const icoHtml = d.ai ? '🚗' : d.icon;
        let mark = '⭕';
        if (d.ai) mark = '🚫';
        else if (!inRange) mark = n < d.min ? '⬆️❌' : '⬇️❌';

        rowEl.innerHTML = `
          <div class="g10-vico">${icoHtml}</div>
          <div class="g10-vname">
            <b>${d.name}</b>
            <div class="g10-vreason">${d.reason}</div>
          </div>
          <div class="g10-vnum"><span>나의 판결</span>${d.ai ? '받을 수 없음' : `${n}조각`}</div>
          <div class="g10-vnum"><span>대법관 의견</span>${d.ai ? '책임 없음' : `${d.min}~${d.max}조각`}</div>
          <div class="g10-vmark">${mark}</div>`;
        panel.appendChild(rowEl);

        if (!d.ai) {
          laterRow(() => {
            if (!rowEl.isConnected) return; // 이미 다음 화면으로 넘어갔으면 연출 생략
            const p = centerOf(rowEl);
            if (inRange) {
              ctx.audio.good();
              floater(wrap, p.x + 380, p.y, '딱 맞아! ⭕', true);
            } else {
              ctx.audio.bad();
              floater(wrap, p.x + 380, p.y, n < d.min ? '조금 부족! ⬆️' : '너무 많아! ⬇️', false);
            }
          }, 700 + i * 450);
        }
      });

      const scoreLine = el('div', 'g10-casescore', `이번 사건 점수 ${caseScore}점`);
      panel.appendChild(scoreLine);

      say(devSum === 0 ? SAY.dOk : SAY.dNo);
      updateHud();

      const center = el('div', 'g10-center');
      const last = caseIdx >= CASES.length - 1;
      center.appendChild(
        button(
          last ? '최종 판결 보기 🏆' : '다음 사건 ▶',
          () => {
            clearRowTimers();
            if (last) {
              showResult();
            } else {
              caseIdx++;
              phaseA();
            }
          },
          'btn big yellow'
        )
      );
      stage.append(title, panel, center);
    }

    // ============================================================
    // 최종 결과
    // ============================================================
    function showResult() {
      if (exited) return;
      const final = Math.round(
        caseScores.reduce((s, n) => s + n, 0) / Math.max(1, caseScores.length)
      );
      const heading =
        final >= 90 ? '명판사 탄생! ⚖️✨' : final >= 70 ? '공정한 판사! ⚖️' : '견습 판사 수료 📖';

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>${heading}</h2>
        <div class="g10-over-score">${final}점</div>
        <div class="g10-over-lines">
          사건 1 「노란 신호 사건」 <b>${caseScores[0] ?? 0}점</b><br>
          사건 2 「진흙 센서 사건」 <b>${caseScores[1] ?? 0}점</b><br>
          사건 3 「낡은 지도 사건」 <b>${caseScores[2] ?? 0}점</b>
        </div>
        <div class="g10-over-say">책임 조각은 한 번도 부릉이에게 붙지 않았어요.<br>
          <b>AI의 실수는 사람이 나눠 책임져요!</b></div>`;
      const doneBtn = button(
        '결과 보기 🏆',
        () => {
          if (exited) return;
          exited = true;
          ctx.finish(final);
        },
        'btn big yellow'
      );
      cardEl.appendChild(doneBtn);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      ctx.audio.fanfare();
    }

    // ---------- 시작 ----------
    phaseA();

    return () => {
      exited = true;
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      styleEl.remove();
      wrap.remove();
    };
  }
};
