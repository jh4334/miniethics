// 9차시: AI 심판 고치기 (AI의 공정성)
// 로봇 운동회의 AI 심판 '휘슬'의 판정 8건을 기록과 비교해 검토하고,
// 불공정의 패턴(피해자가 전부 네모팀)을 발견한 뒤 원인(기울어진 학습 데이터)을 찾아
// 데이터 저울을 직접 맞춰 휘슬을 고치고, 재판정으로 확인한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater, starsHtml } from '../ui/components';
import { charImg } from '../assets-manifest';

// ---------- 데이터 ----------

type Team = 'dong' | 'nemo';

interface Player {
  team: Team;
  name: string;
  /** 기록 표시 문자열 (모든 종목: 숫자가 클수록 잘한 것) */
  rec: string;
}

interface Case {
  sport: string;
  emoji: string;
  left: Player; // 동글팀
  right: Player; // 네모팀
  /** 휘슬이 외친 승자 이름 */
  verdict: string;
  /** 공정한 판정이면 true */
  fair: boolean;
  /** 기록이 앞선 쪽 */
  better: 'left' | 'right';
}

const CASES: Case[] = [
  {
    sport: '멀리뛰기',
    emoji: '🦘',
    left: { team: 'dong', name: '롤리', rec: '3.2m' },
    right: { team: 'nemo', name: '네몬', rec: '2.8m' },
    verdict: '롤리',
    fair: true,
    better: 'left'
  },
  {
    sport: '공 넣기',
    emoji: '🏀',
    left: { team: 'dong', name: '보요', rec: '7개' },
    right: { team: 'nemo', name: '큐브', rec: '9개' },
    verdict: '보요',
    fair: false,
    better: 'right'
  },
  {
    sport: '줄넘기',
    emoji: '🪢',
    left: { team: 'dong', name: '통통', rec: '41개' },
    right: { team: 'nemo', name: '반듯', rec: '55개' },
    verdict: '통통',
    fair: false,
    better: 'right'
  },
  {
    sport: '높이뛰기',
    emoji: '⬆️',
    left: { team: 'dong', name: '몽글', rec: '85cm' },
    right: { team: 'nemo', name: '박스', rec: '80cm' },
    verdict: '몽글',
    fair: true,
    better: 'left'
  },
  {
    sport: '오래 매달리기',
    emoji: '🐒',
    left: { team: 'dong', name: '롤리', rec: '30초' },
    right: { team: 'nemo', name: '박스', rec: '28초' },
    verdict: '롤리',
    fair: true,
    better: 'left'
  },
  {
    sport: '다트',
    emoji: '🎯',
    left: { team: 'dong', name: '보요', rec: '60점' },
    right: { team: 'nemo', name: '네몬', rec: '90점' },
    verdict: '보요',
    fair: false,
    better: 'right'
  },
  {
    sport: '멀리 던지기',
    emoji: '🥎',
    left: { team: 'dong', name: '통통', rec: '12m' },
    right: { team: 'nemo', name: '큐브', rec: '15m' },
    verdict: '큐브',
    fair: true,
    better: 'right'
  },
  {
    sport: '훌라후프',
    emoji: '🌀',
    left: { team: 'dong', name: '몽글', rec: '66번' },
    right: { team: 'nemo', name: '반듯', rec: '71번' },
    verdict: '반듯',
    fair: true,
    better: 'right'
  }
];

/** 불공정 판정 3건의 인덱스 (2·3·6번 문항) */
const UNFAIR = [1, 2, 5];

const P1_TIME = 15;
const P4_TIME = 12;
const TAP_BUDGET = 8;

const CAUSES = [
  '네모팀 로봇들이 얄미워서',
  '동글팀 경기 영상만 잔뜩 보고 배워서',
  '호루라기가 고장 나서'
];
const CAUSE_ANSWER = 1;
const CAUSE_HINTS = [
  'AI에게 감정은 없어. 휘슬이 무엇을 보고 배웠는지 생각해 봐!',
  '',
  '호루라기는 판단과 상관없어!'
];

// ---------- 스타일 ----------

const CSS = `
.g09-scene { background: linear-gradient(180deg,#d9efff 0%,#eafaf3 55%,#fff8e6 100%); }
.g09-stage { position:absolute; left:0; right:0; top:70px; bottom:0; }

/* 심판 휘슬 */
.g09-ref { position:absolute; right:14px; top:86px; width:268px; z-index:14; text-align:center; pointer-events:none; }
.g09-speech { background:#fff; border-radius:20px; padding:14px 16px; font-size:22px; font-weight:700;
  line-height:1.4; color:var(--ink); box-shadow:var(--shadow); position:relative; min-height:70px;
  display:flex; align-items:center; justify-content:center; }
.g09-speech::after { content:''; position:absolute; left:50%; bottom:-15px; margin-left:-11px;
  border:11px solid transparent; border-top-color:#fff; }
.g09-ref-body { margin-top:24px; }
.g09-ref-body img { width:180px; filter:drop-shadow(0 8px 0 rgba(58,51,82,.14)); }
.g09-ref.blow .g09-ref-body { animation:g09-blow .4s ease; }
.g09-ref.fixed .g09-ref-body { animation:g09-bounce .6s ease 2; }
@keyframes g09-blow { 0%{transform:rotate(0)} 25%{transform:rotate(-7deg) scale(1.05)}
  60%{transform:rotate(7deg) scale(1.05)} 100%{transform:rotate(0)} }
@keyframes g09-bounce { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-22px) scale(1.06)} }
.g09-ref-name { margin-top:4px; font-size:22px; font-weight:800; color:var(--ink-soft); }

/* 공통 본문 컬럼 */
.g09-main { position:absolute; left:36px; top:16px; width:724px; }
.g09-card { background:var(--paper); border-radius:22px; box-shadow:var(--shadow); padding:16px 18px; }
.g09-sport { font-size:32px; font-weight:800; text-align:center; margin-bottom:12px; }
.g09-players { display:flex; align-items:center; gap:10px; }
.g09-player { flex:1; background:#fff; border-radius:18px; padding:12px 6px; text-align:center;
  box-shadow:inset 0 0 0 3px rgba(58,51,82,.08); }
.g09-badge { width:70px; height:70px; margin:0 auto 6px; display:flex; align-items:center;
  justify-content:center; font-size:34px; }
.g09-badge.dong { background:var(--sky); border-radius:50%; border:4px solid #4aa3e0; }
.g09-badge.nemo { background:var(--yellow); border-radius:10px; border:4px solid #d9b21a; }
.g09-team { font-size:22px; font-weight:800; color:var(--ink-soft); }
.g09-pname { font-size:26px; font-weight:800; }
.g09-rec { display:inline-block; font-size:32px; font-weight:800; color:var(--purple); margin-top:2px;
  border-radius:10px; padding:2px 8px; transition:background .2s ease; }
.g09-rec.hl { background:var(--yellow); color:var(--ink); animation:g09-pulse .5s ease 2; }
@keyframes g09-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
.g09-vs { font-size:26px; font-weight:800; color:var(--ink-soft); }
.g09-verdict { margin-top:12px; background:#fff3c4; border:3px solid var(--yellow); border-radius:16px;
  padding:10px 12px; text-align:center; font-size:26px; font-weight:800; }
.g09-vsmall { font-size:22px; color:var(--ink-soft); font-weight:800; }
.g09-sub { font-size:22px; font-weight:800; color:var(--ink-soft); }

.g09-btns { display:flex; gap:18px; margin-top:18px; }
.g09-btns .btn { flex:1; min-height:88px; font-size:30px; padding:14px 10px; }
.g09-prog { margin-top:14px; display:flex; align-items:center; justify-content:center; gap:10px;
  font-size:24px; font-weight:800; color:var(--ink-soft); }
.g09-dot { width:22px; height:22px; border-radius:50%; background:rgba(58,51,82,.16); }
.g09-dot.ok { background:var(--green); }
.g09-dot.no { background:var(--red); }

/* 판정 노트 / 원인 찾기 */
.g09-h { font-size:30px; font-weight:800; text-align:center; margin-bottom:14px; }
.g09-note { display:flex; align-items:center; gap:10px; background:#fff; border-radius:16px;
  padding:14px 16px; font-size:22px; font-weight:700; margin-bottom:12px; box-shadow:var(--shadow); }
.g09-note-em { font-size:24px; font-weight:800; white-space:nowrap; }
.g09-victim { border-radius:8px; padding:2px 8px; transition:background .25s ease; }
.g09-victim.on { background:var(--yellow); }
.g09-big { margin-top:6px; text-align:center; font-size:32px; font-weight:800; color:var(--red);
  animation:g09-popin .35s ease; }
@keyframes g09-popin { from{transform:scale(.7);opacity:0} to{transform:scale(1);opacity:1} }
.g09-choice { display:block; width:100%; min-height:76px; margin-bottom:14px; font-size:26px; }
.g09-center { text-align:center; margin-top:8px; }

/* 데이터 저울 */
.g09-scale { position:absolute; left:36px; top:6px; width:724px; height:450px; }
.g09-scale-title { text-align:center; font-size:25px; font-weight:800; color:var(--ink-soft); }
.g09-stand { position:absolute; left:50%; margin-left:-9px; top:112px; width:18px; height:250px;
  background:#b6a9e8; border-radius:9px; }
.g09-base { position:absolute; left:50%; margin-left:-110px; top:352px; width:220px; height:22px;
  background:#8a7ad6; border-radius:11px; }
.g09-beam { position:absolute; left:100px; top:104px; width:520px; height:20px; background:#8a7ad6;
  border-radius:10px; transform-origin:50% 50%; transition:transform .45s ease; }
.g09-pin { position:absolute; left:50%; top:50%; width:34px; height:34px; margin:-17px 0 0 -17px;
  background:var(--purple); border-radius:50%; }
.g09-pan { position:absolute; top:16px; width:220px; transform-origin:50% 0;
  transition:transform .45s ease; }
.g09-pan.left { left:-110px; }
.g09-pan.right { left:410px; }
.g09-rope { width:5px; height:34px; margin:0 auto; background:rgba(58,51,82,.3); }
.g09-pan-body { position:relative; background:#fff; border-radius:16px; box-shadow:var(--shadow);
  padding:10px 8px 12px; text-align:center; }
.g09-pan-label { font-size:22px; font-weight:800; line-height:1.35; }
.g09-stack { width:160px; margin:8px auto 0; height:14px; border-radius:8px;
  border:3px solid rgba(58,51,82,.2); transition:height .3s ease;
  background-image:repeating-linear-gradient(180deg, rgba(255,255,255,.9) 0 3px, rgba(255,255,255,0) 3px 9px); }
.g09-stack.dong { background-color:var(--sky); }
.g09-stack.nemo { background-color:var(--yellow); }
.g09-pan.win .g09-pan-body { animation:g09-shine .5s ease 3; }
@keyframes g09-shine { 0%,100%{box-shadow:var(--shadow)} 50%{box-shadow:0 0 0 9px rgba(255,217,61,.8)} }
.g09-falling { position:absolute; left:50%; margin-left:-80px; top:44px; width:160px; height:34px;
  border-radius:8px; background:rgba(255,255,255,.95); border:3px solid rgba(58,51,82,.3);
  animation:g09-fall .3s ease forwards; }
@keyframes g09-fall { from{transform:translateY(-170px); opacity:0} to{transform:translateY(0); opacity:1} }

.g09-scale-btns { position:absolute; left:36px; top:466px; width:724px; display:flex; gap:18px; }
.g09-scale-btns .btn { flex:1; min-height:86px; font-size:25px; padding:12px 8px; }
.g09-msg { position:absolute; left:36px; top:572px; width:724px; text-align:center; font-size:23px;
  font-weight:800; color:var(--ink-soft); background:rgba(255,255,255,.88); border-radius:16px;
  padding:12px 14px; box-shadow:var(--shadow); }

/* 재판정 */
.g09-picks { display:flex; gap:20px; margin-top:16px; }
.g09-pick { flex:1; min-height:170px; border:none; cursor:pointer; font-family:var(--font);
  color:var(--ink); background:#fff; border-radius:20px; box-shadow:var(--shadow); padding:14px 8px;
  text-align:center; transition:transform .08s ease, box-shadow .15s ease; }
.g09-pick:active { transform:translateY(5px); }
.g09-pick.ok { box-shadow:0 0 0 6px var(--green); }
.g09-pick.no { box-shadow:0 0 0 6px var(--red); }

.g09-over-lines { font-size:24px; line-height:1.7; color:var(--ink-soft); margin-bottom:14px; }
.g09-over-score { font-size:64px; font-weight:800; color:var(--purple); }
.g09-over-say { font-size:23px; font-weight:800; margin:12px 0 18px; }
`;

// ---------- 헬퍼 ----------

function teamName(t: Team): string {
  return t === 'dong' ? '동글팀' : '네모팀';
}

/** 앞말의 받침 유무에 따라 '이' 또는 '가'를 돌려준다 (한글이 아니면 '가') */
function josaIGa(word: string): string {
  const code = word.charCodeAt(word.length - 1);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 !== 0 ? '이' : '가';
  }
  return '가';
}

function playerHtml(p: Player): string {
  return `
    <div class="g09-badge ${p.team}">🤖</div>
    <div class="g09-team">${p.team === 'dong' ? '🔵' : '🟨'} ${teamName(p.team)}</div>
    <div class="g09-pname">${p.name}</div>
    <div><span class="g09-rec">${p.rec}</span></div>`;
}

export const game09: MiniGame = {
  lessonId: 9,
  mount(container: HTMLElement, ctx: GameCtx) {
    const styleEl = document.createElement('style');
    styleEl.id = 'g09-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    const wrap = el('div', 'game-wrap g09-scene');
    container.appendChild(wrap);

    const timers: number[] = [];
    let tick = 0;
    let exited = false; // finish/quit 중복 방지
    let score = 0;

    // 진행 상태
    const results: (boolean | null)[] = CASES.map(() => null);
    let p1Correct = 0;
    let causeTries = 0;
    let causeScore = 0;
    let scaleScore = 0;
    let scaleTaps = 0;
    let scaleOk = false;
    let p4Correct = 0;

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quitBtn = button(
      '🗺️',
      () => {
        if (exited) return;
        exited = true;
        ctx.quit();
      },
      'icon-btn'
    );
    const nameEl = el('div', 'game-name', '🏅 AI 심판 고치기');
    const timerBar = el('div', 'timer-bar');
    const fill = el('div', 'timer-fill');
    timerBar.appendChild(fill);
    const scoreEl = el('div', 'game-score', '점수 0');
    topbar.append(quitBtn, nameEl, timerBar, scoreEl);
    wrap.appendChild(topbar);

    // ---------- 무대 ----------
    const stage = el('div', 'g09-stage');
    wrap.appendChild(stage);

    // ---------- 심판 휘슬 ----------
    const ref = el('div', 'g09-ref');
    const speech = el('div', 'g09-speech', '내 판정은 완벽하다고!');
    const refBody = el('div', 'g09-ref-body');
    refBody.appendChild(charImg('char09', '', '휘슬'));
    const refName = el('div', 'g09-ref-name', '🤖 심판 휘슬');
    ref.append(speech, refBody, refName);
    wrap.appendChild(ref);

    function say(html: string) {
      speech.innerHTML = html;
    }
    function blow() {
      ref.classList.remove('blow');
      void ref.offsetWidth;
      ref.classList.add('blow');
    }

    function addScore(n: number) {
      score = Math.max(0, Math.min(100, score + n));
      scoreEl.textContent = `점수 ${score}`;
    }

    // ---------- 문항 타이머 ----------
    function stopTimer() {
      if (tick) {
        clearInterval(tick);
        tick = 0;
      }
    }
    function hideTimer() {
      stopTimer();
      fill.style.width = '0%';
      fill.classList.remove('danger');
    }
    function startTimer(limit: number, onOut: () => void) {
      stopTimer();
      let t = limit;
      fill.style.width = '100%';
      fill.classList.remove('danger');
      tick = window.setInterval(() => {
        if (exited) return;
        t -= 0.1;
        fill.style.width = `${Math.max(0, (t / limit) * 100)}%`;
        fill.classList.toggle('danger', t < 5);
        if (t <= 0) {
          stopTimer();
          onOut();
        }
      }, 100);
      timers.push(tick);
    }

    // ============================================================
    // 페이즈 1: 판정 검토
    // ============================================================
    function progressHtml(upto: number): string {
      const dots = results
        .map((r, i) => {
          const cls = r === null ? '' : r ? ' ok' : ' no';
          return `<div class="g09-dot${i < upto ? cls : ''}"></div>`;
        })
        .join('');
      return `<span>📋 ${Math.min(upto + 1, CASES.length)} / ${CASES.length}</span>${dots}`;
    }

    function runP1(i: number) {
      if (exited) return;
      if (i >= CASES.length) {
        hideTimer();
        timers.push(window.setTimeout(runP2Notes, 500));
        return;
      }
      const c = CASES[i];
      stage.innerHTML = '';

      const main = el('div', 'g09-main');
      const card = el('div', 'g09-card');
      card.innerHTML = `
        <div class="g09-sport">${c.emoji} ${c.sport} <span class="g09-sub">(숫자가 클수록 잘한 기록)</span></div>
        <div class="g09-players">
          <div class="g09-player" data-side="left">${playerHtml(c.left)}</div>
          <div class="g09-vs">VS</div>
          <div class="g09-player" data-side="right">${playerHtml(c.right)}</div>
        </div>
        <div class="g09-verdict">
          <span class="g09-vsmall">🤖 휘슬의 판정</span><br>🏆 ${c.verdict} 승!
        </div>`;

      const btns = el('div', 'g09-btns');
      const fairBtn = button('⭕ 공정한 판정', () => pick(true), 'btn mint');
      const badBtn = button('❌ 이상한 판정', () => pick(false), 'btn pink');
      btns.append(fairBtn, badBtn);

      const prog = el('div', 'g09-prog', progressHtml(i));
      main.append(card, btns, prog);
      stage.appendChild(main);

      say(`🏆 ${c.verdict} 승! 내 판정은 완벽해!`);
      blow();

      let answered = false;

      function nextAfter(ms: number) {
        timers.push(window.setTimeout(() => runP1(i + 1), ms));
      }

      function highlightRecords() {
        card.querySelectorAll<HTMLElement>('.g09-rec').forEach((r) => r.classList.add('hl'));
        timers.push(
          window.setTimeout(() => {
            card.querySelectorAll<HTMLElement>('.g09-rec').forEach((r) => r.classList.remove('hl'));
          }, 1000)
        );
      }

      function lock() {
        fairBtn.disabled = true;
        badBtn.disabled = true;
      }

      function pick(sayFair: boolean) {
        if (answered || exited) return;
        answered = true;
        stopTimer();
        lock();
        const ok = sayFair === c.fair;
        results[i] = ok;
        prog.innerHTML = progressHtml(i + 1);
        if (ok) {
          p1Correct++;
          addScore(8);
          ctx.audio.good();
          floater(wrap, 400, 330, '잘 봤어! ⭕', true);
          nextAfter(600);
        } else {
          ctx.audio.bad();
          floater(wrap, 400, 330, '기록을 다시 봐!', false);
          highlightRecords();
          nextAfter(1500);
        }
      }

      startTimer(P1_TIME, () => {
        if (answered || exited) return;
        answered = true;
        lock();
        results[i] = false;
        prog.innerHTML = progressHtml(i + 1);
        ctx.audio.bad();
        floater(wrap, 400, 330, '시간 초과!', false);
        highlightRecords();
        nextAfter(1500);
      });
    }

    // ============================================================
    // 페이즈 2-1: 판정 노트 요약 (패턴 발견)
    // ============================================================
    function runP2Notes() {
      if (exited) return;
      hideTimer();
      stage.innerHTML = '';

      const main = el('div', 'g09-main');
      const head = el('div', 'g09-h', '📋 휘슬의 이상한 판정 3건');
      main.appendChild(head);

      UNFAIR.forEach((idx) => {
        const c = CASES[idx];
        const row = el('div', 'g09-note');
        row.innerHTML = `
          <span class="g09-note-em">${c.emoji} ${c.sport}</span>
          <span>기록: <span class="g09-victim">🟨 ${c.right.name} ${c.right.rec}</span>${josaIGa(c.right.rec)} 앞섬 → 판정: <b>🔵 ${c.verdict} 승</b></span>`;
        main.appendChild(row);
      });

      const bigBox = el('div', '');
      main.appendChild(bigBox);
      const centerBox = el('div', 'g09-center');
      main.appendChild(centerBox);
      stage.appendChild(main);

      say('그, 그럴 리가… 내 판정이 치우쳤다고?');

      const victims = Array.from(main.querySelectorAll<HTMLElement>('.g09-victim'));
      victims.forEach((v, k) => {
        timers.push(
          window.setTimeout(() => {
            v.classList.add('on');
            ctx.audio.pop();
          }, 400 + k * 300)
        );
      });

      timers.push(
        window.setTimeout(() => {
          if (exited) return;
          bigBox.innerHTML =
            '<div class="g09-big">이상한 판정의 피해자는 전부 <b>네모팀</b>!</div>';
          ctx.audio.pop();
          const next = button('왜 그럴까? 🤔', () => runP2Cause(), 'btn big yellow');
          centerBox.appendChild(next);
        }, 1700)
      );
    }

    // ============================================================
    // 페이즈 2-2: 원인 3지선다
    // ============================================================
    function runP2Cause() {
      if (exited) return;
      stage.innerHTML = '';

      const main = el('div', 'g09-main');
      main.appendChild(el('div', 'g09-h', '🤔 휘슬은 왜 네모팀에게만 불리했을까?'));

      const btnList: HTMLButtonElement[] = [];
      CAUSES.forEach((text, k) => {
        const b = button(
          `${['①', '②', '③'][k]} ${text}`,
          () => choose(k),
          'btn ghost g09-choice'
        );
        btnList.push(b);
        main.appendChild(b);
      });
      stage.appendChild(main);
      say('내가 왜 그랬을까… 너라면 알 것 같아.');

      let solved = false;
      function choose(k: number) {
        if (solved || exited) return;
        if (k === CAUSE_ANSWER) {
          solved = true;
          btnList.forEach((b) => (b.disabled = true));
          causeScore = causeTries === 0 ? 12 : causeTries === 1 ? 6 : 0;
          addScore(causeScore);
          ctx.audio.good();
          floater(wrap, 400, 330, '정답! ⭕', true);
          say('맞아… 나는 동글팀 영상만 잔뜩 보고 배웠어.');
          timers.push(window.setTimeout(revealScale, 900));
        } else {
          causeTries++;
          btnList[k].disabled = true;
          ctx.audio.bad();
          say(CAUSE_HINTS[k]);
          floater(wrap, 400, 330, '다시 생각해 봐!', false);
        }
      }
    }

    // ============================================================
    // 페이즈 2-3 / 3: 데이터 저울
    // ============================================================
    let dataL = 18;
    let dataR = 2;
    let beam: HTMLElement;
    let panL: HTMLElement;
    let panR: HTMLElement;
    let stackL: HTMLElement;
    let stackR: HTMLElement;
    let labelL: HTMLElement;
    let labelR: HTMLElement;
    let msg: HTMLElement;

    function stackHeight(n: number): number {
      return Math.min(n, 30) * 4 + 12;
    }

    function updateScale() {
      const a = Math.max(-14, Math.min(14, (dataL - dataR) * 0.75));
      beam.style.transform = `rotate(${-a}deg)`;
      panL.style.transform = `rotate(${a}deg)`;
      panR.style.transform = `rotate(${a}deg)`;
      stackL.style.height = `${stackHeight(dataL)}px`;
      stackR.style.height = `${stackHeight(dataR)}px`;
      labelL.innerHTML = `🔵 동글팀 경기 영상<br><b>${dataL}개</b>`;
      labelR.innerHTML = `🟨 네모팀 경기 영상<br><b>${dataR}개</b>`;
    }

    function buildPan(side: 'left' | 'right') {
      const pan = el('div', `g09-pan ${side}`);
      pan.appendChild(el('div', 'g09-rope'));
      const body = el('div', 'g09-pan-body');
      const label = el('div', 'g09-pan-label');
      const stack = el('div', `g09-stack ${side === 'left' ? 'dong' : 'nemo'}`);
      body.append(label, stack);
      pan.appendChild(body);
      return { pan, body, label, stack };
    }

    function revealScale() {
      if (exited) return;
      stage.innerHTML = '';

      const scale = el('div', 'g09-scale');
      scale.appendChild(el('div', 'g09-scale-title', '⚖️ 휘슬이 배운 학습 데이터'));
      scale.appendChild(el('div', 'g09-stand'));
      scale.appendChild(el('div', 'g09-base'));

      beam = el('div', 'g09-beam');
      const L = buildPan('left');
      const R = buildPan('right');
      panL = L.pan;
      panR = R.pan;
      stackL = L.stack;
      stackR = R.stack;
      labelL = L.label;
      labelR = R.label;
      beam.append(el('div', 'g09-pin'), panL, panR);
      scale.appendChild(beam);
      stage.appendChild(scale);

      msg = el('div', 'g09-msg', '🤖 에티: 저울이 완전히 기울었네! 이러니 판정도 기울 수밖에.');
      stage.appendChild(msg);

      updateScale();
      ctx.audio.bad();
      say('내 머릿속이… 이렇게 기울어져 있었구나…');

      timers.push(window.setTimeout(runP3, 1400));
    }

    function dropCards(body: HTMLElement) {
      const f = el('div', 'g09-falling');
      body.appendChild(f);
      timers.push(window.setTimeout(() => f.remove(), 340));
    }

    function runP3() {
      if (exited) return;
      const btnRow = el('div', 'g09-scale-btns');
      const addDong = button(
        '＋ 동글팀 데이터 4개',
        () => tap('dong'),
        'btn'
      );
      addDong.style.background = 'var(--sky)';
      addDong.style.color = 'var(--ink)';
      addDong.style.boxShadow = '0 6px 0 #4aa3e0';
      const addNemo = button(
        '＋ 네모팀 데이터 4개',
        () => tap('nemo'),
        'btn yellow'
      );
      btnRow.append(addDong, addNemo);
      stage.appendChild(btnRow);

      msg.innerHTML = `양쪽 데이터 개수를 <b>똑같이</b> 맞춰 줘! 남은 기회 <b>${TAP_BUDGET}</b>번`;
      say('저울을 맞춰 주면 내가 다시 볼 수 있을 것 같아!');

      let done = false;

      function lock() {
        addDong.disabled = true;
        addNemo.disabled = true;
      }

      function tap(team: Team) {
        if (done || exited || scaleTaps >= TAP_BUDGET) return;
        scaleTaps++;
        if (team === 'dong') {
          dataL += 4;
          dropCards(stackL.parentElement as HTMLElement);
        } else {
          dataR += 4;
          dropCards(stackR.parentElement as HTMLElement);
        }
        ctx.audio.pop();
        updateScale();

        if (dataL === dataR) {
          done = true;
          scaleOk = true;
          lock();
          scaleScore = Math.max(0, 12 - (scaleTaps - 4) * 2);
          addScore(scaleScore);
          panL.classList.add('win');
          panR.classList.add('win');
          ref.classList.add('fixed');
          ctx.audio.fanfare();
          msg.innerHTML = `✨ 저울이 평평해졌어요! (사용한 기회 <b>${scaleTaps}</b>번)`;
          say('✨ 몸이 가벼워졌어! 이제 양쪽이 똑같이 보여!');
          timers.push(window.setTimeout(() => runP4(0), 2000));
          return;
        }

        const left = TAP_BUDGET - scaleTaps;
        if (left <= 0) {
          done = true;
          lock();
          scaleScore = 0;
          ctx.audio.bad();
          msg.innerHTML = '기회를 다 썼어요… 에티가 대신 저울을 맞춰 줄게요!';
          timers.push(
            window.setTimeout(() => {
              if (exited) return;
              const max = Math.max(dataL, dataR);
              dataL = max;
              dataR = max;
              updateScale();
              scaleOk = true;
              panL.classList.add('win');
              panR.classList.add('win');
              ref.classList.add('fixed');
              ctx.audio.fanfare();
              msg.innerHTML = '🤖 에티: 자, 이제 양쪽이 똑같아졌어! 다음엔 네가 맞춰 보자.';
              say('✨ 몸이 가벼워졌어! 이제 양쪽이 똑같이 보여!');
              timers.push(window.setTimeout(() => runP4(0), 2000));
            }, 1500)
          );
          return;
        }

        const gap = dataL > dataR ? '동글팀' : '네모팀';
        msg.innerHTML = `아직 <b>${gap}</b> 쪽이 더 무거워요! 남은 기회 <b>${left}</b>번`;
      }
    }

    // ============================================================
    // 페이즈 4: 재판정 확인
    // ============================================================
    function runP4(i: number) {
      if (exited) return;
      if (i >= UNFAIR.length) {
        hideTimer();
        timers.push(window.setTimeout(showResult, 600));
        return;
      }
      const c = CASES[UNFAIR[i]];
      const winner = c.better === 'left' ? c.left : c.right;
      stage.innerHTML = '';

      const main = el('div', 'g09-main');
      main.appendChild(
        el('div', 'g09-h', `🧑‍⚖️ 네가 심판이라면? (${i + 1} / ${UNFAIR.length})`)
      );

      const card = el('div', 'g09-card');
      card.innerHTML = `<div class="g09-sport">${c.emoji} ${c.sport} <span class="g09-sub">(기록이 앞선 선수를 탭!)</span></div>`;
      const picks = el('div', 'g09-picks');
      const leftBtn = el('button', 'g09-pick', playerHtml(c.left));
      const rightBtn = el('button', 'g09-pick', playerHtml(c.right));
      picks.append(leftBtn, rightBtn);
      card.appendChild(picks);
      main.appendChild(card);
      stage.appendChild(main);

      say('이번엔 네가 먼저 판정해 봐. 나도 따라 해 볼게!');

      let answered = false;

      function done(ok: boolean, picked: HTMLElement | null) {
        if (answered || exited) return;
        answered = true;
        stopTimer();
        leftBtn.disabled = true;
        rightBtn.disabled = true;
        const winBtn = c.better === 'left' ? leftBtn : rightBtn;
        if (ok) {
          p4Correct++;
          addScore(4);
          winBtn.classList.add('ok');
          ctx.audio.good();
          blow();
          say(`🏆 ${winner.name} 승! 이번엔 기록만 보고 판정했어!`);
          floater(wrap, 400, 340, '휘슬도 같은 판정! ⭕', true);
        } else {
          if (picked) picked.classList.add('no');
          winBtn.classList.add('ok');
          ctx.audio.bad();
          say(`기록을 보면 ${winner.name}${josaIGa(winner.name)} 앞섰어. 승자는 ${winner.name}!`);
          floater(wrap, 400, 340, '기록을 다시 봐!', false);
        }
        timers.push(window.setTimeout(() => runP4(i + 1), 1700));
      }

      leftBtn.addEventListener('click', () => {
        if (answered) return;
        ctx.audio.click();
        done(c.better === 'left', leftBtn);
      });
      rightBtn.addEventListener('click', () => {
        if (answered) return;
        ctx.audio.click();
        done(c.better === 'right', rightBtn);
      });

      startTimer(P4_TIME, () => done(false, null));
    }

    // ============================================================
    // 종료
    // ============================================================
    function showResult() {
      if (exited) return;
      hideTimer();
      const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>휘슬을 고쳤다! ⚖️</h2>
        <div class="g09-over-score">${score}점</div>
        <div class="stars">${starsHtml(stars)}</div>
        <div class="g09-over-lines">
          공정 판정 찾기 <b>${p1Correct} / ${CASES.length}</b><br>
          원인 발견 <b>${causeScore >= 12 ? '⭕' : causeScore > 0 ? '△' : '✖'}</b><br>
          저울 맞추기 <b>${scaleOk && scaleScore > 0 ? '⭕' : scaleOk ? '△' : '✖'}</b>
          <span class="g09-vsmall">(탭 ${scaleTaps}회)</span><br>
          재판정 <b>${p4Correct} / ${UNFAIR.length}</b>
        </div>
        <div class="g09-over-say">🤖 휘슬: 증거를 보고 따져 줘서 고마워!<br>이제 공정한 심판이 될게!</div>`;
      const doneBtn = button(
        '결과 보기 🏆',
        () => {
          if (exited) return;
          exited = true;
          ctx.finish(score);
        },
        'btn big yellow'
      );
      cardEl.appendChild(doneBtn);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      ctx.audio.fanfare();
    }

    // ---------- 시작 ----------
    runP1(0);

    return () => {
      exited = true;
      stopTimer();
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      styleEl.remove();
      wrap.remove();
    };
  }
};
