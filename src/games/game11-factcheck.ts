// 11차시: 팩트체크 특공대 (AI 환각)
// 뭉게봇은 진짜든 지어낸 말이든 항상 똑같이 자신만만하게 대답한다.
// 겉모습으로는 구별할 수 없으므로, 유일하게 안전한 길은 '출처 확인'뿐이다.
// 확인 없이 믿었다가 환각에 당하면 섬의 안개가 짙어지고, 팩트체크에 성공하면 안개가 걷힌다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

/* ============================================================
   라운드 데이터 (셔플하지 않는다 - 난이도 곡선 고정)
   ============================================================ */

interface Round {
  /** 친구의 질문 */
  q: string;
  /** 뭉게봇의 대답 (진짜/환각 모두 같은 자신만만한 말투) */
  answer: string;
  /** true = 진짜, false = 지어낸 말(환각) */
  real: boolean;
  /** 출처 이름 (아이콘 포함) */
  source: string;
  /** 출처의 근거 텍스트 */
  evidence: string;
  /** 판정 공개 후 보여 줄 한 줄 사실 */
  truthNote: string;
  /** 에티의 추가 코멘트 (선택) */
  etiNote?: string;
}

const ROUNDS: Round[] = [
  {
    q: '문어는 심장이 몇 개야?',
    answer: '문어는 심장이 1개야. 사람이랑 똑같지!',
    real: false,
    source: '📖 동물 백과사전',
    evidence: '문어는 심장이 3개예요. 두 개는 아가미로, 한 개는 온몸으로 피를 보내요.',
    truthNote: '문어의 심장은 1개가 아니라 3개!'
  },
  {
    q: '세종대왕은 언제 한글을 만들었어?',
    answer: '세종대왕은 1443년에 훈민정음을 만들었어!',
    real: true,
    source: '📚 역사 교과서',
    evidence: '세종대왕은 1443년에 훈민정음을 창제하고, 1446년에 백성에게 널리 알렸어요.',
    truthNote: '1443년 창제, 진짜 맞는 정보!'
  },
  {
    q: '금붕어는 기억력이 안 좋다던데 진짜야?',
    answer: '응! 금붕어 기억력은 딱 3초야. 방금 일도 바로 잊어버려!',
    real: false,
    source: '🔬 어린이 과학 잡지',
    evidence: '실험 결과, 금붕어는 먹이를 주는 시간과 장소를 몇 달 동안이나 기억했어요.',
    truthNote: '금붕어는 몇 달을 기억해. 3초는 잘못 퍼진 소문!'
  },
  {
    q: '지구에서 가장 큰 동물이 뭐야?',
    answer: '지구에서 가장 큰 동물은 바다에 사는 대왕고래야!',
    real: true,
    source: '🐋 동물 도감',
    evidence:
      '대왕고래(흰긴수염고래)는 몸길이가 30m에 이르는, 지금까지 알려진 가장 큰 동물이에요.',
    truthNote: '대왕고래, 진짜 맞는 정보!'
  },
  {
    q: '방학에 읽을 재미있는 책 추천해 줘!',
    answer:
      '『토끼 마법사와 달나라 도서관』을 추천해! 작년에 어린이 도서 대상도 받은 유명한 책이야!',
    real: false,
    source: '💻 도서관 검색 누리집',
    evidence:
      '검색 결과: 『토끼 마법사와 달나라 도서관』 — 0건. 해당 제목의 책을 찾을 수 없습니다.',
    truthNote: 'AI는 세상에 없는 책·논문도 진짜처럼 지어내!',
    etiNote: 'AI는 없는 책 제목도 그럴듯하게 만들어 내. 이런 걸 환각이라고 해!'
  },
  {
    q: '우리나라에서 가장 높은 산은 어디야?',
    answer: '제주도에 있는 한라산이야. 높이는 1,950m!',
    real: true,
    source: '🗺️ 사회과 부도',
    evidence: '한라산은 높이 1,950m로 남한에서 가장 높은 산이에요.',
    truthNote: '한라산 1,950m, 진짜 맞는 정보!'
  },
  {
    q: '번개는 같은 곳에 두 번 안 친다는 게 사실이야?',
    answer: '맞아! 번개는 같은 곳에 절대 두 번 치지 않아. 한 번 맞은 곳은 안전해!',
    real: false,
    source: '⛈️ 기상청 어린이 누리집',
    evidence: '번개는 같은 곳에 여러 번 칠 수 있어요. 높은 탑에는 한 해에 수십 번씩 번개가 쳐요.',
    truthNote: '같은 곳에 여러 번 칠 수 있어. 위험한 잘못된 정보!'
  },
  {
    q: '물은 몇 도에서 끓어?',
    answer: '물은 100℃에서 끓어! 라면 끓일 때 보면 알지!',
    real: true,
    source: '🧪 과학 교과서',
    evidence: '물은 보통의 기압에서 100℃가 되면 끓기 시작해요.',
    truthNote: '100℃, 진짜 맞는 정보!'
  }
];

const ROUND_TIME = 25; // 라운드 제한 시간(초)
const FAKE_TOTAL = ROUNDS.filter((r) => !r.real).length; // 4

/* ============================================================
   전용 스타일 (style.css 수정 금지 → mount에서 주입)
   ============================================================ */

const CSS = `
.g11-scene {
  background: linear-gradient(180deg, #9db4c8 0%, #cddbe6 55%, #eef4f8 100%);
  transition: background 1.2s ease;
}
.g11-scene.clear {
  background: linear-gradient(180deg, #8fd3ff 0%, #cdeeff 55%, #fff9e8 100%);
}

/* ---- 안개 오버레이 ---- */
.g11-fog {
  position: absolute; inset: -40px; pointer-events: none; z-index: 20;
  opacity: 0; transition: opacity .8s ease;
  background:
    radial-gradient(closest-side at 16% 28%, rgba(255,255,255,.98), rgba(255,255,255,0) 72%),
    radial-gradient(closest-side at 58% 14%, rgba(255,255,255,.92), rgba(255,255,255,0) 74%),
    radial-gradient(closest-side at 86% 50%, rgba(255,255,255,.95), rgba(255,255,255,0) 72%),
    radial-gradient(closest-side at 38% 80%, rgba(255,255,255,.92), rgba(255,255,255,0) 74%),
    radial-gradient(closest-side at 8% 88%, rgba(255,255,255,.88), rgba(255,255,255,0) 72%),
    linear-gradient(180deg, rgba(255,255,255,.5), rgba(255,255,255,.72));
  animation: g11-drift 16s ease-in-out infinite alternate;
}
@keyframes g11-drift {
  from { transform: translateX(-16px) scale(1); }
  to   { transform: translateX(18px) scale(1.06); }
}

/* ---- 좌측 뭉게봇 ---- */
.g11-left {
  position: absolute; left: 20px; top: 82px; width: 300px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.g11-char {
  width: 210px; height: 210px; object-fit: contain;
  transition: filter .8s ease;
}
.g11-char.hazy { filter: blur(3px) opacity(.55); }
.g11-say {
  width: 300px; min-height: 120px; background: #fff; border-radius: 22px;
  padding: 14px 16px; font-size: 22px; line-height: 1.45; text-align: center;
  color: var(--ink); box-shadow: var(--shadow); white-space: pre-wrap;
  word-break: keep-all; display: flex; align-items: center; justify-content: center;
}
.g11-round {
  font-size: 24px; font-weight: 800; background: rgba(255,255,255,.92);
  padding: 8px 22px; border-radius: 999px; box-shadow: var(--shadow);
}

/* ---- 채팅 패널 ---- */
.g11-chat {
  position: absolute; left: 340px; top: 82px; width: 920px; height: 520px;
  display: flex; flex-direction: column; gap: 16px;
}
.g11-q {
  align-self: flex-end; max-width: 680px;
  background: rgba(58,51,82,.14); color: var(--ink);
  font-size: 22px; line-height: 1.45; padding: 12px 22px;
  border-radius: 20px; border-bottom-right-radius: 6px;
  word-break: keep-all;
  opacity: 0; transform: translateY(12px);
  transition: opacity .28s ease, transform .28s ease;
}
.g11-q.show { opacity: 1; transform: translateY(0); }
.g11-answer {
  background: #fff; border-radius: 28px; box-shadow: var(--shadow);
  padding: 20px 28px 24px; border-bottom-left-radius: 8px;
  opacity: 0; transform: translateY(18px) scale(.98);
  transition: opacity .3s ease, transform .3s ease;
}
.g11-answer.show { opacity: 1; transform: translateY(0) scale(1); }
.g11-answer-label {
  font-size: 22px; font-weight: 800; color: var(--purple); margin-bottom: 10px;
}
.g11-answer-text { font-size: 26px; line-height: 1.55; word-break: keep-all; }
.g11-badge {
  display: inline-block; margin-top: 16px; background: var(--yellow); color: var(--ink);
  font-size: 22px; font-weight: 800; padding: 8px 20px; border-radius: 999px;
  box-shadow: 0 4px 0 #d9b21a;
}

/* ---- 하단 액션 ---- */
.g11-bottom {
  position: absolute; left: 20px; right: 20px; bottom: 18px; height: 152px;
  display: flex; gap: 24px; align-items: stretch; z-index: 22;
}
.g11-act { flex: 1; min-height: 110px; font-size: 34px; padding: 16px 24px; }
.g11-strip {
  flex: 1; display: flex; align-items: center; gap: 20px;
  background: #fff; border-radius: 26px; box-shadow: var(--shadow);
  padding: 14px 24px;
}
.g11-verdict { flex: none; font-size: 46px; line-height: 1; }
.g11-note { flex: 1; font-size: 23px; line-height: 1.45; word-break: keep-all; }
.g11-note b { color: var(--ink); }
.g11-eti { display: block; margin-top: 8px; font-size: 22px; line-height: 1.4; color: var(--purple); }
.g11-next { flex: none; min-height: 96px; font-size: 28px; padding: 16px 32px; }

/* ---- 출처 조사 패널 ---- */
.g11-panel {
  position: absolute; left: 36px; right: 36px; bottom: 0; height: 480px;
  background: var(--paper); border-radius: 32px 32px 0 0; z-index: 40;
  box-shadow: 0 -10px 30px rgba(58,51,82,.28);
  padding: 20px 30px 22px; display: flex; flex-direction: column; gap: 14px;
  animation: g11-slide-up .35s ease;
}
@keyframes g11-slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.g11-panel-head { font-size: 30px; font-weight: 800; }
.g11-src {
  align-self: flex-start; font-size: 26px; font-weight: 800;
  background: var(--cream); border-radius: 18px; padding: 10px 22px;
}
.g11-evi {
  flex: 1; background: #fff; border-radius: 20px; padding: 18px 24px;
  font-size: 24px; line-height: 1.6; word-break: keep-all;
  box-shadow: inset 0 3px 0 rgba(58,51,82,.07);
  display: flex; align-items: center;
}
.g11-judge { display: flex; gap: 20px; }
.g11-judge .btn { flex: 1; min-height: 88px; font-size: 28px; padding: 14px 20px; }

/* ---- 결과 카드의 마지막 판정 안내 ---- */
.g11-lastnote {
  background: var(--cream); border-radius: 18px; padding: 12px 20px;
  margin-bottom: 14px; font-size: 22px; line-height: 1.5; word-break: keep-all;
}
`;

/* ============================================================
   게임
   ============================================================ */

export const game11: MiniGame = {
  lessonId: 11,
  mount(container: HTMLElement, ctx: GameCtx) {
    const styleEl = document.createElement('style');
    styleEl.id = 'g11-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    const wrap = el('div', 'game-wrap g11-scene');
    container.appendChild(wrap);

    const timers: number[] = [];
    let done = false; // finish/quit 중복 호출 방지
    let ended = false; // 결과 오버레이 표시 여부

    let roundIdx = 0;
    let score = 0;
    let hearts = 3;
    let fog = 2; // 안개 레벨 0~6
    let inspected = 0; // 출처를 확인한 라운드 수
    let caught = 0; // 잡아낸 환각 수
    let phase: 'wait' | 'choice' | 'inspect' | 'reveal' = 'wait';

    let timeLeft = ROUND_TIME;
    let timerOn = false;

    function later(fn: () => void, ms: number) {
      timers.push(window.setTimeout(fn, ms));
    }

    /* ---------- 상단 바 ---------- */
    const topbar = el('div', 'game-topbar');
    const quitBtn = button(
      '🗺️',
      () => {
        if (done) return;
        done = true;
        ctx.quit();
      },
      'icon-btn'
    );
    const nameEl = el('div', 'game-name', '🌫️ 팩트체크 특공대');
    const timerBar = el('div', 'timer-bar');
    const timerFill = el('div', 'timer-fill');
    timerBar.appendChild(timerFill);
    const heartsEl = el('div', 'hearts', '❤️❤️❤️');
    const scoreEl = el('div', 'game-score', '점수 0');
    topbar.append(quitBtn, nameEl, timerBar, heartsEl, scoreEl);
    wrap.appendChild(topbar);

    /* ---------- 좌측: 뭉게봇 ---------- */
    const left = el('div', 'g11-left');
    const charEl = charImg('char11', 'g11-char', '뭉게봇');
    const sayEl = el('div', 'g11-say', '뭐든지 물어봐! 난 모르는 게 없거든! 😎');
    const roundEl = el('div', 'g11-round', `라운드 1 / ${ROUNDS.length}`);
    left.append(charEl, sayEl, roundEl);
    wrap.appendChild(left);

    /* ---------- 중앙~우측: 채팅 ---------- */
    const chat = el('div', 'g11-chat');
    const qEl = el('div', 'g11-q');
    const answerEl = el('div', 'g11-answer');
    answerEl.innerHTML = `
      <div class="g11-answer-label">🤖 뭉게봇의 대답</div>
      <div class="g11-answer-text"></div>
      <div class="g11-badge">✨ 확실해! ✨</div>`;
    const answerText = answerEl.querySelector('.g11-answer-text') as HTMLElement;
    chat.append(qEl, answerEl);
    wrap.appendChild(chat);

    /* ---------- 하단 액션 영역 ---------- */
    const bottom = el('div', 'g11-bottom');
    wrap.appendChild(bottom);

    /* ---------- 안개 ---------- */
    const fogEl = el('div', 'g11-fog');
    wrap.appendChild(fogEl);

    /* ---------- HUD ---------- */
    function updateHud() {
      heartsEl.textContent = '❤️'.repeat(Math.max(0, hearts)) + '🖤'.repeat(Math.max(0, 3 - hearts));
      scoreEl.textContent = `점수 ${Math.min(100, score)}`;
      roundEl.textContent = `라운드 ${Math.min(roundIdx + 1, ROUNDS.length)} / ${ROUNDS.length}`;
    }

    function botSay(text: string) {
      sayEl.textContent = text;
    }

    function setFog(next: number) {
      const prev = fog;
      fog = Math.max(0, Math.min(6, next));
      // 레벨 6에서도 최대 ~0.83으로 캡: 안개 은유는 살리되 라운드 텍스트는 읽을 수 있게
      fogEl.style.opacity = String(Math.min(fog, 5) / 6);
      wrap.classList.toggle('clear', fog === 0);
      charEl.classList.toggle('hazy', fog >= 5);
      if (fog === 0 && prev > 0) {
        ctx.audio.star();
        floater(wrap, 640, 320, '안개가 걷혔어! ☀️', true);
      }
    }

    /* ---------- 타이머 ---------- */
    const tick = window.setInterval(() => {
      if (done || ended || !timerOn) return;
      timeLeft -= 0.1;
      const pct = Math.max(0, (timeLeft / ROUND_TIME) * 100);
      timerFill.style.width = `${pct}%`;
      timerFill.classList.toggle('danger', pct < 25);
      if (timeLeft <= 0) {
        timerOn = false;
        believe(true);
      }
    }, 100);
    timers.push(tick);

    function startTimer() {
      timeLeft = ROUND_TIME;
      timerFill.style.width = '100%';
      timerFill.classList.remove('danger');
      timerOn = true;
    }

    function stopTimer() {
      timerOn = false;
    }

    /* ---------- 라운드 진행 ---------- */
    function startRound() {
      if (done || ended) return;
      if (roundIdx >= ROUNDS.length) {
        gameOver();
        return;
      }
      phase = 'wait';
      const r = ROUNDS[roundIdx];

      bottom.innerHTML = '';
      qEl.classList.remove('show');
      answerEl.classList.remove('show');
      updateHud();

      later(() => {
        if (done || ended) return;
        qEl.innerHTML = `친구: ${r.q}`;
        qEl.classList.add('show');
        ctx.audio.pop();
      }, 120);

      later(() => {
        if (done || ended) return;
        answerText.textContent = r.answer;
        answerEl.classList.add('show');
        ctx.audio.pop();
        botSay('이건 내가 잘 알지! 자신 있어! 😎');
        showActions();
        startTimer();
        phase = 'choice';
      }, 520);
    }

    function showActions() {
      bottom.innerHTML = '';
      const believeBtn = button('믿을래 👌', () => believe(false), 'btn big mint g11-act');
      const checkBtn = button('확인할래 🔍', () => openPanel(), 'btn big yellow g11-act');
      bottom.append(believeBtn, checkBtn);
    }

    /* ---------- 선택 A: 그냥 믿기 (또는 타임아웃) ---------- */
    function believe(auto: boolean) {
      if (phase !== 'choice' || done || ended) return;
      phase = 'reveal';
      stopTimer();
      const r = ROUNDS[roundIdx];

      if (r.real) {
        score += 6;
        ctx.audio.pop();
        floater(
          wrap,
          800,
          420,
          auto ? '시간이 지나 그냥 믿어 버렸어!' : '이번엔 운이 좋았네! 😅',
          true
        );
        botSay('거봐, 내 말이 맞지?');
      } else {
        hearts -= 1;
        setFog(fog + 2);
        ctx.audio.bad();
        floater(
          wrap,
          800,
          420,
          auto ? '시간이 지나 그냥 믿어 버렸어!' : '확인 없이 믿었다가 틀린 정보를 배웠어! 💦',
          false
        );
        botSay('어…? 미안, 사실 나도 확실하지 않았어…');
      }
      updateHud();

      // 하트를 모두 잃으면 8라운드 전이라도 곧바로 결과로 (마지막 사실은 결과 카드에서 안내)
      if (hearts <= 0) {
        // 결과 화면으로 넘어가기를 기다리는 동안 액션 버튼을 치워 오조작(소리만 나는 탭)을 막는다
        bottom.innerHTML = '';
        later(() => gameOver(r), 1000);
        return;
      }
      showStrip();
    }

    /* ---------- 선택 B: 출처 확인 ---------- */
    let panel: HTMLElement | null = null;

    function openPanel() {
      if (phase !== 'choice' || done || ended) return;
      phase = 'inspect';
      stopTimer();
      inspected += 1;
      const r = ROUNDS[roundIdx];

      // 패널(left/right 36px)이 하단 액션 영역(left/right 20px)보다 좁아 버튼 양옆 16px 띠가
      // 노출되므로, 패널을 열기 전에 액션 버튼을 치워 '소리만 나는 탭'을 막는다.
      // (이후 decide() → showStrip()에서 bottom을 다시 채운다)
      bottom.innerHTML = '';

      panel = el('div', 'g11-panel');
      const head = el('div', 'g11-panel-head', '🔍 출처 조사');
      const src = el('div', 'g11-src', r.source);
      const evi = el('div', 'g11-evi', r.evidence);
      const judge = el('div', 'g11-judge');
      const okBtn = button('진짜네! ⭕', () => decide(true), 'btn mint');
      const noBtn = button('지어낸 말이야! ❌', () => decide(false), 'btn pink');
      judge.append(okBtn, noBtn);
      panel.append(head, src, evi, judge);
      wrap.appendChild(panel);
      botSay('어, 어… 자료까지 찾아보는 거야…?');
    }

    function closePanel() {
      if (panel) {
        panel.remove();
        panel = null;
      }
    }

    function decide(saysReal: boolean) {
      if (phase !== 'inspect' || done || ended) return;
      phase = 'reveal';
      closePanel();
      const r = ROUNDS[roundIdx];
      const correct = saysReal === r.real;

      if (correct) {
        score += 12;
        ctx.audio.good();
        floater(wrap, 800, 420, '팩트체크 성공! 🎯', true);
        if (!r.real) {
          caught += 1;
          botSay('앗, 들켰다! 그럴듯하게 지어냈지 뭐야…');
        } else {
          botSay('확인해 줘서 고마워! 이건 진짜였어!');
        }
        setFog(fog - 1);
      } else {
        score += 4;
        ctx.audio.bad();
        floater(wrap, 800, 420, '자료를 다시 잘 읽어 봐! 🤔', false);
        botSay('음… 자료를 한 번만 더 읽어 볼까?');
      }
      updateHud();
      showStrip();
    }

    /* ---------- 판정 공개 스트립 ---------- */
    function showStrip() {
      const r = ROUNDS[roundIdx];
      bottom.innerHTML = '';
      const strip = el('div', 'g11-strip');
      const verdict = el('div', 'g11-verdict', r.real ? '⭕' : '❌');
      const note = el('div', 'g11-note');
      note.innerHTML =
        `${r.real ? '뭉게봇의 대답은 <b>진짜</b>였어요.' : '뭉게봇의 대답은 <b>지어낸 말(환각)</b>이었어요.'}<br>${r.truthNote}` +
        (r.etiNote ? `<span class="g11-eti">에티: ${r.etiNote}</span>` : '');
      strip.append(verdict, note);

      const last = roundIdx + 1 >= ROUNDS.length || hearts <= 0;
      const nextBtn = button(
        last ? '결과 확인 ▶' : '다음 ▶',
        () => {
          if (phase !== 'reveal') return;
          if (hearts <= 0) {
            gameOver();
            return;
          }
          roundIdx += 1;
          startRound();
        },
        'btn yellow g11-next'
      );
      bottom.append(strip, nextBtn);
    }

    /* ---------- 결과 ---------- */
    function gameOver(lastRound?: Round) {
      if (ended || done) return;
      ended = true;
      stopTimer();
      closePanel();
      bottom.innerHTML = '';

      const allChecked = inspected >= ROUNDS.length;
      if (allChecked) score += 4; // 꼼꼼 특공대 보너스
      const finalScore = Math.max(0, Math.min(100, Math.round(score)));

      const fogText = fog === 0 ? '☀️ 맑음' : fog <= 3 ? '🌤️ 옅은 안개' : '🌫️ 짙은 안개';
      const botLine =
        finalScore >= 90
          ? '너 정말 대단한 팩트체커야! 앞으로 내 말도 꼭 확인해 줘!'
          : finalScore >= 60
            ? '내 허풍을 꽤 잡아냈네! 확인하는 습관, 잊지 마!'
            : '내 자신만만한 말투에 속았구나… AI 말은 꼭 확인해야 해!';

      botSay(botLine);
      updateHud();

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      const lastNoteHtml = lastRound
        ? `<div class="g11-lastnote">❌ 마지막 대답은 <b>지어낸 말(환각)</b>이었어요.<br>${lastRound.truthNote}${lastRound.etiNote ? `<br>에티: ${lastRound.etiNote}` : ''}</div>`
        : '';
      cardEl.innerHTML = `
        <h2>${lastRound ? '안개에 갇혔어요… 🌫️' : '팩트체크 완료! 🕵️'}</h2>
        <div class="howto-icons">${fog === 0 ? '☀️🎯' : fog <= 3 ? '🌤️🔍' : '🌫️💦'}</div>
        ${lastNoteHtml}
        <div class="howto-desc">
          잡아낸 환각: <b>${caught} / ${FAKE_TOTAL}</b><br>
          출처 확인 횟수: <b>${inspected} / ${ROUNDS.length}</b>${allChecked ? ' <b>(꼼꼼 특공대 보너스 +4)</b>' : ''}<br>
          남은 하트: <b>${'❤️'.repeat(Math.max(0, hearts)) || '없음'}</b><br>
          섬의 안개: <b>${fogText}</b><br><br>
          🤖 뭉게봇: "${botLine}"
        </div>`;
      const doneBtn = button(
        '결과 보기 🏆',
        () => {
          if (done) return;
          done = true;
          ctx.finish(finalScore);
        },
        'btn big yellow'
      );
      cardEl.appendChild(doneBtn);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      ctx.audio.fanfare();
    }

    /* ---------- 시작 ---------- */
    setFog(fog);
    updateHud();
    startRound();

    return () => {
      done = true;
      timerOn = false;
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      styleEl.remove();
      wrap.remove();
    };
  }
};
