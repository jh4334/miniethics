// 12차시: 최종 보스전 - 카오스의 성 (1~11차시 종합 복습)
// 어둠에 물든 수호 로봇 '카오스'가 11개 섬에서 가져온 '어둠 카드'(3지선다)로 공격한다.
// 정답을 탭하면 그 섬의 방패가 깨지고, 11라운드 뒤 '수호자의 선언'으로 카오스를 정화한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

/* ============================================================
   라운드 데이터 (1→11차시 순서 고정, 선택지 표시 순서만 셔플)
   ============================================================ */

interface Round {
  /** 섬 이름 */
  island: string;
  /** 방패 세그먼트에 표시할 섬 아이콘 */
  icon: string;
  /** 보스의 공격 대사 */
  attack: string;
  /** 문제 */
  q: string;
  /** 선택지 (원본 순서) */
  choices: string[];
  /** 정답 인덱스 (원본 순서 기준) */
  answer: number;
  /** 정답/오답 관계없이 보여 주는 복습 해설 */
  explain: string;
}

const ROUNDS: Round[] = [
  {
    island: '배움의 섬',
    icon: '🍳',
    attack: 'AI는 태어날 때부터 뭐든지 다 알고 있지!',
    q: 'AI에 대한 바른 설명은 무엇일까?',
    choices: [
      '사람이 준 데이터를 보면서 배운다',
      '태어날 때부터 모든 것을 안다',
      '배우지 않아도 저절로 똑똑해진다'
    ],
    answer: 0,
    explain: 'AI는 데이터를 보고 배워요. 정확하게 가르쳐야 정확하게 배워요.'
  },
  {
    island: '편식의 섬',
    icon: '🍽️',
    attack: '빨간 사과 데이터만 잔뜩 먹여서 편향 AI를 만들겠다!',
    q: '편향을 막으려면 AI에게 어떤 데이터를 줘야 할까?',
    choices: ['한 가지 종류만 아주 많이', '다양하고 골고루 섞인 데이터', '아무 데이터나 대충 많이'],
    answer: 1,
    explain: '한쪽으로 쏠린 데이터로 배우면 AI 판단도 치우쳐요. 골고루가 중요해요.'
  },
  {
    island: '비밀의 섬',
    icon: '🛡️',
    attack: '네 이름, 주소, 비밀번호를 몽땅 내놔라!',
    q: '다음 중 인터넷이나 챗봇에 알려 주면 안 되는 것은?',
    choices: ['좋아하는 노래 제목', '우리 집 주소와 전화번호', '좋아하는 색깔'],
    answer: 1,
    explain: '나를 알아볼 수 있는 개인정보는 AI 챗봇에게도 알려 주지 않아요.'
  },
  {
    island: '착시의 섬',
    icon: '🕵️',
    attack: 'AI로 만든 가짜 영상으로 세상을 속여 주지!',
    q: 'AI로 조작된 것 같은 사진·영상을 봤을 때 바른 행동은?',
    choices: [
      '재밌으니까 바로 친구들에게 공유한다',
      '진짜인지 출처를 먼저 확인해 본다',
      '더 놀랍게 바꿔서 다시 올린다'
    ],
    answer: 1,
    explain: '진짜 같아 보여도 AI로 만든 가짜일 수 있어요. 출처 확인이 먼저예요.'
  },
  {
    island: '소용돌이 섬',
    icon: '🌀',
    attack: '네가 좋아하는 것만 계속 보여줘서 소용돌이에 가두겠다!',
    q: '추천해 주는 영상만 계속 보면 어떤 일이 생길까?',
    choices: [
      '세상의 모든 것을 알게 된다',
      '비슷한 내용만 보게 되어 생각이 좁아진다',
      '아무 일도 일어나지 않는다'
    ],
    answer: 1,
    explain: '추천만 따라가면 필터버블에 갇혀요. 가끔은 다른 것도 찾아봐요.'
  },
  {
    island: '창작의 섬',
    icon: '🎨',
    attack: '남의 그림을 몰래 가져다 내 것처럼 써 버려라!',
    q: 'AI로 그림을 만들어 대회나 숙제에 낼 때 바른 태도는?',
    choices: [
      '내가 직접 손으로 그렸다고 말한다',
      '누가 만들었는지 말하지 않는다',
      'AI의 도움을 받아 만들었다고 밝힌다'
    ],
    answer: 2,
    explain: '다른 사람의 창작물을 존중하고, AI를 썼다면 솔직하게 밝혀요.'
  },
  {
    island: '대화의 섬',
    icon: '💬',
    attack: '챗봇은 기계니까 나쁜 말을 마음껏 퍼부어라!',
    q: 'AI 챗봇과 대화할 때 바른 모습은?',
    choices: [
      '기계니까 함부로 말해도 된다',
      '바르고 고운 말을 사용한다',
      '화가 나면 나쁜 말을 해도 된다'
    ],
    answer: 1,
    explain: 'AI에게 하는 말도 나의 언어 습관이 돼요. 바른 말을 사용해요.'
  },
  {
    island: '균형의 섬',
    icon: '🤔',
    attack: '숙제도 일기도 생각도 전부 AI에게 맡겨 버려!',
    q: 'AI를 현명하게 사용하는 방법은?',
    choices: [
      '모든 것을 AI에게 맡긴다',
      'AI는 절대로 쓰면 안 된다',
      '스스로 먼저 생각한 뒤 AI의 도움을 받는다'
    ],
    answer: 2,
    explain: '다 맡기면 내 생각하는 힘이 자라지 않아요. 스스로 생각이 먼저예요.'
  },
  {
    island: '저울의 섬',
    icon: '⚖️',
    attack: '내 맘대로 판정하는 AI 심판을 풀어놨다!',
    q: 'AI의 판단이 불공정해 보일 때 바른 생각은?',
    choices: [
      'AI의 판단이니까 무조건 옳다',
      '사람이 살펴보고 잘못을 고쳐야 한다',
      '불공정해도 모른 척한다'
    ],
    answer: 1,
    explain: 'AI도 불공정할 수 있어요. 사람이 살펴보고 바로잡아야 해요.'
  },
  {
    island: '갈림길 섬',
    icon: '🚗',
    attack: 'AI가 사고를 내면 아무도 책임지지 않으면 그만이야!',
    q: 'AI가 실수해서 문제가 생겼다면 어떻게 해야 할까?',
    choices: [
      '아무도 책임지지 않아도 된다',
      '무조건 AI 탓만 하면 된다',
      '만들고 사용하는 사람들이 함께 책임을 살핀다'
    ],
    answer: 2,
    explain: 'AI 뒤에는 만들고 사용하는 사람이 있어요. 책임을 함께 생각해요.'
  },
  {
    island: '안개의 섬',
    icon: '✅',
    attack: 'AI가 말하면 거짓말도 다 믿게 되지! 크하하!',
    q: 'AI의 답변을 대할 때 가장 바른 습관은?',
    choices: [
      '다른 자료와 비교해 사실인지 확인한다',
      'AI가 말했으니 그대로 다 믿는다',
      '이상하면 그냥 화를 낸다'
    ],
    answer: 0,
    explain: 'AI는 그럴듯한 거짓말(환각)을 해요. 꼭 확인하는 습관을 가져요.'
  }
];

const OATHS = [
  '📚 좋은 데이터로 배우게 할게!',
  '🔍 사실인지 스스로 확인할게!',
  '💛 사람을 존중하며 사용할게!'
];

const ENTER_MS = 1000; // 보스 등장 드롭 애니메이션 길이
const EXPLAIN_MS = 2500; // 해설 노출 시간
const OATH_TIMEOUT_MS = 12000; // 선언 자동 진행

/** 라운드별 제한 시간(초) */
function limitOf(idx: number): number {
  if (idx < 4) return 15;
  if (idx < 8) return 13;
  return 11;
}

function shuffleIdx(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   전용 스타일 (style.css 수정 금지 → mount에서 주입)
   ============================================================ */

const CSS = `
.g12-scene {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(120, 60, 200, 0.45) 0%, rgba(30, 18, 60, 0) 60%),
    linear-gradient(180deg, #2b1c4d 0%, #3b2a63 45%, #57457f 100%);
  transition: background 1.4s ease;
}
.g12-scene.pure {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(255, 240, 170, 0.75) 0%, rgba(255, 255, 255, 0) 60%),
    linear-gradient(180deg, #7cc7ff 0%, #cdeaff 45%, #fff9e8 100%);
}

/* ---- 성 배경 장식 (전부 CSS/이모지) ---- */
.g12-castle {
  position: absolute; top: 96px; left: 0; right: 0; height: 200px;
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 0 24px; font-size: 92px; opacity: 0.18; pointer-events: none;
  filter: grayscale(0.4);
}

/* ---- 보스 ---- */
.g12-bossbox {
  position: absolute; top: 76px; left: 50%; width: 260px; height: 200px;
  transform: translateX(-50%); z-index: 12;
  display: flex; align-items: center; justify-content: center;
}
/* 등장 드롭은 전용 클래스로 분리 (attack/hurt/stagger 해제 시 재생되지 않도록) */
.g12-bossbox.g12-enter { animation: g12-drop 1s cubic-bezier(0.22, 1.1, 0.4, 1) both; }
@keyframes g12-drop {
  from { transform: translateX(-50%) translateY(-120px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}
.g12-aura {
  position: absolute; top: 50%; left: 50%; width: 210px; height: 210px;
  margin: -105px 0 0 -105px; border-radius: 50%;
  background: radial-gradient(circle, rgba(150, 80, 230, 0.55) 0%, rgba(90, 40, 160, 0) 70%);
  box-shadow: 0 0 40px 20px rgba(120, 60, 200, 0.55);
  animation: g12-pulse 2s ease-in-out infinite;
  transition: opacity 1.2s ease;
}
@keyframes g12-pulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.14); opacity: 1; }
}
.g12-boss {
  position: relative; z-index: 2; height: 196px; width: auto;
  filter: drop-shadow(0 0 16px rgba(140, 70, 220, 0.9)) brightness(0.62) saturate(1.5)
    hue-rotate(-25deg);
  transition: filter 1.5s ease;
}
.g12-bossbox.attack { animation: g12-boss-attack 0.4s ease; }
@keyframes g12-boss-attack {
  0% { transform: translateX(-50%) scale(1); }
  35% { transform: translateX(-50%) scale(1.1) rotate(-4deg); }
  70% { transform: translateX(-50%) scale(1.04) rotate(3deg); }
  100% { transform: translateX(-50%) scale(1); }
}
.g12-bossbox.hurt { animation: g12-boss-hurt 0.45s ease; }
@keyframes g12-boss-hurt {
  0% { transform: translateX(-50%) translateX(0); filter: none; }
  25% { transform: translateX(-50%) translateX(-14px); }
  60% { transform: translateX(-50%) translateX(12px); }
  100% { transform: translateX(-50%) translateX(0); }
}
.g12-bossbox.stagger { animation: g12-stagger 0.9s ease-in-out infinite; }
@keyframes g12-stagger {
  0%, 100% { transform: translateX(-50%) rotate(-6deg); }
  50% { transform: translateX(-50%) rotate(6deg); }
}
.g12-scene.pure .g12-aura { opacity: 0; }
.g12-scene.pure .g12-boss {
  filter: drop-shadow(0 0 26px rgba(255, 236, 150, 0.95)) brightness(1.18) saturate(1) hue-rotate(0deg);
}

/* ---- 보스 말풍선 ---- */
.g12-boss-speech {
  position: absolute; top: 96px; left: 92px; width: 320px;
  background: rgba(255, 253, 245, 0.95); color: #3a3352;
  border-radius: 20px; padding: 14px 18px; font-size: 22px; line-height: 1.4;
  font-weight: 700; box-shadow: 0 6px 0 rgba(20, 10, 45, 0.35); z-index: 14;
}
.g12-boss-speech::after {
  content: ''; position: absolute; right: -16px; top: 34px;
  border: 10px solid transparent; border-left-color: rgba(255, 253, 245, 0.95);
}

/* ---- 방패(보스 HP) ---- */
.g12-shields {
  position: absolute; top: 286px; left: 0; right: 0; height: 56px;
  display: flex; align-items: center; justify-content: center; gap: 8px; z-index: 12;
}
.g12-shield {
  width: 74px; height: 54px; border-radius: 14px;
  background: linear-gradient(180deg, #cfe4ff 0%, #9db8e8 100%);
  border: 3px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 4px 0 rgba(20, 10, 45, 0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; transition: opacity 0.3s ease, transform 0.3s ease;
}
.g12-shield.broken {
  background: linear-gradient(180deg, #b9b2c7 0%, #837c96 100%);
  opacity: 0.35; transform: rotate(-8deg) scale(0.92);
}
.g12-shield.dark {
  background: linear-gradient(180deg, #4b3f6b 0%, #2c2547 100%);
  border-color: rgba(255, 255, 255, 0.25);
}

/* ---- 빛줄기 ---- */
.g12-beam {
  position: absolute; left: 640px; top: 180px; width: 26px; height: 500px;
  margin-left: -13px; z-index: 40; pointer-events: none; border-radius: 13px;
  background: linear-gradient(0deg, rgba(255, 240, 150, 0.25), #fff8c8 55%, #ffffff 100%);
  box-shadow: 0 0 26px 10px rgba(255, 236, 150, 0.75);
  transform-origin: bottom center; transform: scaleY(0);
  animation: g12-beam-up 0.35s ease-out forwards;
}
@keyframes g12-beam-up {
  from { transform: scaleY(0); opacity: 1; }
  70% { transform: scaleY(1); opacity: 1; }
  to { transform: scaleY(1); opacity: 0; }
}

/* ---- 화면 흔들림 ---- */
.g12-shake { animation: g12-shake 0.4s ease; }
@keyframes g12-shake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-12px, 6px); }
  45% { transform: translate(10px, -6px); }
  70% { transform: translate(-7px, 3px); }
}

/* ---- 문항 영역 ---- */
.g12-quiz { position: absolute; left: 0; right: 0; top: 348px; bottom: 0; z-index: 20; }
/* 보스 등장 연출 동안에는 빈 문항 카드가 보이지 않도록 숨긴다 */
.g12-quiz.g12-hidden { display: none; }
.g12-round-label {
  text-align: center; font-size: 24px; font-weight: 800; color: #fff7e0;
  text-shadow: 0 3px 0 rgba(20, 10, 45, 0.5); margin-bottom: 8px;
}
.g12-question {
  width: 920px; margin: 0 auto 12px; padding: 12px 24px;
  background: rgba(255, 253, 245, 0.97); border-radius: 20px;
  box-shadow: 0 6px 0 rgba(20, 10, 45, 0.35);
  font-size: 26px; font-weight: 800; text-align: center; color: #3a3352;
}
.g12-choices {
  width: 840px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 10px;
}
.g12-choice {
  font-family: var(--font); width: 100%; min-height: 68px;
  border: 4px solid rgba(255, 255, 255, 0.7); border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f0eaff 100%);
  color: #3a3352; font-size: 23px; font-weight: 800; cursor: pointer;
  padding: 10px 20px; box-shadow: 0 5px 0 rgba(20, 10, 45, 0.35);
  transition: transform 0.08s ease, box-shadow 0.08s ease, background 0.2s ease;
}
.g12-choice:active { transform: translateY(4px); box-shadow: 0 1px 0 rgba(20, 10, 45, 0.35); }
.g12-choice.picked-ok {
  background: linear-gradient(180deg, #b6f2c4 0%, #6ee08a 100%);
  border-color: #2f9e4f;
}
.g12-choice.picked-bad {
  background: linear-gradient(180deg, #ffc9c9 0%, #ff8f8f 100%);
  border-color: #d94b4b;
}
.g12-choice.show-answer { border-color: #2f9e4f; box-shadow: 0 0 0 4px rgba(81, 207, 102, 0.45); }
.g12-choice.locked { cursor: default; }

/* ---- 해설 배너 ---- */
.g12-explain {
  position: absolute; left: 50%; bottom: 12px; width: 900px;
  transform: translateX(-50%) translateY(14px);
  background: #fffdf5; border-radius: 18px; padding: 12px 22px;
  box-shadow: 0 6px 0 rgba(20, 10, 45, 0.35);
  font-size: 22px; line-height: 1.35; color: #3a3352; text-align: center;
  opacity: 0; transition: opacity 0.25s ease, transform 0.25s ease; pointer-events: none;
}
.g12-explain.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ---- 에티 응원 토스트 ---- */
/* 피니셔 응원은 선언 버튼 줄(y 662~746, 그림자 포함) 위에 뜨도록 bottom을 올린다.
   토스트 자체는 정보 표시용이라 pointer-events: none 으로 탭을 가로채지 않게 한다. */
.g12-eti-cheer {
  position: absolute; left: 16px; bottom: 150px; z-index: 65;
  max-width: 760px;
  background: #fffdf5; border-radius: 18px; padding: 12px 18px;
  box-shadow: 0 6px 0 rgba(20, 10, 45, 0.35);
  font-size: 22px; font-weight: 800; color: #3a3352;
  pointer-events: none;
  animation: g12-toast 0.3s ease;
}
/* 라운드 중(하트 0) 응원은 화면 아래 해설 배너(x 190~1090, y 734~788)와 겹치지 않게
   좌측 상단(보스 말풍선 아래 / 방패 줄 위)에 띄운다. */
.g12-eti-cheer.g12-cheer-side {
  top: 196px; bottom: auto; max-width: 420px;
  animation: g12-toast-side 0.3s ease;
}
@keyframes g12-toast {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes g12-toast-side {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---- 피니셔 ---- */
.g12-oath-row {
  position: absolute; left: 0; right: 0; bottom: 60px; z-index: 30;
  display: flex; align-items: center; justify-content: center; gap: 20px;
}
.g12-oath {
  font-family: var(--font); min-height: 78px; width: 370px;
  border: 4px solid #ffd93d; border-radius: 20px;
  background: linear-gradient(180deg, #fffdf5 0%, #ffeeb8 100%);
  color: #3a3352; font-size: 23px; font-weight: 800; cursor: pointer;
  padding: 12px 16px; box-shadow: 0 6px 0 #b98f14, 0 0 22px 4px rgba(255, 217, 61, 0.6);
  transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
}
.g12-oath:active { transform: translateY(4px); }
.g12-oath.said {
  transform: translateY(-16px);
  box-shadow: 0 6px 0 #b98f14, 0 0 40px 12px rgba(255, 245, 190, 0.95);
  cursor: default;
}
.g12-flash {
  position: absolute; inset: 0; background: #fff; z-index: 66; pointer-events: none;
  animation: g12-flash 0.3s ease forwards;
}
@keyframes g12-flash {
  from { opacity: 0.95; }
  to { opacity: 0; }
}
`;

/* ============================================================
   게임
   ============================================================ */

export const game12: MiniGame = {
  lessonId: 12,
  mount(container: HTMLElement, ctx: GameCtx) {
    const styleEl = document.createElement('style');
    styleEl.id = 'g12-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    const wrap = el('div', 'game-wrap g12-scene');
    container.appendChild(wrap);

    const timers: number[] = [];
    let done = false; // finish/quit 중복 호출 방지
    let ended = false; // 결과 오버레이 표시 여부

    let idx = 0; // 현재 라운드
    let correct = 0;
    let hearts = 3;
    let locked = true; // 입력 잠금 (등장 연출/해설 중)
    let cheered = false; // 에티 응원 1회 제한
    let purified = false; // 정화 연출 1회 제한

    let timeLeft = 0;
    let timeMax = limitOf(0);
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
      'icon-btn', '그만두기');
    const nameEl = el('div', 'game-name', '🏰 최종 보스전: 카오스의 성');
    const timerBar = el('div', 'timer-bar');
    const timerFill = el('div', 'timer-fill');
    timerBar.appendChild(timerFill);
    const heartsEl = el('div', 'hearts', '❤️❤️❤️');
    topbar.append(quitBtn, nameEl, timerBar, heartsEl);
    wrap.appendChild(topbar);

    /* ---------- 배경 장식 ---------- */
    const castle = el('div', 'g12-castle', '<span>🕯️</span><span>🕯️</span>');
    wrap.appendChild(castle);

    /* ---------- 보스 ---------- */
    const bossBox = el('div', 'g12-bossbox g12-enter');
    const aura = el('div', 'g12-aura');
    const bossImg = charImg('char12', 'g12-boss', '카오스');
    bossBox.append(aura, bossImg);
    const speech = el('div', 'g12-boss-speech', '크하하! 네가 배운 것이 진짜인지 시험해 주마!');
    wrap.append(bossBox, speech);

    /* ---------- 방패 줄 (보스 HP) ---------- */
    const shieldRow = el('div', 'g12-shields');
    const shieldEls: HTMLElement[] = ROUNDS.map((r) => {
      const s = el('div', 'g12-shield', r.icon);
      shieldRow.appendChild(s);
      return s;
    });
    wrap.appendChild(shieldRow);

    /* ---------- 문항 영역 ---------- */
    // 등장 연출(약 1.8초) 동안에는 숨겨 둔다. 첫 startRound()에서 표시.
    const quizEl = el('div', 'g12-quiz g12-hidden');
    const labelEl = el('div', 'g12-round-label', '');
    const questionEl = el('div', 'g12-question', '');
    const choicesEl = el('div', 'g12-choices');
    const explainEl = el('div', 'g12-explain', '');
    quizEl.append(labelEl, questionEl, choicesEl, explainEl);
    wrap.appendChild(quizEl);

    /* ---------- HUD ---------- */
    function updateHud() {
      const h = Math.max(0, hearts);
      heartsEl.textContent = '❤️'.repeat(h) + '🤍'.repeat(3 - h);
    }

    function bossSay(text: string) {
      speech.textContent = text;
    }

    function shakeScreen() {
      wrap.classList.add('g12-shake');
      later(() => wrap.classList.remove('g12-shake'), 420);
    }

    function fireBeam() {
      const beam = el('div', 'g12-beam');
      wrap.appendChild(beam);
      later(() => beam.remove(), 520);
    }

    /* ---------- 타이머 ---------- */
    const tick = window.setInterval(() => {
      if (done || ended || !timerOn) return;
      timeLeft -= 0.2;
      const pct = Math.max(0, (timeLeft / timeMax) * 100);
      timerFill.style.width = `${pct}%`;
      timerFill.classList.toggle('danger', pct < 25);
      if (timeLeft <= 0) {
        timerOn = false;
        resolve(-1);
      }
    }, 200);
    timers.push(tick);

    /* ---------- 라운드 진행 ---------- */
    let order: number[] = []; // 표시 순서 → 원본 인덱스
    let btns: HTMLButtonElement[] = [];

    function startRound() {
      if (done || ended) return;
      if (idx >= ROUNDS.length) {
        startFinisher();
        return;
      }
      const r = ROUNDS[idx];

      // 보스 공격 모션 + 대사
      bossSay(r.attack);
      bossBox.classList.add('attack');
      later(() => bossBox.classList.remove('attack'), 420);
      ctx.audio.pop();

      // 문항 표시
      quizEl.classList.remove('g12-hidden');
      labelEl.textContent = `${idx + 1}라운드 · ${r.island} ${r.icon}`;
      questionEl.textContent = r.q;
      explainEl.classList.remove('show');
      explainEl.textContent = '';

      order = shuffleIdx(r.choices.length);
      choicesEl.innerHTML = '';
      btns = order.map((origin, pos) => {
        const b = button(r.choices[origin], () => resolve(pos), 'g12-choice');
        choicesEl.appendChild(b);
        return b;
      });

      // 타이머 시작
      locked = false;
      timeMax = limitOf(idx);
      timeLeft = timeMax;
      timerFill.style.width = '100%';
      timerFill.classList.remove('danger');
      timerOn = true;
    }

    /** pos: 탭한 버튼 위치, -1 = 시간초과 */
    function resolve(pos: number) {
      if (locked || done || ended) return;
      locked = true;
      timerOn = false;

      const r = ROUNDS[idx];
      const answerPos = order.indexOf(r.answer);
      const isCorrect = pos === answerPos;

      btns.forEach((b) => {
        b.disabled = true;
        b.classList.add('locked');
      });

      if (isCorrect) {
        correct++;
        ctx.audio.good();
        btns[pos].classList.add('picked-ok');
        fireBeam();
        shieldEls[idx].textContent = '💥';
        shieldEls[idx].classList.add('broken');
        floater(wrap, 640, 260, '방패 파괴! ⭕', true);
        bossBox.classList.add('hurt');
        later(() => bossBox.classList.remove('hurt'), 470);
        bossSay('크윽! 내 방패가…!');
      } else {
        ctx.audio.bad();
        if (pos >= 0) btns[pos].classList.add('picked-bad');
        btns[answerPos].classList.add('show-answer');
        shakeScreen();
        hearts = Math.max(0, hearts - 1);
        updateHud();
        shieldEls[idx].textContent = '⬛';
        shieldEls[idx].classList.add('dark');
        floater(wrap, 640, 260, '앗! 공격받았어 ❌', false);
        bossSay('크하하! 그것도 모르느냐!');
        if (hearts === 0 && !cheered) {
          cheered = true;
          const cheer = el(
            'div',
            'g12-eti-cheer g12-cheer-side',
            '🤖 에티: 포기하지 마! 남은 카드에 집중하자!'
          );
          wrap.appendChild(cheer);
          later(() => cheer.remove(), 2000);
        }
      }

      // 해설(복습 핵심) 노출 후 다음 라운드
      explainEl.innerHTML = `💡 ${r.explain}`;
      explainEl.classList.add('show');
      later(() => {
        if (done || ended) return;
        idx++;
        startRound();
      }, EXPLAIN_MS);
    }

    /* ---------- 피니셔: 수호자의 선언 ---------- */
    function startFinisher() {
      if (done || ended) return;
      timerOn = false;
      timerFill.style.width = '0%';
      quizEl.remove();
      bossBox.classList.add('stagger');
      bossSay('크윽… 내 방패가… 힘이 빠진다…');

      const cheer = el('div', 'g12-eti-cheer', '🤖 에티: 지금이야! 수호자의 선언으로 어둠을 걷어 내자!');
      wrap.appendChild(cheer);

      const row = el('div', 'g12-oath-row');
      let said = 0;
      OATHS.forEach((text) => {
        const b = button(
          text,
          () => {
            if (purified || done || ended) return;
            if (b.classList.contains('said')) return; // 연타 방지
            b.classList.add('said');
            b.disabled = true;
            ctx.audio.star();
            said++;
            if (said >= OATHS.length) later(purify, 500);
          },
          'g12-oath'
        );
        row.appendChild(b);
      });
      wrap.appendChild(row);
      later(purify, OATH_TIMEOUT_MS);

      function purify() {
        if (purified || done || ended) return;
        purified = true;
        cheer.remove();
        row.remove();

        const flash = el('div', 'g12-flash');
        wrap.appendChild(flash);
        later(() => flash.remove(), 400);

        bossBox.classList.remove('stagger');
        wrap.classList.add('pure');
        ctx.audio.fanfare();
        bossSay('고마워… 어둠이 걷혔어. 나는 원래 이 성을 지키던 수호 로봇이었단다.');
        later(showResult, 2600);
      }
    }

    /* ---------- 결과 ---------- */
    function showResult() {
      if (ended || done) return;
      ended = true;
      timerOn = false;

      const score = Math.max(0, Math.min(100, correct * 8 + hearts * 4));
      const title =
        score >= 90
          ? '전설의 AI 윤리 수호자 👑'
          : score >= 70
            ? '빛나는 수호자 ✨'
            : score >= 40
              ? '견습 수호자 🛡️'
              : '수호자 훈련생 🌱';
      const icons = score >= 90 ? '👑✨' : score >= 70 ? '🛡️✨' : '🛡️💦';

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>성을 되찾았다! 🏰</h2>
        <div class="howto-icons">${icons}</div>
        <div class="howto-desc">
          깨뜨린 어둠 카드: <b>${correct} / ${ROUNDS.length}</b><br>
          지켜 낸 하트: <b>${hearts} / 3</b><br><br>
          너의 칭호는… <b>${title}</b>!<br>
          배운 것을 기억하는 네가 진짜 AI 윤리 수호자야!
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

    /* ---------- 시작: 등장 연출 ---------- */
    updateHud();
    timerFill.style.width = '100%';
    ctx.audio.pop();
    // 드롭이 끝나면 등장 전용 클래스를 떼어 낸다 (이후 attack/hurt/stagger 해제 시 재생 방지)
    later(() => bossBox.classList.remove('g12-enter'), ENTER_MS);
    later(startRound, 1800);

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
