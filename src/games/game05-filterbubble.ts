// 5차시: 추천 소용돌이 탈출 (추천 알고리즘 / 필터버블)
// (A) 같은 주제만 눌러 소용돌이에 빠져 보고,
// (B) 서로 다른 주제 5가지를 골고루 봐서 필터버블을 깨고,
// (C) 내가 추천 AI가 되어 알고리즘의 원리를 맞혀 본다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

interface Cat {
  key: string;
  emoji: string;
  name: string;
  color: string;
  titles: string[];
}

const CATS: Cat[] = [
  {
    key: 'game',
    emoji: '🎮',
    name: '게임',
    color: '#b39dff',
    titles: [
      '신작 게임 공략',
      '게임 최고 기록 도전!',
      '숨겨진 맵 발견',
      '전설의 아이템 얻는 법',
      '게임 속 이스터에그',
      '게임 캐릭터 그리기'
    ]
  },
  {
    key: 'cat',
    emoji: '🐱',
    name: '고양이',
    color: '#ffd93d',
    titles: [
      '졸린 고양이 모음',
      '아기 고양이 첫 산책',
      '고양이 간식 만들기',
      '고양이 vs 오이',
      '고양이 말 알아듣기'
    ]
  },
  {
    key: 'science',
    emoji: '🔬',
    name: '과학',
    color: '#7cc7ff',
    titles: [
      '집에서 하는 화산 실험',
      '우주는 얼마나 클까?',
      '공룡은 왜 사라졌을까',
      '번개는 왜 칠까?',
      '로봇 만들기 도전'
    ]
  },
  {
    key: 'cook',
    emoji: '🍳',
    name: '요리',
    color: '#ffab76',
    titles: [
      '3분 계란빵 만들기',
      '세상에서 제일 큰 피자',
      '달고나 만들기',
      '급식 인기 메뉴 따라 하기',
      '과일 화채 레시피'
    ]
  },
  {
    key: 'sport',
    emoji: '⚽',
    name: '운동',
    color: '#6ee7c8',
    titles: [
      '축구 드리블 비법',
      '줄넘기 100번 도전',
      '농구 슛 연습법',
      '재미있는 체육 놀이',
      '수영 첫걸음'
    ]
  }
];

const GAME_CAT = CATS[0];

const AI_LINES_A = [
  '게임 영상을 봤네? 비슷한 걸 더 보여 줄게!',
  '게임을 좋아하는 게 확실해! 게임 영상 추가!',
  '너 = 게임 팬! 다른 건 필요 없지?',
  '이제 추천은 전부 게임이야! 편하지?',
  '완벽해! 너는 이제 게임 영상만 보면 돼!'
];

const TIME_LIMIT = 120; // 페이즈 B 제한시간(초)
const MAX_ROUNDS = 10; // 페이즈 B 최대 라운드

interface QuizC {
  who: string;
  hist: string[];
  q: string;
  choices: string[];
  answer: number;
  explain: string;
}

const QUIZ_C: QuizC[] = [
  {
    who: '하늘이',
    hist: ['🐶 강아지 훈련 브이로그', '🐶 강아지 간식 만들기', '🐶 귀여운 강아지 모음'],
    q: '추천 AI는 하늘이에게 무엇을 보여 줄까요?',
    choices: ['🐶 강아지 목욕시키기', '➗ 수학 문제 풀이', '🏎️ 자동차 경주'],
    answer: 0,
    explain: '추천 AI는 시청 기록과 <b>비슷한 영상</b>을 골라 보여 줘요.'
  },
  {
    who: '바다',
    hist: ['⚽ 축구 하이라이트', '⚽ 축구화 리뷰', '⚽ 드리블 강좌'],
    q: '추천 AI는 바다에게 무엇을 보여 줄까요?',
    choices: ['🎹 피아노 연주', '⚽ 멋진 골 모음', '🎨 종이접기'],
    answer: 1,
    explain: '많이 본 주제일수록 그 주제가 추천에 더 많이 나와요.'
  },
  {
    who: '강이',
    hist: [
      '👻 무서운 영상을 <b>실수로</b> 눌렀어요',
      '⏱️ 무서워서 화면을 못 끄고 오래 봤어요',
      '🙅 사실은 하나도 좋아하지 않아요'
    ],
    q: '추천 AI는 강이에게 어떻게 할까요?',
    choices: [
      '무서운 영상을 더 추천한다',
      '무서워하는 걸 알고 그만 보여 준다',
      '아무 변화가 없다'
    ],
    answer: 0,
    explain:
      'AI는 내 <b>마음</b>이 아니라 <b>누른 기록과 본 시간</b>만 봐요. 그래서 실수로 본 것도 좋아한다고 착각해요.'
  }
];

const CSS = `
.g05-scene { background: linear-gradient(180deg,#e7dcff 0%,#f6efff 55%,#fff9e8 100%); }

/* ---------- 왼쪽: 폰 피드 ---------- */
.g05-phone {
  position:absolute; left:24px; top:82px; width:700px; height:694px;
  background:#fffdf5; border:8px solid #3a3352; border-radius:38px;
  box-shadow:0 10px 0 rgba(58,51,82,.22); overflow:hidden;
}
.g05-tint { position:absolute; inset:0; opacity:0; pointer-events:none;
  transition:opacity .5s ease, background-color .5s ease; }
.g05-phone-inner { position:absolute; inset:0; padding:20px 26px; display:flex; flex-direction:column; }
.g05-app { font-size:28px; font-weight:800; color:#e03e5a; display:flex; align-items:center; gap:10px; }
.g05-app .g05-app-sub { font-size:19px; color:#8a83a6; font-weight:700; margin-left:auto; }
.g05-hint {
  margin:10px 0 12px; min-height:58px; display:flex; align-items:center; justify-content:center;
  text-align:center; font-size:21px; font-weight:700; line-height:1.35; color:#4a4270;
  background:rgba(255,255,255,.85); border-radius:16px; padding:8px 14px;
}
.g05-grid { display:grid; grid-template-columns:repeat(2,300px); grid-template-rows:repeat(2,200px);
  gap:18px; justify-content:center; }
.g05-card {
  border:5px solid #ded7ff; border-radius:24px; background:#fff;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  font-family:inherit; color:#3a3352; cursor:pointer; padding:8px;
  animation:g05-pop .28s ease backwards; box-shadow:0 5px 0 rgba(58,51,82,.14);
}
.g05-card:active { transform:translateY(3px); box-shadow:0 2px 0 rgba(58,51,82,.14); }
.g05-emoji { font-size:56px; line-height:1; }
.g05-title { font-size:23px; font-weight:800; text-align:center; line-height:1.25; padding:0 6px; }
.g05-card.g05-hl { animation:g05-pop .28s ease backwards, g05-pulse 1.1s ease-in-out .3s infinite; }
.g05-card.g05-shake { animation:g05-shake .4s ease; }
.g05-card.g05-watch { filter:saturate(.5); }
.g05-round { margin-top:12px; text-align:center; font-size:20px; font-weight:800; color:#6b6488; }

/* ---------- 소용돌이 ---------- */
.g05-vortex { position:absolute; inset:-25%; pointer-events:none; opacity:0;
  display:flex; align-items:center; justify-content:center; transition:opacity .55s ease; }
.g05-swirl {
  position:absolute; border-radius:50%;
  background:conic-gradient(from 0deg, rgba(0,0,0,0) 0deg, var(--g05-c,#b39dff) 55deg,
    rgba(0,0,0,0) 130deg, var(--g05-c,#b39dff) 195deg, rgba(0,0,0,0) 265deg,
    var(--g05-c,#b39dff) 325deg, rgba(0,0,0,0) 360deg);
  -webkit-mask-image:radial-gradient(circle, rgba(0,0,0,1) 32%, rgba(0,0,0,0) 74%);
  mask-image:radial-gradient(circle, rgba(0,0,0,1) 32%, rgba(0,0,0,0) 74%);
  animation:g05-spin 8s linear infinite;
}
.g05-swirl.s1 { width:1000px; height:1000px; }
.g05-swirl.s2 { width:720px; height:720px; animation-direction:reverse; opacity:.85; }
.g05-swirl.s3 { width:460px; height:460px; opacity:.7; }
.g05-vortex.g05-break { animation:g05-break 1s ease forwards; }

/* ---------- 오른쪽 패널 ---------- */
.g05-right { position:absolute; left:748px; top:82px; width:508px; height:694px;
  display:flex; flex-direction:column; gap:12px; }
.g05-sora { display:flex; align-items:center; gap:10px; }
.g05-sora img { width:136px; height:136px; object-fit:contain; flex:none;
  animation:g05-bob 2.4s ease-in-out infinite; }
.g05-bubble { flex:1; background:#fff; border-radius:20px; padding:14px 16px;
  font-size:21px; font-weight:700; line-height:1.35; color:#3a3352;
  box-shadow:0 5px 0 rgba(58,51,82,.14); min-height:110px;
  display:flex; align-items:center; }
.g05-ai-bubble { background:#332c56; color:#efe9ff; border-radius:20px; padding:14px 18px;
  font-size:21px; font-weight:700; line-height:1.35; min-height:104px;
  display:flex; align-items:center; gap:12px; box-shadow:0 5px 0 rgba(58,51,82,.25); }
.g05-ai-bubble .g05-ai-face { font-size:36px; flex:none; }
.g05-strip { background:rgba(255,255,255,.92); border-radius:20px; padding:12px 14px;
  box-shadow:0 5px 0 rgba(58,51,82,.12); }
.g05-strip-t { font-size:19px; font-weight:800; color:#6b6488; margin-bottom:8px; }
.g05-slots { display:flex; gap:9px; }
.g05-slot { width:84px; height:84px; border-radius:18px; background:#f2eeff;
  border:4px solid #e2daff; display:flex; align-items:center; justify-content:center;
  font-size:40px; transition:background-color .3s ease, border-color .3s ease; }
.g05-gauge { background:rgba(255,255,255,.92); border-radius:20px; padding:12px 16px;
  box-shadow:0 5px 0 rgba(58,51,82,.12); }
.g05-gauge-l { font-size:24px; font-weight:800; color:#3a3352; }
.g05-gauge-bar { height:22px; margin-top:8px; background:#eae4ff; border-radius:999px; overflow:hidden; }
.g05-gauge-fill { height:100%; width:20%; border-radius:999px; transition:width .45s ease;
  background:linear-gradient(90deg,#b39dff,#ffd93d,#7cc7ff,#ffab76,#6ee7c8); }

/* ---------- 토스트 ---------- */
.g05-toast { position:absolute; left:374px; bottom:34px; transform:translateX(-50%);
  background:rgba(58,51,82,.93); color:#fff; font-size:21px; font-weight:700;
  padding:13px 22px; border-radius:999px; z-index:45; animation:g05-pop .2s ease; }

/* ---------- 페이즈 C 퀴즈 ---------- */
.howto-card.g05-qcard { width:880px; max-height:764px; overflow-y:auto; }
.howto-card.g05-qcard .btn { margin-top:16px; }
.g05-who { font-size:22px; font-weight:800; color:#6b6488; margin-bottom:8px; }
.g05-hist { background:#f5f1ff; border-radius:18px; padding:14px 18px; margin-bottom:16px;
  display:flex; flex-direction:column; gap:7px; }
.g05-hist-row { font-size:22px; font-weight:700; color:#3a3352; text-align:left; }
.g05-q { font-size:26px; font-weight:800; margin-bottom:14px; color:#3a3352; }
.g05-choices { display:flex; flex-direction:column; gap:12px; }
.g05-choice { min-height:68px; font-family:inherit; font-size:23px; font-weight:800;
  color:#3a3352; background:#fff; border:5px solid #e2daff; border-radius:18px;
  padding:10px 18px; cursor:pointer; }
.g05-choice:active { transform:translateY(2px); }
.g05-choice:disabled { cursor:default; opacity:1; color:#3a3352; }
.g05-choice.g05-ok { background:#dcf7e2; border-color:#51cf66; }
.g05-choice.g05-ng { background:#ffe2e2; border-color:#ff6b6b; }
.g05-exp { font-size:22px; line-height:1.5; color:#6b6488; margin-top:14px; }

@keyframes g05-spin { to { transform:rotate(360deg); } }
@keyframes g05-pop { from { opacity:0; transform:scale(.88); } to { opacity:1; transform:scale(1); } }
@keyframes g05-pulse {
  0%,100% { transform:scale(1); box-shadow:0 5px 0 rgba(58,51,82,.14); }
  50% { transform:scale(1.05); box-shadow:0 0 0 8px rgba(255,217,61,.55); }
}
@keyframes g05-shake {
  0%,100% { transform:translateX(0); }
  20% { transform:translateX(-9px); }
  40% { transform:translateX(9px); }
  60% { transform:translateX(-6px); }
  80% { transform:translateX(6px); }
}
@keyframes g05-break { to { opacity:0; transform:scale(2.4); } }
@keyframes g05-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const game05: MiniGame = {
  lessonId: 5,
  mount(container: HTMLElement, ctx: GameCtx) {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const wrap = el('div', 'game-wrap g05-scene');
    container.appendChild(wrap);

    const timers: number[] = [];
    let closed = false; // finish/quit 중복 방지
    let locked = false; // 시청 중 입력 잠금
    let phase: 'A' | 'B' | 'C' | 'end' = 'A';

    function after(ms: number, fn: () => void) {
      const t = window.setTimeout(() => {
        if (closed) return;
        fn();
      }, ms);
      timers.push(t);
      return t;
    }
    function stopAll() {
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      timers.length = 0;
    }
    function doQuit() {
      if (closed) return;
      closed = true;
      stopAll();
      ctx.quit();
    }
    function doFinish(score: number) {
      if (closed) return;
      closed = true;
      stopAll();
      ctx.finish(score);
    }

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quitBtn = button('🗺️', doQuit, 'icon-btn');
    const nameEl = el('div', 'game-name', '🌀 추천 소용돌이 탈출');
    const timerBar = el('div', 'timer-bar');
    const timerFill = el('div', 'timer-fill');
    timerBar.appendChild(timerFill);
    const scoreEl = el('div', 'game-score', '0점');
    topbar.append(quitBtn, nameEl, timerBar, scoreEl);
    wrap.appendChild(topbar);

    // ---------- 폰 피드 ----------
    const phone = el('div', 'g05-phone');
    const tint = el('div', 'g05-tint');
    const vortex = el('div', 'g05-vortex');
    const swirls = [el('div', 'g05-swirl s1'), el('div', 'g05-swirl s2'), el('div', 'g05-swirl s3')];
    swirls.forEach((s) => vortex.appendChild(s));
    const inner = el('div', 'g05-phone-inner');
    const appBar = el(
      'div',
      'g05-app',
      '▶ 뷰튜브<span class="g05-app-sub">추천 피드</span>'
    );
    const hint = el('div', 'g05-hint', '');
    const grid = el('div', 'g05-grid');
    const roundEl = el('div', 'g05-round', '');
    inner.append(appBar, hint, grid, roundEl);
    phone.append(tint, inner, vortex);
    wrap.appendChild(phone);

    // ---------- 오른쪽 패널 ----------
    const right = el('div', 'g05-right');
    const soraRow = el('div', 'g05-sora');
    const soraBubble = el('div', 'g05-bubble', '내 화면 좀 도와줘!');
    soraRow.append(charImg('char05', '', '소라'), soraBubble);

    const aiBubble = el('div', 'g05-ai-bubble');
    const aiFace = el('div', 'g05-ai-face', '🤖');
    const aiText = el('div', 'g05-ai-text', '추천 AI가 네 취향을 관찰하고 있어…');
    aiBubble.append(aiFace, aiText);

    const strip = el('div', 'g05-strip');
    const stripTitle = el('div', 'g05-strip-t', '📼 최근 본 영상');
    const slots = el('div', 'g05-slots');
    const slotEls: HTMLElement[] = [];
    for (let i = 0; i < 5; i++) {
      const s = el('div', 'g05-slot', '·');
      slotEls.push(s);
      slots.appendChild(s);
    }
    strip.append(stripTitle, slots);

    const gauge = el('div', 'g05-gauge');
    const gaugeLabel = el('div', 'g05-gauge-l', '🌈 다양성 1 / 5');
    const gaugeBar = el('div', 'g05-gauge-bar');
    const gaugeFill = el('div', 'g05-gauge-fill');
    gaugeBar.appendChild(gaugeFill);
    gauge.append(gaugeLabel, gaugeBar);

    right.append(soraRow, aiBubble, strip, gauge);
    wrap.appendChild(right);

    // ---------- 제목 풀 ----------
    const pools = new Map<string, string[]>();
    const posMap = new Map<string, number>();
    CATS.forEach((c) => {
      pools.set(c.key, shuffle(c.titles));
      posMap.set(c.key, 0);
    });
    function nextTitle(cat: Cat, used: Set<string>): string {
      let t = cat.titles[0];
      for (let i = 0; i < 24; i++) {
        let pool = pools.get(cat.key) as string[];
        let p = posMap.get(cat.key) as number;
        if (p >= pool.length) {
          pool = shuffle(cat.titles);
          pools.set(cat.key, pool);
          p = 0;
        }
        t = pool[p];
        posMap.set(cat.key, p + 1);
        if (!used.has(t)) break;
      }
      used.add(t);
      return t;
    }

    // ---------- 공통 UI 갱신 ----------
    let history: string[] = []; // 최근 본 카테고리 key (최대 5)

    function catOf(key: string): Cat {
      return CATS.find((c) => c.key === key) ?? GAME_CAT;
    }
    function distinctCount(): number {
      return new Set(history).size;
    }
    function dominantCat(): Cat {
      if (history.length === 0) return GAME_CAT;
      let best = history[0];
      let bestN = -1;
      let bestLast = -1;
      const keys = Array.from(new Set(history));
      for (const k of keys) {
        const n = history.filter((h) => h === k).length;
        const last = history.lastIndexOf(k);
        if (n > bestN || (n === bestN && last > bestLast)) {
          best = k;
          bestN = n;
          bestLast = last;
        }
      }
      return catOf(best);
    }

    function setSora(text: string) {
      soraBubble.innerHTML = text;
    }
    function setAi(text: string) {
      aiText.innerHTML = text;
    }
    function renderStrip() {
      for (let i = 0; i < 5; i++) {
        const k = history[history.length - 5 + i];
        const s = slotEls[i];
        if (k === undefined) {
          s.textContent = '·';
          s.style.background = '';
          s.style.borderColor = '';
        } else {
          const c = catOf(k);
          s.textContent = c.emoji;
          s.style.background = `${c.color}33`;
          s.style.borderColor = c.color;
        }
      }
    }
    function setGauge(n: number) {
      gaugeLabel.textContent = `🌈 다양성 ${n} / 5`;
      gaugeFill.style.width = `${(n / 5) * 100}%`;
    }
    function setBubbleView(b: number, color: string) {
      const bb = Math.max(0, Math.min(1, b));
      vortex.style.setProperty('--g05-c', color);
      vortex.style.opacity = String(bb * 0.55);
      swirls.forEach((s, i) => {
        s.style.animationDuration = `${(8 - 5 * bb) * (1 + i * 0.22)}s`;
      });
      tint.style.backgroundColor = color;
      tint.style.opacity = String(bb * 0.35);
    }

    let toastEl: HTMLElement | null = null;
    function toast(msg: string) {
      if (toastEl) toastEl.remove();
      const t = el('div', 'g05-toast', msg);
      toastEl = t;
      wrap.appendChild(t);
      after(1700, () => {
        t.remove();
        if (toastEl === t) toastEl = null;
      });
    }

    // ---------- 카드 렌더 ----------
    interface FeedCard {
      cat: Cat;
      elem: HTMLButtonElement;
      titleEl: HTMLElement;
    }
    let feed: FeedCard[] = [];

    function renderFeed(cats: Cat[], highlight: number, onTap: (i: number) => void) {
      grid.innerHTML = '';
      feed = [];
      const used = new Set<string>();
      cats.forEach((cat, i) => {
        const title = nextTitle(cat, used);
        const b = el('button', 'g05-card');
        b.style.borderColor = cat.color;
        b.style.background = `${cat.color}26`;
        b.style.animationDelay = `${i * 60}ms`;
        const emo = el('div', 'g05-emoji', cat.emoji);
        const tt = el('div', 'g05-title', title);
        b.append(emo, tt);
        if (i === highlight) b.classList.add('g05-hl');
        b.addEventListener('click', () => onTap(i));
        grid.appendChild(b);
        feed.push({ cat, elem: b, titleEl: tt });
      });
    }

    function showWatching(card: FeedCard) {
      card.elem.classList.add('g05-watch');
      card.elem.classList.remove('g05-hl');
      card.titleEl.textContent = '시청 중… 👀';
    }

    // ============================================================
    // 페이즈 A: 소용돌이 빠지기
    // ============================================================
    let aTaps = 0;

    function buildFeedA() {
      const gameCount = Math.min(4, aTaps + 1);
      const others = shuffle(CATS.filter((c) => c.key !== 'game')).slice(0, 4 - gameCount);
      const cats: Cat[] = [];
      for (let i = 0; i < gameCount; i++) cats.push(GAME_CAT);
      cats.push(...others);
      const mixed = shuffle(cats);
      const gameIdx = mixed.map((c, i) => (c.key === 'game' ? i : -1)).filter((i) => i >= 0);
      const hi = gameIdx[Math.floor(Math.random() * gameIdx.length)];
      renderFeed(mixed, hi, (i) => onTapA(i, hi));
      roundEl.textContent = `따라 하기 ${aTaps + 1} / 5`;
    }

    function onTapA(i: number, hi: number) {
      if (locked || phase !== 'A') return;
      const card = feed[i];
      if (i !== hi) {
        ctx.audio.pop();
        card.elem.classList.add('g05-shake');
        after(420, () => card.elem.classList.remove('g05-shake'));
        toast('지금은 소라가 눌렀던 대로 따라가 보자!');
        return;
      }
      locked = true;
      ctx.audio.pop();
      showWatching(card);
      after(500, () => {
        aTaps++;
        history.push('game');
        if (history.length > 5) history.shift();
        renderStrip();
        setGauge(distinctCount());
        setAi(AI_LINES_A[Math.min(aTaps - 1, AI_LINES_A.length - 1)]);
        setBubbleView(0.1 + aTaps * 0.12, GAME_CAT.color);
        setSora(
          aTaps >= 4
            ? '어… 다른 영상은 어디로 간 거지…?'
            : '앗! 게임 영상이 점점 더 많아지는데?'
        );
        if (aTaps >= 5) {
          endPhaseA();
        } else {
          buildFeedA();
          locked = false;
        }
      });
    }

    function endPhaseA() {
      hint.innerHTML = '화면이 게임 영상으로 가득 찼어…';
      roundEl.textContent = '';
      grid.innerHTML = '';
      setBubbleView(1, GAME_CAT.color);
      ctx.audio.bad();
      after(1500, () => {
        const ov = el('div', 'howto-overlay');
        const card = el('div', 'card howto-card');
        card.innerHTML = `
          <h2>필터버블 발견! 🌀</h2>
          <div class="howto-icons">🌀😵‍💫</div>
          <div class="howto-desc">
            <b>소라</b> — "으악! 내 화면이 온통 게임뿐이야!<br>
            이게 바로 <b>필터버블</b>이구나…"<br><br>
            <b>에티</b> — "탈출 방법은 하나! <b>서로 다른 주제 5가지</b>를 골고루 보는 거야."
          </div>`;
        const go = button(
          '탈출 작전 시작! 🌀',
          () => {
            ov.remove();
            startPhaseB();
          },
          'btn big yellow'
        );
        card.appendChild(go);
        ov.appendChild(card);
        wrap.appendChild(ov);
      });
    }

    // ============================================================
    // 페이즈 B: 소용돌이 탈출
    // ============================================================
    let bRounds = 0;
    let bScore = 0;
    let escaped = false;
    let timeLeft = TIME_LIMIT;
    let tickId = 0;

    function updateScoreEl() {
      let v = 0;
      if (phase === 'A') v = 0;
      else if (phase === 'B') v = escaped ? bScore : distinctCount() * 6;
      else v = Math.min(100, bScore + cScore);
      scoreEl.textContent = `${v}점`;
    }

    function buildFeedB() {
      const dom = dominantCat();
      const distinct = distinctCount();
      const b = (5 - distinct) / 4;
      const domCount = Math.min(3, 1 + Math.round(2 * b));
      const others = shuffle(CATS.filter((c) => c.key !== dom.key)).slice(0, 4 - domCount);
      const cats: Cat[] = [];
      for (let i = 0; i < domCount; i++) cats.push(dom);
      cats.push(...others);
      renderFeed(shuffle(cats), -1, onTapB);
      roundEl.textContent = `라운드 ${bRounds + 1} / ${MAX_ROUNDS}`;
    }

    function onTapB(i: number) {
      if (locked || phase !== 'B') return;
      const card = feed[i];
      const cat = card.cat;
      const dom = dominantCat();
      const wasNew = !history.includes(cat.key);
      const wasDominant = cat.key === dom.key;
      locked = true;
      ctx.audio.pop();
      showWatching(card);
      after(500, () => {
        if (phase !== 'B') return;
        history.push(cat.key);
        if (history.length > 5) history.shift();
        bRounds++;

        const distinct = distinctCount();
        const newDom = dominantCat();
        renderStrip();
        setGauge(distinct);
        setBubbleView((5 - distinct) / 4, newDom.color);

        if (wasNew) {
          ctx.audio.good();
          floater(wrap, 374, 400, '새로운 주제 발견! 🌈', true);
          setAi('어? 새로운 걸 보네! 추천을 다시 계산할게…');
          setSora('오! 화면이 조금 밝아진 것 같아!');
        } else if (wasDominant) {
          ctx.audio.bad();
          floater(wrap, 374, 400, '소용돌이가 세진다… 🌀', false);
          setAi('역시 이걸 좋아하는구나! 더 보여 줄게!');
          setSora('앗, 또 같은 주제야… 어지러워!');
        } else {
          ctx.audio.pop();
          setAi('취향이 다양해지고 있어…');
          setSora('음, 이건 아까 본 주제네.');
        }
        updateScoreEl();

        if (distinct >= 5) {
          escapeB();
          return;
        }
        if (bRounds >= MAX_ROUNDS || timeLeft <= 0) {
          endPhaseB();
          return;
        }
        buildFeedB();
        locked = false;
      });
    }

    function startPhaseB() {
      phase = 'B';
      locked = false;
      bRounds = 0;
      timeLeft = TIME_LIMIT;
      history = ['game', 'game', 'game', 'game', 'game'];
      hint.innerHTML = '🌈 <b>서로 다른 주제 5가지</b>를 골고루 봐서 소용돌이를 탈출하자!';
      setSora('부탁해! 다양한 영상을 눌러 줘!');
      setAi('추천 AI: 네가 좋아하는 게임만 잔뜩 준비했어!');
      renderStrip();
      setGauge(distinctCount());
      setBubbleView(1, GAME_CAT.color);
      updateScoreEl();
      buildFeedB();

      tickId = window.setInterval(() => {
        if (closed || phase !== 'B') return;
        timeLeft -= 0.2;
        const pct = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
        timerFill.style.width = `${pct}%`;
        timerFill.classList.toggle('danger', pct < 25);
        if (timeLeft <= 0 && !locked) endPhaseB();
      }, 200);
      timers.push(tickId);
    }

    function escapeB() {
      escaped = true;
      locked = true;
      bScore = Math.min(70, 40 + (MAX_ROUNDS - bRounds) * 5);
      clearInterval(tickId);
      grid.innerHTML = '';
      roundEl.textContent = '';
      hint.innerHTML = '✨ 소용돌이가 갈라진다!';
      vortex.classList.add('g05-break');
      tint.style.opacity = '0';
      ctx.audio.fanfare();
      setSora('우와! 화면에 여러 가지 세상이 돌아왔어!');
      setAi('추천을 처음부터 다시 배워야겠는걸…');
      updateScoreEl();
      after(1700, () => startPhaseC());
    }

    function endPhaseB() {
      if (phase !== 'B') return;
      phase = 'end';
      locked = true;
      clearInterval(tickId);
      const distinct = distinctCount();
      bScore = distinct * 6;
      grid.innerHTML = '';
      roundEl.textContent = '';
      hint.innerHTML = `시간 끝! 그래도 다양성이 <b>${distinct}</b>까지 늘었어.`;
      setSora('조금은 다른 영상도 보였어. 고마워!');
      updateScoreEl();
      after(1600, () => startPhaseC());
    }

    // ============================================================
    // 페이즈 C: 내가 추천 AI!
    // ============================================================
    let cIdx = 0;
    let cCorrect = 0;
    let cScore = 0;

    function startPhaseC() {
      phase = 'C';
      locked = false;
      timerFill.style.width = '100%';
      timerFill.classList.remove('danger');
      hint.innerHTML = '🤖 이번엔 네가 추천 AI!';
      cIdx = 0;
      cCorrect = 0;
      cScore = 0;
      showQuestion();
    }

    function showQuestion() {
      if (cIdx >= QUIZ_C.length) {
        showResult();
        return;
      }
      const q = QUIZ_C[cIdx];
      const ov = el('div', 'howto-overlay');
      const card = el('div', 'card howto-card g05-qcard');
      const guide = el(
        'div',
        'g05-who',
        cIdx === 0
          ? '에티 — 이번엔 네가 추천 AI가 되어 볼 차례! 알고리즘이라면 어떤 영상을 보여 줄까?'
          : `🤖 추천 AI 문제 ${cIdx + 1} / ${QUIZ_C.length}`
      );
      const head = el('div', 'g05-who', `📼 ${q.who}의 시청 기록`);
      const hist = el('div', 'g05-hist');
      q.hist.forEach((h) => hist.appendChild(el('div', 'g05-hist-row', h)));
      const qEl = el('div', 'g05-q', q.q);
      const choices = el('div', 'g05-choices');
      const btns: HTMLButtonElement[] = [];
      const exp = el('div', 'g05-exp', '');

      q.choices.forEach((c, i) => {
        const b = el('button', 'g05-choice');
        b.innerHTML = c;
        b.addEventListener('click', () => pick(i));
        btns.push(b);
        choices.appendChild(b);
      });

      let answered = false;
      function pick(i: number) {
        if (answered || closed) return;
        answered = true;
        btns.forEach((b) => (b.disabled = true));
        btns[q.answer].classList.add('g05-ok');
        if (i === q.answer) {
          cCorrect++;
          cScore += 10;
          ctx.audio.good();
          floater(wrap, 640, 300, '+10점 🌈', true);
        } else {
          btns[i].classList.add('g05-ng');
          ctx.audio.bad();
        }
        updateScoreEl();
        exp.innerHTML = q.explain;
        const next = button(
          cIdx >= QUIZ_C.length - 1 ? '결과 확인 ▶' : '다음 ▶',
          () => {
            ov.remove();
            cIdx++;
            showQuestion();
          },
          'btn big mint'
        );
        card.appendChild(next);
      }

      card.append(guide, head, hist, qEl, choices, exp);
      ov.appendChild(card);
      wrap.appendChild(ov);
    }

    // ============================================================
    // 결과
    // ============================================================
    function showResult() {
      phase = 'end';
      const total = Math.max(0, Math.min(100, Math.round(bScore + cScore)));
      const distinct = distinctCount();
      const ov = el('div', 'game-over-overlay');
      const card = el('div', 'card howto-card');
      card.innerHTML = `
        <h2>${escaped ? '소용돌이 탈출 성공! 🌈' : '소용돌이가 아직 남았어… 🌀'}</h2>
        <div class="howto-icons">${escaped ? '🌈✨' : '🌀💦'}</div>
        <div class="howto-desc">
          ${escaped ? `탈출 성공! 사용한 라운드: <b>${bRounds}</b>` : '아쉽게 탈출은 못 했어요'}<br>
          🌈 다양성: <b>${distinct} / 5</b><br>
          🤖 추천 AI 문제: <b>${cCorrect} / ${QUIZ_C.length}</b><br>
          총점: <b>${total}점</b><br><br>
          추천은 편리하지만, 무엇을 볼지 정하는 건 <b>나 자신</b>이야!
        </div>`;
      const done = button('결과 보기 🏆', () => doFinish(total), 'btn big yellow');
      card.appendChild(done);
      ov.appendChild(card);
      wrap.appendChild(ov);
      if (escaped) ctx.audio.fanfare();
      else ctx.audio.star();
    }

    // ---------- 시작 ----------
    hint.innerHTML = '먼저 소라의 화면을 따라가 보자! <b>반짝이는 게임 영상</b>만 눌러 봐.';
    setSora('내가 눌렀던 대로 따라 해 볼래?<br>무슨 일이 생기는지 보여 줄게!');
    setAi('추천 AI: 네가 뭘 좋아하는지 지켜보는 중…');
    renderStrip();
    setGauge(1);
    setBubbleView(0.1, GAME_CAT.color);
    updateScoreEl();
    buildFeedA();

    return () => {
      closed = true;
      phase = 'end';
      stopAll();
      style.remove();
      wrap.remove();
    };
  }
};
