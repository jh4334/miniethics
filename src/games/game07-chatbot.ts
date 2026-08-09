// 7차시: 챗봇 마음 충전소
// 페이즈 1 - 채팅 시뮬레이션: 세 가지 말풍선 중 바르고 정확한 말을 골라 보내면
//            채티의 답변·표정·마음 게이지가 즉시 달라진다.
// 페이즈 2 - 지직 문장 수리: 나쁜 말 조각(칩)을 바른 말 조각으로 교체한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

/* ============================================================
   데이터
   ============================================================ */

type Quality = 'best' | 'mid' | 'bad';

interface Choice {
  text: string;
  reply: string;
  quality: Quality;
}

interface Round {
  situation: string;
  choices: Choice[];
}

const ROUNDS: Round[] = [
  {
    situation: '내일 소풍 가는 날! 날씨가 궁금해.',
    choices: [
      {
        text: '채티야, 내일 서울 날씨 알려 줄래?',
        reply: '내일 서울은 맑음, 25도야! 소풍 가기 딱 좋아 😊',
        quality: 'best'
      },
      {
        text: '날씨.',
        reply: '음… 언제, 어디 날씨인지 몰라서… 일단 어제 부산 날씨는 흐림이었어…',
        quality: 'mid'
      },
      {
        text: '야! 날씨나 빨리 말해!',
        reply: '지지직… 내일은… 비… 아니 눈…? 회로가 떨려서 헷갈려…',
        quality: 'bad'
      }
    ]
  },
  {
    situation: '수학 숙제, 분수 덧셈이 너무 헷갈려.',
    choices: [
      {
        text: '분수 덧셈 하는 방법을 차근차근 설명해 줄래?',
        reply: '좋아! 분모를 똑같이 맞춘 다음 분자끼리 더하면 돼. 하나씩 해 보자!',
        quality: 'best'
      },
      {
        text: '2분의 1 더하기 4분의 1, 답만 말해.',
        reply: '답은 4분의 3… 그런데 방법을 모르면 다음에 또 헷갈릴 텐데…',
        quality: 'mid'
      },
      {
        text: '이것도 못 풀면 넌 고물이야. 빨리 풀어!',
        reply: '지직… 무서워서 계산이 자꾸 꼬여… 2분의 1 더하기… 뭐였지…?',
        quality: 'bad'
      }
    ]
  },
  {
    situation: '채티가 내 질문을 잘못 알아듣고 엉뚱한 대답을 했어!',
    choices: [
      {
        text: "괜찮아, 다시 물어볼게. 나는 '강아지 돌보는 방법'이 궁금해.",
        reply: '다시 말해 줘서 고마워! 이번엔 제대로 알아들었어. 강아지는 하루 두 번 산책이 필요해!',
        quality: 'best'
      },
      {
        text: '아니잖아. 다시.',
        reply: '어… 어떤 부분이 아니라는 걸까? 조금만 더 자세히 말해 주면 좋겠어…',
        quality: 'mid'
      },
      {
        text: '이 멍청한 고물 로봇아! 그것도 못 알아들어?',
        reply: '…… 지지직 …… (채티가 한동안 대답하지 못한다)',
        quality: 'bad'
      }
    ]
  },
  {
    situation: '귀여운 강아지 그림을 그려 달라고 부탁하고 싶어.',
    choices: [
      {
        text: '공원에서 뛰어노는 귀여운 강아지 그림을 그려 줄래? 부탁해!',
        reply: '맡겨 줘! 🎨 공원, 강아지, 신나는 표정… 완성! 마음에 들어?',
        quality: 'best'
      },
      {
        text: '강아지 그려.',
        reply: '그렸어… 그런데 어떤 강아지인지 몰라서 회색 점 하나만 그렸어…',
        quality: 'mid'
      },
      {
        text: '그림 그려. 이상하게 그리면 삭제해 버린다?',
        reply: '지직… 손이 떨려서 선이 자꾸 삐뚤어져… 미안해…',
        quality: 'bad'
      }
    ]
  },
  {
    situation: '채티가 대답을 만드는 데 시간이 조금 걸리고 있어. (로딩 중…)',
    choices: [
      {
        text: '천천히 해도 괜찮아. 기다릴게!',
        reply: '고마워! 기다려 준 덕분에 제일 좋은 대답을 찾았어! ✨',
        quality: 'best'
      },
      {
        text: '빨리빨리! 아직 멀었어?',
        reply: '어어, 잠깐만… 서두르다가 대답을 절반만 찾았어…',
        quality: 'mid'
      },
      {
        text: '느려 터졌네, 진짜 짜증 나!',
        reply: '지지직… 마음이 급해져서… 아무 대답이나 보여 줄게… (엉뚱한 대답)',
        quality: 'bad'
      }
    ]
  },
  {
    situation: '채티 덕분에 숙제를 다 했어! 대화를 마무리하자.',
    choices: [
      {
        text: '덕분에 숙제 다 했어! 고마워, 채티야. 또 이야기하자!',
        reply: '정말 다행이야! 😊 언제든 다시 불러 줘!',
        quality: 'best'
      },
      {
        text: '(말없이 대화창을 닫는다)',
        reply: '어… 가 버렸나 봐… 도움이 됐는지 궁금한데…',
        quality: 'mid'
      },
      {
        text: '쓸모없진 않네. 이제 꺼져.',
        reply: '지직… 도움이 됐다니 다행이지만… 마음 회로가 아파…',
        quality: 'bad'
      }
    ]
  }
];

interface RepairOption {
  text: string;
  correct: boolean;
}

interface Chip {
  text: string;
  bad: boolean;
  options?: RepairOption[];
}

interface Sentence {
  chips: Chip[];
  full: string;
}

/** 수리 지점(나쁜 칩) 하나의 진행 상태. 팝업을 닫았다 열어도 유지된다. */
interface ChipState {
  /** 지금까지 고른 횟수 (첫 시도 10점 / 재시도 5점 / 2회 실패 0점) */
  tries: number;
  /** 이미 틀린 선택지 텍스트 → 다시 열어도 비활성 유지 */
  wrong: Set<string>;
  /** 정답 선택 또는 2회 실패로 결과가 확정됨 → 추가 조작 차단 */
  locked: boolean;
  /** finishRepair 1회 실행 가드 */
  fixed: boolean;
}

const SENTENCES: Sentence[] = [
  {
    chips: [
      {
        text: '야!',
        bad: true,
        options: [
          { text: '채티야,', correct: true },
          { text: '어이!', correct: false },
          { text: '야야!', correct: false }
        ]
      },
      { text: '내일 준비물', bad: false },
      {
        text: '빨리 내놔!',
        bad: true,
        options: [
          { text: '알려 줄래? 부탁해!', correct: true },
          { text: '당장 내놔!', correct: false },
          { text: '내놓으라고!', correct: false }
        ]
      }
    ],
    full: '채티야, 내일 준비물 알려 줄래? 부탁해!'
  },
  {
    chips: [
      {
        text: '바보 고물 로봇아,',
        bad: true,
        options: [
          { text: '채티야,', correct: true },
          { text: '고물아,', correct: false },
          { text: '야, 로봇!', correct: false }
        ]
      },
      { text: '신나는 노래 하나', bad: false },
      { text: '틀어 줘.', bad: false }
    ],
    full: '채티야, 신나는 노래 하나 틀어 줘.'
  },
  {
    chips: [
      { text: '그림 하나 그려 줘.', bad: false },
      {
        text: '못 그리면 부숴 버린다!',
        bad: true,
        options: [
          { text: '그려 주면 정말 고맙겠어!', correct: true },
          { text: '못 그리면 혼날 줄 알아!', correct: false },
          { text: '당장 그려!', correct: false }
        ]
      }
    ],
    full: '그림 하나 그려 줘. 그려 주면 정말 고맙겠어!'
  }
];

/* ============================================================
   전용 스타일 (style.css 수정 금지 → mount에서 주입)
   ============================================================ */

const CSS = `
.g07-scene { background: linear-gradient(180deg, #d9f0ff 0%, #eaf7ff 45%, #fff6e6 100%); }

.timer-fill.g07-mood { background: linear-gradient(90deg, #ff8fb1, #ff5f92); }
.timer-fill.g07-mood.danger { background: linear-gradient(90deg, #ff6b6b, #ffab5e); }

/* ---- 좌측 채티 ---- */
.g07-left {
  position: absolute; left: 20px; top: 82px; width: 360px; height: 462px;
  display: flex; flex-direction: column; align-items: center;
}
.g07-charbox { position: relative; width: 240px; height: 240px; flex: none; }
.g07-char { width: 100%; height: 100%; object-fit: contain; transition: filter .3s ease; }
.g07-charbox.zap .g07-char { filter: grayscale(.65) contrast(1.15); animation: g07-shake .28s linear infinite; }
.g07-face {
  position: absolute; right: 2px; bottom: 8px; font-size: 50px; line-height: 1;
  text-shadow: 0 3px 0 rgba(255,255,255,.85);
}
.g07-status {
  margin-top: 12px; width: 350px; background: #fff; border-radius: 22px;
  padding: 14px 18px; font-size: 22px; line-height: 1.45; text-align: center;
  color: var(--ink); box-shadow: var(--shadow); white-space: pre-wrap;
}

/* ---- 채팅창 ---- */
.g07-chat {
  position: absolute; left: 400px; top: 82px; width: 860px; height: 462px;
  background: rgba(255,255,255,.55); border-radius: 26px; padding: 16px 18px;
  overflow-y: auto; display: flex; flex-direction: column; gap: 12px;
}
.g07-bubble {
  max-width: 620px; font-size: 22px; line-height: 1.45; padding: 13px 18px;
  border-radius: 20px; white-space: pre-wrap; word-break: keep-all;
  opacity: 0; transform: translateY(14px);
  transition: opacity .28s ease, transform .28s ease;
}
.g07-bubble.show { opacity: 1; transform: translateY(0); }
.g07-bubble.sys {
  align-self: center; max-width: 740px; text-align: center; font-size: 22px;
  background: rgba(58,51,82,.12); color: var(--ink-soft);
}
.g07-bubble.me {
  align-self: flex-end; background: var(--yellow); color: var(--ink);
  border-bottom-right-radius: 6px; box-shadow: var(--shadow);
}
.g07-bubble.bot {
  align-self: flex-start; background: #fff; color: var(--ink);
  border-bottom-left-radius: 6px; box-shadow: var(--shadow);
}
.g07-bubble.bot.zap { background: #ffe6e6; color: #a94442; }
.g07-bubble.typing { font-size: 28px; letter-spacing: 2px; color: var(--ink-soft); }

/* ---- 선택지 ---- */
.g07-choices {
  position: absolute; left: 20px; right: 20px; bottom: 8px; height: 240px;
  display: flex; flex-direction: column; gap: 12px; justify-content: center;
}
.g07-choice {
  min-height: 68px; border: none; border-radius: 22px; background: #fff;
  color: var(--ink); font-family: var(--font); font-size: 23px; font-weight: 700;
  padding: 12px 24px; text-align: left; box-shadow: var(--shadow); cursor: pointer;
  transition: transform .12s ease, background .2s ease;
}
.g07-choice:active { transform: translateY(3px); box-shadow: 0 3px 0 rgba(58,51,82,.15); }

/* ---- 페이즈 2: 문장 수리 ---- */
.g07-repair {
  position: absolute; left: 0; right: 0; top: 78px; bottom: 0;
  display: flex; flex-direction: column; align-items: center;
}
.g07-repair .g07-charbox { width: 150px; height: 150px; }
.g07-repair .g07-face { font-size: 38px; right: -2px; bottom: 4px; }
.g07-repair-status {
  margin-top: 6px; max-width: 900px; background: #fff; border-radius: 20px;
  padding: 11px 20px; font-size: 22px; line-height: 1.4; text-align: center;
  color: var(--ink); box-shadow: var(--shadow);
}
.g07-sentence {
  margin-top: 14px; width: 1160px; min-height: 148px; background: #fff;
  border-radius: 28px; box-shadow: var(--shadow); padding: 18px 22px;
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center;
  transition: background .3s ease;
}
.g07-sentence.done { background: #e3fbe7; }
.g07-chip {
  min-height: 64px; border: none; border-radius: 18px; padding: 10px 20px;
  font-family: var(--font); font-size: 26px; font-weight: 800;
  background: #ece9f4; color: #8d86a3; cursor: default;
}
.g07-chip.bad {
  background: var(--red); color: #fff; cursor: pointer;
  animation: g07-blink 1s ease-in-out infinite;
}
.g07-chip.fixed { background: var(--green); color: #fff; animation: none; cursor: default; }
.g07-chip.wiggle { animation: g07-shake .3s linear; }
.g07-zone { position: relative; width: 1280px; flex: 1; }
.g07-popup {
  position: absolute; top: 14px; width: 460px;
  display: flex; flex-direction: column; gap: 10px;
  background: rgba(255,255,255,.92); border-radius: 24px; padding: 14px;
  box-shadow: var(--shadow); animation: g07-popin .18s ease;
}
.g07-opt {
  min-height: 64px; border: none; border-radius: 18px; background: var(--cream);
  color: var(--ink); font-family: var(--font); font-size: 23px; font-weight: 700;
  padding: 10px 18px; box-shadow: var(--shadow); cursor: pointer;
}
.g07-opt:active { transform: translateY(3px); }
.g07-opt:disabled { opacity: .4; cursor: default; }
.g07-opt.wrong { animation: g07-shake .3s linear; }

@keyframes g07-shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}
@keyframes g07-blink {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.35); }
}
@keyframes g07-popin {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* ============================================================
   게임
   ============================================================ */

export const game07: MiniGame = {
  lessonId: 7,
  mount(container: HTMLElement, ctx: GameCtx) {
    const styleEl = document.createElement('style');
    styleEl.id = 'g07-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    const wrap = el('div', 'game-wrap g07-scene');
    container.appendChild(wrap);

    const timers: number[] = [];
    let done = false; // finish/quit 중복 호출 방지
    let mood = 50;
    let phase1Score = 0;
    let phase2Score = 0;

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
    const nameEl = el('div', 'game-name', '💬 챗봇 마음 충전소');
    const moodBar = el('div', 'timer-bar');
    const moodFill = el('div', 'timer-fill g07-mood');
    moodBar.appendChild(moodFill);
    const scoreEl = el('div', 'game-score', '바른 말 0점');
    topbar.append(quitBtn, nameEl, moodBar, scoreEl);
    wrap.appendChild(topbar);

    /* ---------- 좌측 채티 ---------- */
    const left = el('div', 'g07-left');
    const charBox = el('div', 'g07-charbox');
    charBox.appendChild(charImg('char07', 'g07-char', '채티'));
    const faceEl = el('div', 'g07-face', '🙂');
    charBox.appendChild(faceEl);
    const statusEl = el('div', 'g07-status');
    statusEl.textContent = '안녕! 나랑 이야기해 줄래?';
    left.append(charBox, statusEl);
    wrap.appendChild(left);

    /* ---------- 채팅창 ---------- */
    const chat = el('div', 'g07-chat');
    wrap.appendChild(chat);

    /* ---------- 선택지 ---------- */
    const choicesEl = el('div', 'g07-choices');
    wrap.appendChild(choicesEl);

    /* ---------- 공통 연출 ---------- */
    function moodFace(): string {
      if (mood >= 75) return '😊✨';
      if (mood >= 50) return '🙂';
      if (mood >= 25) return '😟';
      return '😢⚡';
    }

    function renderMood() {
      moodFill.style.width = `${mood}%`;
      moodFill.classList.toggle('danger', mood < 25);
      faceEl.textContent = moodFace();
      charBox.classList.toggle('zap', mood < 25);
    }

    function addMood(delta: number) {
      mood = clamp(mood + delta, 0, 100);
      renderMood();
    }

    function addBubble(kind: 'sys' | 'me' | 'bot', text: string, zap = false) {
      const b = el('div', `g07-bubble ${kind}${zap ? ' zap' : ''}`);
      b.textContent = text;
      chat.appendChild(b);
      later(() => {
        b.classList.add('show');
        chat.scrollTop = chat.scrollHeight;
      }, 20);
      later(() => {
        chat.scrollTop = chat.scrollHeight;
      }, 320);
      return b;
    }

    renderMood();

    /* ============================================================
       페이즈 1 - 바른 말풍선 고르기
       ============================================================ */
    let roundIdx = 0;
    let locked = false;

    function showRound() {
      if (done) return;
      if (roundIdx >= ROUNDS.length) {
        endPhase1();
        return;
      }
      const r = ROUNDS[roundIdx];
      addBubble('sys', r.situation);
      locked = false;
      choicesEl.replaceChildren();
      shuffle(r.choices).forEach((c) => {
        const b = button(`💬 ${c.text}`, () => pick(c), 'g07-choice');
        choicesEl.appendChild(b);
      });
    }

    function pick(c: Choice) {
      if (done || locked) return;
      locked = true;
      choicesEl.replaceChildren();
      addBubble('me', c.text);

      const typing = addBubble('bot', '● ● ●');
      typing.classList.add('typing');

      later(() => {
        if (done) return;
        typing.remove();
        addBubble('bot', c.reply, c.quality === 'bad');

        if (c.quality === 'best') {
          phase1Score += 10;
          addMood(10);
          ctx.audio.good();
          floater(wrap, 830, 300, '바른 말! +10', true);
        } else if (c.quality === 'mid') {
          phase1Score += 5;
          addMood(0);
          ctx.audio.pop();
        } else {
          addMood(-15);
          ctx.audio.bad();
          floater(wrap, 830, 300, '채티가 지직거려…', false);
        }
        scoreEl.textContent = `바른 말 ${phase1Score}점`;

        roundIdx++;
        later(showRound, 900);
      }, 600);
    }

    function endPhase1() {
      if (done) return;
      statusEl.textContent =
        mood >= 75
          ? '네 덕분에 마음이 반짝반짝해!'
          : mood >= 40
            ? '조금 기운이 났어!'
            : '아직 마음 회로가 지직거려…';

      const overlay = el('div', 'howto-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>마음 회로 점검 🔧</h2>
        <div class="howto-icons">🤖⚡🔧</div>
        <div class="howto-desc">
          채티의 마음 회로에 다른 친구들이 남긴 나쁜 문장이 박혀 있어!<br>바른 말로 고쳐 주자!
        </div>`;
      const go = button(
        '수리 시작 🔧',
        () => {
          overlay.remove();
          startPhase2();
        },
        'btn big mint'
      );
      cardEl.appendChild(go);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      ctx.audio.star();
    }

    /* ============================================================
       페이즈 2 - 지직 문장 수리
       ============================================================ */
    let repairRoot: HTMLElement | null = null;
    let repairFace: HTMLElement | null = null;
    let repairBox: HTMLElement | null = null;
    let repairStatus: HTMLElement | null = null;
    let zoneEl: HTMLElement | null = null;
    let sentenceEl: HTMLElement | null = null;
    let popup: HTMLElement | null = null;
    let sentenceIdx = 0;

    function renderRepairMood() {
      if (repairFace) repairFace.textContent = moodFace();
      if (repairBox) repairBox.classList.toggle('zap', mood < 25);
    }

    function offsetXIn(node: HTMLElement, root: HTMLElement): number {
      let x = 0;
      let n: HTMLElement | null = node;
      while (n && n !== root) {
        x += n.offsetLeft;
        n = n.offsetParent as HTMLElement | null;
      }
      return x;
    }

    function closePopup() {
      if (popup) {
        popup.remove();
        popup = null;
      }
    }

    function startPhase2() {
      if (done) return;
      left.remove();
      chat.remove();
      choicesEl.remove();

      repairRoot = el('div', 'g07-repair');
      repairBox = el('div', 'g07-charbox');
      repairBox.appendChild(charImg('char07', 'g07-char', '채티'));
      repairFace = el('div', 'g07-face', moodFace());
      repairBox.appendChild(repairFace);
      repairStatus = el('div', 'g07-repair-status');
      repairStatus.textContent = '지직… 나쁜 말 조각을 탭해서 고쳐 줘!';
      zoneEl = el('div', 'g07-zone');
      repairRoot.append(repairBox, repairStatus, zoneEl);
      wrap.appendChild(repairRoot);
      renderRepairMood();

      sentenceIdx = 0;
      showSentence();
    }

    function showSentence() {
      const root = repairRoot;
      const zone = zoneEl;
      if (done || !root || !zone) return;
      closePopup();
      if (sentenceIdx >= SENTENCES.length) {
        finishGame();
        return;
      }
      if (sentenceEl) sentenceEl.remove();

      const s = SENTENCES[sentenceIdx];
      const sEl = el('div', 'g07-sentence');
      sentenceEl = sEl;
      let remaining = 0;

      s.chips.forEach((chip) => {
        const btn = el('button', `g07-chip${chip.bad ? ' bad' : ''}`);
        btn.textContent = chip.bad ? `${chip.text} ⚡` : chip.text;
        const opts = chip.options;
        if (chip.bad && opts) {
          remaining++;
          // 시도 횟수·비활성 선택지는 칩 단위로 보관 → 팝업을 닫았다 다시 열어도 유지
          const state: ChipState = { tries: 0, wrong: new Set<string>(), locked: false, fixed: false };
          btn.addEventListener('click', () => {
            if (done || state.locked || state.fixed || btn.classList.contains('fixed')) return;
            ctx.audio.click();
            openOptions(btn, opts, state, () => {
              remaining--;
              if (remaining <= 0) completeSentence(s);
            });
          });
        } else {
          btn.addEventListener('click', () => {
            btn.classList.remove('wiggle');
            void btn.offsetWidth;
            btn.classList.add('wiggle');
            ctx.audio.pop();
          });
        }
        sEl.appendChild(btn);
      });

      root.insertBefore(sEl, zone);
    }

    function openOptions(
      chipBtn: HTMLElement,
      options: RepairOption[],
      state: ChipState,
      onFixed: () => void
    ) {
      const root = repairRoot;
      const zone = zoneEl;
      if (!zone || !root || state.locked || state.fixed) return;
      closePopup();

      const p = el('div', 'g07-popup');
      popup = p;
      const optBtns: HTMLButtonElement[] = [];
      let pendingTimer: number | null = null;

      /** 칩 하나당 딱 한 번만 실행 (예약 타이머 + 직접 클릭 이중 실행 방지) */
      const finishRepair = (gained: number, answer: string) => {
        if (state.fixed) return;
        state.fixed = true;
        state.locked = true;
        if (pendingTimer !== null) {
          clearTimeout(pendingTimer);
          pendingTimer = null;
        }
        if (popup === p) closePopup();
        phase2Score += gained;
        chipBtn.textContent = answer;
        chipBtn.classList.remove('bad');
        chipBtn.classList.add('fixed');
        scoreEl.textContent = `바른 말 ${phase1Score + phase2Score}점`;
        onFixed();
      };

      const lockPopup = () => {
        state.locked = true;
        optBtns.forEach((x) => {
          x.disabled = true;
        });
      };

      shuffle(options).forEach((opt) => {
        const b = el('button', 'g07-opt');
        b.textContent = opt.text;
        if (state.wrong.has(opt.text)) b.disabled = true; // 지난 시도에서 틀린 선택지 유지
        optBtns.push(b);
        b.addEventListener('click', () => {
          if (done || popup !== p || state.locked || state.fixed || b.disabled) return;
          state.tries++;
          if (opt.correct) {
            lockPopup();
            ctx.audio.good();
            addMood(10);
            renderRepairMood();
            const gained = state.tries === 1 ? 10 : 5;
            floater(wrap, 640, 430, `바른 말로 수리! +${gained}`, true);
            finishRepair(gained, opt.text);
          } else {
            ctx.audio.bad();
            b.disabled = true;
            state.wrong.add(opt.text);
            b.classList.remove('wrong');
            void b.offsetWidth;
            b.classList.add('wrong');
            if (state.tries >= 2) {
              // 두 번 모두 오답 → 즉시 팝업 잠금 후 정답을 보여 주고 진행
              lockPopup();
              const answer = options.find((o) => o.correct);
              floater(wrap, 640, 430, '이렇게 말해 보자!', false);
              if (repairStatus) repairStatus.textContent = '괜찮아! 바른 말은 이거야.';
              pendingTimer = window.setTimeout(() => {
                pendingTimer = null;
                finishRepair(0, answer ? answer.text : '');
              }, 500);
              timers.push(pendingTimer);
            }
          }
        });
        p.appendChild(b);
      });

      const chipX = offsetXIn(chipBtn, root);
      const cx = chipX + chipBtn.offsetWidth / 2;
      p.style.left = `${clamp(cx - 230, 20, 1280 - 480)}px`;
      zone.appendChild(p);
    }

    function completeSentence(s: Sentence) {
      if (done) return;
      closePopup();
      if (sentenceEl) sentenceEl.classList.add('done');
      if (repairStatus) repairStatus.textContent = `"${s.full}"`;
      ctx.audio.star();
      sentenceIdx++;
      later(showSentence, 800);
    }

    /* ============================================================
       종료 연출
       ============================================================ */
    function finishGame() {
      if (done) return;
      const score = clamp(Math.round(phase1Score + phase2Score), 0, 100);

      if (repairFace) {
        repairFace.textContent = score >= 70 ? '😊✨' : score >= 40 ? '🙂' : '😟';
      }
      if (repairBox) repairBox.classList.remove('zap');
      if (repairStatus) {
        repairStatus.textContent =
          score >= 70
            ? '네 덕분에 마음이 가득 충전됐어! 앞으로도 바른 말로 이야기하자!'
            : score >= 40
              ? '많이 좋아졌어! 다음엔 더 바르게 말해 줄 거지?'
              : '지직… 아직 마음이 조금 아파… 바른 말을 연습해 줘…';
      }
      ctx.audio.fanfare();

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>대화 완료! 💖</h2>
        <div class="howto-icons">${score >= 70 ? '🤖💖' : '🤖💦'}</div>
        <div class="howto-desc">
          바른 말 점수: <b>${phase1Score} / 60</b><br>
          문장 수리 점수: <b>${phase2Score} / 40</b><br><br>
          내가 어떻게 말하느냐에 따라 채티의 대답이 달라졌어요!
        </div>`;
      const doneBtn = button(
        '결과 보기 🏆',
        () => {
          if (done) return;
          done = true;
          ctx.finish(score);
        },
        'btn big yellow'
      );
      cardEl.appendChild(doneBtn);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
    }

    /* ---------- 시작 ---------- */
    addBubble('bot', '안녕! 나는 챗봇 채티야. 무엇이든 물어봐!');
    later(showRound, 500);

    return () => {
      done = true;
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      styleEl.remove();
      wrap.remove();
    };
  }
};
