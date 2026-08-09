// 6차시: 작품 주인 찾기 (AI와 저작권)
// 화가 로봇 '그리미'가 만든 AI 그림 4점에 숨은 원작을 찾아 이름표(출처)를 달고,
// 그리미의 고민에 바른 선택으로 답한다. (찾기 페이즈 + 선택 페이즈 반복)

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

interface Motif {
  e: string;
  x: number; // % 가로 위치
  y: number; // % 세로 위치
  s: number; // 큰 액자 기준 폰트 크기(px)
}

interface Art {
  bg: string;
  motifs: Motif[];
}

interface Origin {
  id: string;
  artist: string; // 작가 이름
  title: string; // 작품명
  art: Art;
}

interface Round {
  title: string;
  art: Art;
  answers: string[]; // Origin id 2개
  question: string;
  choices: string[];
  answer: number;
  okExplain: string;
  ngExplain: string;
  bubble: string;
  note?: string; // 찾기 완료 시 에티 한 줄
}

const CARD_SCALE = 0.5; // 원작 카드 미니 액자용 모티프 축소 비율
const TIME_LIMIT = 40; // 찾기 페이즈 제한 시간(초)

// ---------- 원작 전시대 6장 (그리드 순서 고정) ----------
const ORIGINS: Origin[] = [
  {
    id: 'star',
    artist: '별이',
    title: '반짝 별 하늘',
    art: {
      bg: '#6b5bd2',
      motifs: [
        { e: '🌟', x: 26, y: 26, s: 64 },
        { e: '✨', x: 66, y: 20, s: 52 },
        { e: '🌟', x: 74, y: 64, s: 56 },
        { e: '✨', x: 32, y: 72, s: 48 }
      ]
    }
  },
  {
    id: 'cat',
    artist: '몽이',
    title: '웃는 고양이',
    art: { bg: '#fff3d6', motifs: [{ e: '😺', x: 50, y: 50, s: 84 }] }
  },
  {
    id: 'tree',
    artist: '초록',
    title: '숲속 나무 친구',
    art: {
      bg: '#dff5d8',
      motifs: [
        { e: '🌳', x: 34, y: 58, s: 76 },
        { e: '🌳', x: 68, y: 52, s: 66 }
      ]
    }
  },
  {
    id: 'wave',
    artist: '파랑',
    title: '출렁 바다 물결',
    art: {
      bg: '#d8ecff',
      motifs: [
        { e: '🌊', x: 30, y: 70, s: 72 },
        { e: '🌊', x: 70, y: 66, s: 72 }
      ]
    }
  },
  {
    id: 'flower',
    artist: '꽃님',
    title: '분홍 꽃밭',
    art: {
      bg: '#ffe3ef',
      motifs: [
        { e: '🌸', x: 24, y: 60, s: 58 },
        { e: '🌸', x: 50, y: 44, s: 64 },
        { e: '🌸', x: 76, y: 62, s: 58 }
      ]
    }
  },
  {
    id: 'moon',
    artist: '달빛',
    title: '노란 초승달',
    art: { bg: '#2f3a6e', motifs: [{ e: '🌙', x: 70, y: 28, s: 80 }] }
  }
];

// ---------- 라운드 4개 ----------
const ROUNDS: Round[] = [
  {
    title: '별 헤는 고양이',
    art: {
      bg: '#6b5bd2',
      motifs: [
        { e: '✨', x: 18, y: 22, s: 52 },
        { e: '🌟', x: 78, y: 20, s: 58 },
        { e: '✨', x: 85, y: 62, s: 46 },
        { e: '🌟', x: 14, y: 68, s: 50 },
        { e: '😺', x: 50, y: 52, s: 110 }
      ]
    },
    answers: ['star', 'cat'],
    question: '이 그림을 섬 전시회에 걸고 싶어! 어떻게 걸까?',
    choices: [
      '"내가 혼자 다 그렸어요!"라고 써 붙인다',
      '"AI 그리미 작품이에요. 별이·몽이 작가님 작품을 참고했어요"라고 밝힌다',
      '아무 설명 없이 몰래 건다'
    ],
    answer: 1,
    okExplain: '참고한 작품의 주인을 밝히는 게 바로 출처 표시야!',
    ngExplain: '참고한 작가님이 있는데 숨기면, 작가님의 노력을 가로채는 거야.',
    bubble: '내 첫 작품 「별 헤는 고양이」야!<br>어떤 작가님 그림이 숨어 있을까?'
  },
  {
    title: '바닷가 꽃밭',
    art: {
      bg: '#d8ecff',
      motifs: [
        { e: '🌸', x: 24, y: 26, s: 60 },
        { e: '🌸', x: 50, y: 18, s: 66 },
        { e: '🌸', x: 76, y: 28, s: 60 },
        { e: '🌊', x: 28, y: 74, s: 74 },
        { e: '🌊', x: 70, y: 72, s: 74 }
      ]
    },
    answers: ['wave', 'flower'],
    question: '이 그림, 학교 미술 숙제로 내면 어떨까?',
    choices: [
      'AI가 만든 그림을 내가 그린 그림이라고 그냥 낸다',
      '친구 이름으로 낸다',
      '선생님께 AI로 만들었다고 솔직히 말씀드리고 여쭤본다'
    ],
    answer: 2,
    okExplain: 'AI를 썼다면 썼다고 밝히는 게 정직한 창작 태도야.',
    ngExplain: 'AI가 만든 걸 내 솜씨라고 하면 선생님과 친구들을 속이는 거야.',
    bubble: '이번엔 「바닷가 꽃밭」이야.<br>참고한 작품 두 개를 찾아 줄래?'
  },
  {
    title: '달빛 숲',
    art: {
      bg: '#2f3a6e',
      motifs: [
        { e: '🌙', x: 78, y: 22, s: 78 },
        { e: '🌳', x: 32, y: 68, s: 78 },
        { e: '🌳', x: 66, y: 72, s: 68 }
      ]
    },
    answers: ['moon', 'tree'],
    question: '이 그림을 인터넷에 올리고 싶어!',
    choices: [
      '원작자 이름을 지우고 올린다',
      "'AI로 만들었고 달빛·초록 작가님 작품을 참고했어요'라고 함께 적어 올린다",
      '"누구나 마음대로 퍼가세요!"라고 내 맘대로 허락한다'
    ],
    answer: 1,
    okExplain: '인터넷에 올릴 때도 출처와 AI 사용 사실을 함께 적는 거야.',
    ngExplain: '허락은 작품 주인만 할 수 있어. 남의 작품을 내 맘대로 정하면 안 돼.',
    bubble: '「달빛 숲」이야. 밤 느낌 나지?<br>여기에도 주인이 숨어 있을 거야!'
  },
  {
    title: '별빛 바다',
    art: {
      bg: 'linear-gradient(180deg,#6b5bd2 0%,#6b5bd2 45%,#d8ecff 100%)',
      motifs: [
        { e: '🌟', x: 24, y: 22, s: 60 },
        { e: '✨', x: 56, y: 16, s: 48 },
        { e: '🌟', x: 80, y: 26, s: 54 },
        { e: '🌊', x: 50, y: 78, s: 84 }
      ]
    },
    answers: ['star', 'wave'],
    question: '누가 이 그림을 사고 싶대! 팔아도 될까?',
    choices: [
      '참고한 작가님들 몰래 얼른 판다',
      '값을 두 배로 올려서 판다',
      '별이·파랑 작가님께 먼저 여쭤보고 함께 정한다'
    ],
    answer: 2,
    okExplain: '돈이 오가는 일일수록 원작자의 허락이 꼭 필요해.',
    ngExplain: '참고한 작품으로 돈을 벌면서 주인 몰래 하면 안 돼.',
    bubble: '마지막 작품 「별빛 바다」!<br>이 그림은 어디서 배워 만든 걸까?',
    note: '한 작품이 여러 그림에 참고되기도 해!'
  }
];

const CSS = `
.g06-scene { background: linear-gradient(180deg,#f6ecff 0%,#fff6e8 60%,#ffeedd 100%); }
.g06-hidden { display: none; }
.g06-timer-off { visibility: hidden; }

.g06-left { position:absolute; left:0; top:70px; width:560px; height:730px; }
.g06-progress { position:absolute; left:56px; top:6px; font-size:24px; font-weight:800;
  background:rgba(255,255,255,.92); padding:6px 20px; border-radius:999px; box-shadow:var(--shadow); }
.g06-frame-slot { position:absolute; left:56px; top:52px; width:420px; height:326px; }
.g06-frame { position:absolute; inset:0; border:14px solid #d9a441; border-radius:10px;
  box-shadow:0 8px 0 rgba(58,51,82,.2); overflow:hidden;
  transition: transform .35s ease, opacity .35s ease; }
.g06-frame.g06-out { transform: translateY(-70px) scale(.95); opacity:0; }
.g06-frame-title { position:absolute; left:0; right:0; bottom:0; text-align:center;
  font-size:22px; font-weight:800; color:#fff; padding:6px 0;
  background:rgba(44,37,71,.5); }
.g06-motif { position:absolute; transform:translate(-50%,-50%); line-height:1; }

/* 이름표 한 줄(예: 🏷️ 참고: 초록 작가 「숲속 나무 친구」)이 줄바꿈 없이 들어가야
   명패가 아래 그리미 영역(top 512px)을 침범하지 않는다. → 폭 496px 확보 */
.g06-plaque { position:absolute; left:56px; top:384px; width:496px; min-height:100px;
  background:#fff8e6; border:4px solid #d9a441; border-radius:14px; padding:10px 16px; }
.g06-plaque-base { font-size:22px; font-weight:800; color:var(--ink); line-height:1.2; }
.g06-tag { font-size:22px; font-weight:800; color:#8a5a12; margin-top:7px; line-height:1.2;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  animation: g06-slide .35s ease; }
.g06-tag.g06-gray { color:#8d8aa0; }
@keyframes g06-slide { from { transform: translateX(-26px); opacity:0 } to { transform:none; opacity:1 } }

.g06-grimy-row { position:absolute; left:16px; top:512px; width:540px; height:208px;
  display:flex; align-items:flex-end; gap:8px; }
.g06-grimy { height:156px; flex:none; }
.g06-bubble { flex:1; background:#fff; border:4px solid var(--ink); border-radius:18px;
  padding:12px 16px; font-size:22px; font-weight:700; line-height:1.4; margin-bottom:16px; }

.g06-right { position:absolute; left:560px; top:70px; width:720px; height:730px; }
.g06-shelf-title { position:absolute; left:14px; top:8px; font-size:24px; font-weight:800;
  background:rgba(255,255,255,.92); padding:6px 20px; border-radius:999px; box-shadow:var(--shadow); }
.g06-grid { position:absolute; left:14px; top:58px; width:686px;
  display:flex; flex-wrap:wrap; gap:16px; }
.g06-ocard { font-family:var(--font); width:218px; height:218px; border:none; border-radius:16px;
  background:#fffdf5; box-shadow:var(--shadow); padding:8px; cursor:pointer; display:block;
  position:relative; text-align:center; transition: transform .1s ease; }
.g06-ocard:active { transform: translateY(4px); }
.g06-mini { position:relative; width:100%; height:108px; border:6px solid #d9a441;
  border-radius:8px; overflow:hidden; }
.g06-oname { font-size:22px; font-weight:800; color:var(--ink); margin-top:6px; line-height:1.25; }
.g06-oartist { font-size:22px; font-weight:700; color:var(--ink-soft); line-height:1.2; }
.g06-ocard.g06-found { background:#fff6d6; box-shadow:0 0 0 6px var(--yellow), var(--shadow); }
.g06-ocard.g06-found::after { content:'✔'; position:absolute; right:10px; top:6px;
  font-size:30px; color:var(--green); }
.g06-ocard.g06-shake { animation: g06-shake .3s ease; }
@keyframes g06-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-10px)}
  50%{transform:translateX(10px)} 75%{transform:translateX(-6px)} }
.g06-ocard.g06-reveal { box-shadow:0 0 0 6px #9d97b8, var(--shadow); animation: g06-blink .45s ease 3; }
@keyframes g06-blink { 0%,100%{ filter:none } 50%{ filter:brightness(1.35) } }

.g06-count { position:absolute; left:14px; top:524px; font-size:24px; font-weight:800;
  background:rgba(255,255,255,.92); padding:8px 20px; border-radius:999px; box-shadow:var(--shadow); }
.g06-hint { position:absolute; left:14px; top:582px; width:686px; font-size:22px;
  font-weight:700; color:var(--ink-soft); line-height:1.5; }

.g06-ghost { position:absolute; z-index:80; pointer-events:none; border:6px solid #d9a441;
  border-radius:8px; overflow:hidden; transition: transform .5s ease-in, opacity .5s ease-in; }

.g06-choice-card { width:840px; text-align:left; }
.g06-choice-head { display:flex; align-items:center; gap:14px; margin-bottom:12px; }
.g06-choice-head img { height:100px; flex:none; }
.g06-choice-q { font-size:27px; font-weight:800; line-height:1.35; }
.g06-note { font-size:22px; font-weight:700; color:#2b8a66; background:#e6faf1;
  border-radius:14px; padding:10px 16px; margin-bottom:12px; }
.g06-choice-btns { display:flex; flex-direction:column; gap:12px; }
.g06-choice-btn { width:100%; min-height:76px; font-size:23px; padding:14px 22px;
  text-align:left; line-height:1.35; }
.g06-choice-btn.g06-pick-good { background:var(--green); box-shadow:0 6px 0 #33a544; }
.g06-choice-btn.g06-pick-bad { background:var(--red); box-shadow:0 6px 0 #d94f4f; }
.g06-choice-btn.g06-mark { box-shadow:0 0 0 6px var(--green), 0 6px 0 var(--purple-dark); }
.g06-cheer { font-size:42px; text-align:center; margin-top:14px; }
.g06-feedback { font-size:23px; font-weight:700; line-height:1.5; text-align:center;
  margin-top:8px; color:var(--ink); }
.g06-next-row { text-align:center; margin-top:16px; }

.g06-expo { position:absolute; left:0; right:0; top:70px; bottom:0; z-index:40;
  display:flex; align-items:flex-start; justify-content:center; gap:20px; padding-top:60px;
  animation: pop-in .45s ease; }
.g06-expo-item { width:290px; background:#fffdf5; border-radius:16px;
  box-shadow:var(--shadow); padding:10px; }
.g06-expo-frame { position:relative; width:100%; height:180px; border:10px solid #d9a441;
  border-radius:8px; overflow:hidden; }
.g06-expo-title { font-size:22px; font-weight:800; margin-top:8px; }
.g06-expo-tag { font-size:22px; font-weight:800; color:#8a5a12; margin-top:4px; }
.g06-expo-speech { position:absolute; left:50%; bottom:40px; transform:translateX(-50%);
  width:820px; text-align:center; background:#fff; border:4px solid var(--ink);
  border-radius:18px; padding:16px 24px; font-size:24px; font-weight:800; z-index:41; }
`;

function findOrigin(id: string): Origin {
  const o = ORIGINS.find((x) => x.id === id);
  if (!o) throw new Error(`unknown origin: ${id}`);
  return o;
}

export const game06: MiniGame = {
  lessonId: 6,
  mount(container: HTMLElement, ctx: GameCtx) {
    const style = el('style');
    style.id = 'g06-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    const wrap = el('div', 'game-wrap g06-scene');
    container.appendChild(wrap);

    const timers: number[] = [];
    let ended = false;
    let closed = false; // finish/quit 중복 호출 방지
    let phase: 'find' | 'reveal' | 'choice' | 'done' = 'find';

    function doQuit() {
      if (closed) return;
      closed = true;
      ended = true;
      ctx.quit();
    }

    function doFinish(s: number) {
      if (closed) return;
      closed = true;
      ended = true;
      ctx.finish(s);
    }

    let roundIdx = 0;
    let foundTotal = 0; // 찾은 주인 수 (최대 8)
    let goodChoices = 0; // 바른 선택 수 (최대 4)
    let wrongTaps = 0;
    let timeLeft = TIME_LIMIT;

    // 라운드별로 찾은(또는 공개된) 원작 기록 - 엔딩 전시회에서 사용
    const roundTags: { origin: Origin; auto: boolean }[][] = ROUNDS.map(() => []);
    let foundThisRound: string[] = [];

    function score(): number {
      const raw = foundTotal * 8 + goodChoices * 9 - wrongTaps * 2;
      return Math.max(0, Math.min(100, Math.round(raw)));
    }

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quitBtn = button('🗺️', () => doQuit(), 'icon-btn');
    const nameEl = el('div', 'game-name', '🖼️ 작품 주인 찾기');
    const timerBar = el('div', 'timer-bar');
    const timerFill = el('div', 'timer-fill');
    timerBar.appendChild(timerFill);
    const scoreEl = el('div', 'game-score', '점수 0');
    topbar.append(quitBtn, nameEl, timerBar, scoreEl);
    wrap.appendChild(topbar);

    // ---------- 좌측: 그리미의 AI 그림 ----------
    const left = el('div', 'g06-left');
    const progressEl = el('div', 'g06-progress', '🖼️ 작품 1 / 4');
    const frameSlot = el('div', 'g06-frame-slot');
    let frame = el('div', 'g06-frame');
    frameSlot.appendChild(frame);
    const plaque = el('div', 'g06-plaque');
    const grimyRow = el('div', 'g06-grimy-row');
    const grimyImg = charImg('char06', 'g06-grimy', '그리미');
    const bubble = el('div', 'g06-bubble', '');
    grimyRow.append(grimyImg, bubble);
    left.append(progressEl, frameSlot, plaque, grimyRow);
    wrap.appendChild(left);

    // ---------- 우측: 원작 전시대 ----------
    const right = el('div', 'g06-right');
    const shelfTitle = el('div', 'g06-shelf-title', '🎨 원작 전시대');
    const grid = el('div', 'g06-grid');
    const countEl = el('div', 'g06-count', '🏷️ 찾은 주인 0 / 2');
    const hintEl = el(
      'div',
      'g06-hint',
      '그림의 <b>색깔</b>과 <b>그림 속 모습</b>을 잘 보면 어떤 작품을 참고했는지 알 수 있어요.'
    );
    right.append(shelfTitle, grid, countEl, hintEl);
    wrap.appendChild(right);

    function renderArt(target: HTMLElement, art: Art, scale: number) {
      target.style.background = art.bg;
      for (const m of art.motifs) {
        const s = el('span', 'g06-motif', m.e);
        s.style.left = `${m.x}%`;
        s.style.top = `${m.y}%`;
        s.style.fontSize = `${Math.round(m.s * scale)}px`;
        target.appendChild(s);
      }
    }

    // 원작 카드 6장 (위치 고정)
    const cardEls = new Map<string, HTMLButtonElement>();
    const miniEls = new Map<string, HTMLElement>();
    for (const o of ORIGINS) {
      const card = el('button', 'g06-ocard');
      const mini = el('div', 'g06-mini');
      renderArt(mini, o.art, CARD_SCALE);
      const nm = el('div', 'g06-oname', `「${o.title}」`);
      const ar = el('div', 'g06-oartist', `${o.artist} 작가`);
      card.append(mini, nm, ar);
      card.addEventListener('click', () => onCardTap(o));
      grid.appendChild(card);
      cardEls.set(o.id, card);
      miniEls.set(o.id, mini);
    }

    function updateScore() {
      scoreEl.textContent = `점수 ${score()}`;
    }

    // ---------- 명패 ----------
    function resetPlaque() {
      plaque.innerHTML = '';
      plaque.appendChild(el('div', 'g06-plaque-base', '만든 이: 그리미(AI)'));
    }

    function addTag(o: Origin, gray: boolean) {
      const t = el(
        'div',
        `g06-tag${gray ? ' g06-gray' : ''}`,
        `🏷️ 참고: ${o.artist} 작가 「${o.title}」`
      );
      plaque.appendChild(t);
    }

    // ---------- 고스트 날아가기 연출 ----------
    function flyGhost(originId: string) {
      const mini = miniEls.get(originId);
      if (!mini) return;
      const wr = wrap.getBoundingClientRect();
      const sc = wr.width / 1280 || 1;
      const from = mini.getBoundingClientRect();
      const to = frame.getBoundingClientRect();
      if (!from.width || !to.width) return;

      const ghost = mini.cloneNode(true) as HTMLElement;
      ghost.className = 'g06-ghost';
      ghost.style.left = `${(from.left - wr.left) / sc}px`;
      ghost.style.top = `${(from.top - wr.top) / sc}px`;
      ghost.style.width = `${from.width / sc}px`;
      ghost.style.height = `${from.height / sc}px`;
      wrap.appendChild(ghost);

      const dx =
        (to.left + to.width / 2 - (from.left + from.width / 2)) / sc;
      const dy = (to.top + to.height / 2 - (from.top + from.height / 2)) / sc;
      timers.push(
        window.setTimeout(() => {
          ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.35)`;
          ghost.style.opacity = '0';
        }, 20)
      );
      timers.push(window.setTimeout(() => ghost.remove(), 620));
    }

    // ---------- 찾기 페이즈 ----------
    function onCardTap(o: Origin) {
      if (ended || phase !== 'find') return;
      const card = cardEls.get(o.id);
      if (!card) return;
      // 이미 찾은 카드는 다시 셈하지 않고, 흔들리는 동안(0.3초)은 연타 중복 감점을 막는다.
      if (card.classList.contains('g06-found') || card.classList.contains('g06-shake')) return;

      const round = ROUNDS[roundIdx];
      const wr = wrap.getBoundingClientRect();
      const sc = wr.width / 1280 || 1;
      const r = card.getBoundingClientRect();
      const fx = (r.left - wr.left) / sc + r.width / sc / 2;
      const fy = (r.top - wr.top) / sc + 20;

      if (round.answers.includes(o.id)) {
        card.classList.add('g06-found');
        foundThisRound.push(o.id);
        roundTags[roundIdx].push({ origin: o, auto: false });
        foundTotal++;
        ctx.audio.good();
        floater(wrap, fx, fy, '주인을 찾았다! 🏷️', true);
        flyGhost(o.id);
        addTag(o, false);
        bubble.innerHTML = `와, ${o.artist} 작가님 작품이었구나!<br>알려 줘서 고마워.`;
        updateScore();
        countEl.textContent = `🏷️ 찾은 주인 ${foundThisRound.length} / 2`;
        if (foundThisRound.length >= round.answers.length) {
          bubble.innerHTML = '이름표를 다 달았어!<br>이제 좀 떳떳한 기분이야.';
          endFind(false);
        }
      } else {
        card.classList.add('g06-shake');
        // 흔들림이 끝나면 원래대로 돌아가 다시 탭할 수 있다(기획서: shake 0.3초 + 감점만).
        timers.push(window.setTimeout(() => card.classList.remove('g06-shake'), 320));
        wrongTaps++;
        ctx.audio.bad();
        floater(wrap, fx, fy, '참고하지 않았어 ❌', false);
        bubble.innerHTML = '음… 그 작품은 참고하지 않은 것 같아.';
        updateScore();
      }
    }

    function endFind(timeout: boolean) {
      if (ended || phase !== 'find') return;
      phase = 'reveal';
      timerBar.classList.add('g06-timer-off');

      if (timeout) {
        const round = ROUNDS[roundIdx];
        ctx.audio.pop();
        bubble.innerHTML = '시간이 다 됐네… 주인이 누구였는지 같이 볼까?';
        for (const id of round.answers) {
          if (foundThisRound.includes(id)) continue;
          const o = findOrigin(id);
          const card = cardEls.get(id);
          if (card) card.classList.add('g06-reveal');
          roundTags[roundIdx].push({ origin: o, auto: true });
          addTag(o, true);
        }
        timers.push(window.setTimeout(showChoice, 1400));
      } else {
        timers.push(window.setTimeout(showChoice, 700));
      }
    }

    // ---------- 선택 페이즈 ----------
    let overlay: HTMLElement | null = null;

    function showChoice() {
      if (ended) return;
      phase = 'choice';
      const round = ROUNDS[roundIdx];

      overlay = el('div', 'howto-overlay');
      const cardEl = el('div', 'card howto-card g06-choice-card');

      if (round.note) {
        cardEl.appendChild(el('div', 'g06-note', `🤖 에티: ${round.note}`));
      }

      const head = el('div', 'g06-choice-head');
      head.appendChild(charImg('char06', '', '그리미'));
      head.appendChild(el('div', 'g06-choice-q', `그리미: "${round.question}"`));
      cardEl.appendChild(head);

      const btnBox = el('div', 'g06-choice-btns');
      const btns: HTMLButtonElement[] = [];
      let answered = false;

      const cheer = el('div', 'g06-cheer');
      const feedback = el('div', 'g06-feedback');
      const nextRow = el('div', 'g06-next-row');

      round.choices.forEach((text, i) => {
        const b = button(
          `${['①', '②', '③'][i]} ${text}`,
          () => pick(i),
          'btn g06-choice-btn'
        );
        btns.push(b);
        btnBox.appendChild(b);
      });
      cardEl.append(btnBox, cheer, feedback, nextRow);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);

      function pick(i: number) {
        if (answered || ended) return;
        answered = true;
        const ok = i === round.answer;
        if (ok) {
          goodChoices++;
          ctx.audio.good();
          btns[i].classList.add('g06-pick-good');
          cheer.textContent = '😺🎉😊';
          feedback.innerHTML = `🤖 에티: ${round.okExplain}`;
        } else {
          ctx.audio.bad();
          btns[i].classList.add('g06-pick-bad');
          btns[round.answer].classList.add('g06-mark');
          cheer.textContent = '😢';
          feedback.innerHTML = `🤖 에티: ${round.ngExplain}`;
        }
        btns.forEach((b, idx) => {
          if (idx !== i && idx !== round.answer) b.disabled = true;
        });
        updateScore();

        const last = roundIdx >= ROUNDS.length - 1;
        nextRow.appendChild(
          button(
            last ? '전시회 열기 🎪' : '다음 그림 ▶',
            () => {
              if (ended) return;
              closeChoice();
              if (last) startEnding();
              else nextRound();
            },
            'btn big mint'
          )
        );
      }
    }

    function closeChoice() {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
    }

    // ---------- 라운드 진행 ----------
    function nextRound() {
      roundIdx++;
      frame.classList.add('g06-out');
      const oldFrame = frame;
      timers.push(window.setTimeout(() => oldFrame.remove(), 420));
      timers.push(
        window.setTimeout(() => {
          if (ended) return;
          frame = el('div', 'g06-frame');
          frameSlot.appendChild(frame);
          startRound();
        }, 400)
      );
    }

    function startRound() {
      if (ended) return;
      const round = ROUNDS[roundIdx];
      phase = 'find';
      foundThisRound = [];
      timeLeft = TIME_LIMIT;
      timerFill.style.width = '100%';
      timerFill.classList.remove('danger');
      timerBar.classList.remove('g06-timer-off');

      frame.innerHTML = '';
      frame.style.opacity = '0';
      renderArt(frame, round.art, 1);
      frame.appendChild(el('div', 'g06-frame-title', `「${round.title}」`));
      timers.push(
        window.setTimeout(() => {
          frame.style.opacity = '1';
        }, 20)
      );

      resetPlaque();
      progressEl.textContent = `🖼️ 작품 ${roundIdx + 1} / ${ROUNDS.length}`;
      countEl.textContent = `🏷️ 찾은 주인 0 / ${round.answers.length}`;
      bubble.innerHTML = round.bubble;
      for (const card of cardEls.values()) {
        card.classList.remove('g06-found', 'g06-reveal', 'g06-shake');
        card.disabled = false;
      }
    }

    // ---------- 타이머 ----------
    const tick = window.setInterval(() => {
      if (ended || phase !== 'find') return;
      timeLeft -= 0.2;
      const pct = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
      timerFill.style.width = `${pct}%`;
      timerFill.classList.toggle('danger', pct < 25);
      if (timeLeft <= 0) endFind(true);
    }, 200);
    timers.push(tick);

    // ---------- 엔딩: 전시회 ----------
    function startEnding() {
      if (ended) return;
      phase = 'done';
      clearInterval(tick);
      left.classList.add('g06-hidden');
      right.classList.add('g06-hidden');
      timerBar.classList.add('g06-timer-off');

      const expo = el('div', 'g06-expo');
      ROUNDS.forEach((r, i) => {
        const item = el('div', 'g06-expo-item');
        const f = el('div', 'g06-expo-frame');
        renderArt(f, r.art, 0.7);
        const t = el('div', 'g06-expo-title', `「${r.title}」`);
        item.append(f, t);
        item.appendChild(el('div', 'g06-expo-tag', '만든 이: 그리미(AI)'));
        const names = roundTags[i].map((x) => x.origin.artist).join(' · ');
        item.appendChild(
          el('div', 'g06-expo-tag', names ? `🏷️ 참고: ${names} 작가` : '🏷️ 참고: (못 밝힘)')
        );
        expo.appendChild(item);
      });
      const speech = el(
        'div',
        'g06-expo-speech',
        '그리미: "작가님들 모두 웃고 있어!<br>이름표를 다니까 진짜 떳떳한 전시회가 됐어!"'
      );
      expo.appendChild(speech);
      wrap.appendChild(expo);
      ctx.audio.fanfare();

      timers.push(window.setTimeout(showResult, 900));
    }

    function showResult() {
      if (ended) return;
      ended = true;
      const s = score();
      const over = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>전시회 오픈! 🎪</h2>
        <div class="howto-icons">${s >= 70 ? '🖼️✨' : '🖼️💦'}</div>
        <div class="howto-desc">
          주인 찾기: <b>${foundTotal} / 8</b><br>
          바른 선택: <b>${goodChoices} / 4</b><br><br>
          출처를 밝히니 모두가 기뻐하는 전시회가 됐어요!
        </div>`;
      const done = button('결과 보기 🏆', () => doFinish(s), 'btn big yellow');
      cardEl.appendChild(done);
      over.appendChild(cardEl);
      wrap.appendChild(over);
      ctx.audio.star();
    }

    // ---------- 시작 ----------
    resetPlaque();
    updateScore();
    startRound();

    return () => {
      ended = true;
      phase = 'done';
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      clearInterval(tick);
      closeChoice();
      style.remove();
      wrap.remove();
    };
  }
};
