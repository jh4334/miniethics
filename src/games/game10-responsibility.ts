// 10차시: 자율주행 법정 (AI의 실수, 책임은 누구에게?)
// 플레이어는 판사가 되어 자율주행차 로봇 '부릉이'의 사고 3건을 재판한다.
// 사건 재생(A) → 증거 조사(B) → 책임 조각 나누기(C) → 판결 결과(D)를 반복하며,
// AI 피고석에는 책임 조각이 붙지 않고 미끄러지는 연출로
// 'AI는 스스로 책임질 수 없다 → 사람이 나눠 책임진다'를 손끝으로 체험한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

// ============================================================
// 데이터
// ============================================================

interface Actor {
  emoji: string;
  x: number;
  y: number;
  size?: number;
  /** 이동 목표 x (있으면 transition으로 이동) */
  tx?: number;
  /** 이동 시간(ms) */
  dur?: number;
  /** 등장 시각(ms). 없으면 처음부터 보임 */
  at?: number;
  sound?: 'bad' | 'pop';
}

interface Evidence {
  icon: string;
  title: string;
  desc: string;
}

interface Defendant {
  key: string;
  icon: string;
  name: string;
  sub: string;
  /** 대법관 의견(적정 범위) */
  min: number;
  max: number;
  reason: string;
  /** AI 피고(조각 배치 불가) */
  ai?: boolean;
}

interface CaseData {
  title: string;
  desc: string;
  actors: Actor[];
  evidence: Evidence[];
  defendants: Defendant[];
}

const PIECES = 6;

const CASES: CaseData[] = [
  {
    title: '노란 신호 사건',
    desc: '부릉이가 교차로에서 노란 신호를 초록 신호로 착각! 끼익—! 자전거와 부딪힐 뻔했어요. (자전거 바퀴 파손, 다친 사람은 없음)',
    actors: [
      { emoji: '🚦', x: 400, y: 0, size: 76 },
      { emoji: '🚗', x: -150, y: 118, size: 88, tx: 330, dur: 1700 },
      { emoji: '🚲', x: 900, y: 126, size: 76, tx: 520, dur: 1700 },
      { emoji: '💥', x: 428, y: 96, size: 84, at: 1750, sound: 'bad' },
      { emoji: '😱', x: 588, y: 34, size: 62, at: 1950 }
    ],
    evidence: [
      {
        icon: '📷',
        title: '블랙박스 기록',
        desc: '부릉이의 눈(카메라)이 노란 신호를 초록 신호로 잘못 읽었어요.'
      },
      {
        icon: '🏭',
        title: '로보카 회사 회의록',
        desc: "회사는 '노란 신호를 가끔 잘못 본다'는 오류를 3달 전에 알고도 업데이트를 미뤘어요."
      },
      {
        icon: '😴',
        title: '차 안 카메라',
        desc: "차 주인 한들 아저씨는 '위험하면 핸들을 잡으세요' 규칙을 알면서도 푹 잠들어 있었어요."
      }
    ],
    defendants: [
      {
        key: 'company',
        icon: '🏭',
        name: '만든 회사',
        sub: '로보카',
        min: 3,
        max: 4,
        reason: '오류를 알고도 고치지 않았으니 가장 큰 책임이에요.'
      },
      {
        key: 'owner',
        icon: '🧑',
        name: '차 주인',
        sub: '한들 아저씨',
        min: 2,
        max: 3,
        reason: '규칙을 어기고 잠들었으니 책임이 있어요.'
      },
      {
        key: 'ai',
        icon: '🚗',
        name: 'AI 부릉이',
        sub: '자율주행차',
        min: 0,
        max: 0,
        ai: true,
        reason: '부릉이는 책임을 질 수 없어요. 대신 회사가 부릉이를 고쳐야 해요.'
      }
    ]
  },
  {
    title: '진흙 센서 사건',
    desc: '비 오는 날, 부릉이가 정지 표지판을 그냥 지나쳤어요! 알고 보니 카메라에 진흙이 잔뜩 묻어 있었어요.',
    actors: [
      { emoji: '🌧️', x: 120, y: -4, size: 58 },
      { emoji: '🌧️', x: 470, y: 6, size: 58 },
      { emoji: '🌧️', x: 760, y: -4, size: 58 },
      { emoji: '🛑', x: 596, y: 104, size: 78 },
      { emoji: '🚗', x: -150, y: 118, size: 88, tx: 780, dur: 2000 },
      { emoji: '💨', x: 660, y: 150, size: 58, at: 1500, sound: 'bad' },
      { emoji: '🟤', x: 828, y: 58, size: 58, at: 2100 }
    ],
    evidence: [
      {
        icon: '⚠️',
        title: '계기판 기록',
        desc: "'센서를 닦아 주세요' 경고가 30일 동안 켜져 있었어요."
      },
      {
        icon: '📱',
        title: '회사 문자 기록',
        desc: "로보카 회사는 '센서를 꼭 닦아 주세요' 안내 문자를 세 번이나 보냈어요."
      },
      {
        icon: '🧽',
        title: '세차 기록',
        desc: "한들 아저씨는 한 달 동안 한 번도 센서를 닦지 않았어요. '귀찮아서…'"
      }
    ],
    defendants: [
      {
        key: 'company',
        icon: '🏭',
        name: '만든 회사',
        sub: '로보카',
        min: 0,
        max: 2,
        reason: '경고와 문자로 할 일을 했어요. 하지만 더 안전한 장치를 고민할 책임은 남아 있어요.'
      },
      {
        key: 'owner',
        icon: '🧑',
        name: '차 주인',
        sub: '한들 아저씨',
        min: 4,
        max: 6,
        reason: '경고를 한 달이나 무시했으니 이번엔 주인 책임이 가장 커요.'
      },
      {
        key: 'ai',
        icon: '🚗',
        name: 'AI 부릉이',
        sub: '자율주행차',
        min: 0,
        max: 0,
        ai: true,
        reason: '부릉이는 진흙을 스스로 닦을 수 없어요. 관리해 줄 사람이 필요해요.'
      }
    ]
  },
  {
    title: '낡은 지도 사건',
    desc: '부릉이가 지도만 믿고 달리다 공사장 앞까지! 한들 아저씨가 재빨리 핸들을 잡아 겨우 멈췄어요.',
    actors: [
      { emoji: '🗺️', x: 60, y: 6, size: 70 },
      { emoji: '🚧', x: 690, y: 108, size: 80 },
      { emoji: '🚗', x: -150, y: 118, size: 88, tx: 470, dur: 1800 },
      { emoji: '🧑', x: 330, y: 24, size: 62, at: 1400, sound: 'pop' },
      { emoji: '💨', x: 566, y: 148, size: 58, at: 1900 }
    ],
    evidence: [
      {
        icon: '🗺️',
        title: '지도 기록',
        desc: '도로관리소는 2주 전에 시작한 공사를 지도 회사에 알리지 않았어요.'
      },
      {
        icon: '🏭',
        title: '설계 문서',
        desc: "로보카 회사는 '지도가 오래되면 속도를 줄이는' 안전장치를 만들어 두지 않았어요."
      },
      {
        icon: '📷',
        title: '블랙박스',
        desc: '한들 아저씨는 규칙대로 앞을 보고 있다가 바로 핸들을 잡아 사고를 막았어요.'
      }
    ],
    defendants: [
      {
        key: 'road',
        icon: '🚧',
        name: '도로관리소',
        sub: '공사 담당',
        min: 3,
        max: 4,
        reason: '공사 소식을 알리지 않았으니 가장 큰 책임이에요.'
      },
      {
        key: 'company',
        icon: '🏭',
        name: '만든 회사',
        sub: '로보카',
        min: 2,
        max: 3,
        reason: '만약을 대비한 안전장치를 만들지 않은 책임이 있어요.'
      },
      {
        key: 'owner',
        icon: '🧑',
        name: '차 주인',
        sub: '한들 아저씨',
        min: 0,
        max: 0,
        reason: '규칙을 잘 지키고 사고까지 막았어요. 책임 없음, 오히려 칭찬!'
      },
      {
        key: 'ai',
        icon: '🚗',
        name: 'AI 부릉이',
        sub: '자율주행차',
        min: 0,
        max: 0,
        ai: true,
        reason: '부릉이는 낡은 지도를 받았을 뿐이에요. 좋은 데이터를 줄 책임은 사람에게 있어요.'
      }
    ]
  }
];

const AI_LINES = [
  "어…? 조각이 자꾸 미끄러져. 나는 책임을 '받을' 수가 없나 봐…",
  '미안한 마음을 갖고 싶은데, 나에겐 마음이 없어…',
  '벌금을 내고 싶어도 내 통장은 없는걸…'
];

const SAY = {
  a: '그날 일을 보여 줄게… 지금도 아찔해.',
  b: '증거를 꼼꼼히 봐 줘. 나도 진실이 알고 싶어.',
  c: '책임 조각을 공정하게 나눠 줘, 판사님!',
  dOk: '고마워! 이제 누가 뭘 고쳐야 할지 알겠어!',
  dNo: '음… 대법관 의견과 조금 달랐네. 다음 사건도 부탁해!'
};

// ============================================================
// 스타일 (g10- 접두사, cleanup에서 제거)
// ============================================================

const CSS = `
.g10-scene { background:
  linear-gradient(180deg, rgba(255,255,255,.45), rgba(255,255,255,.15)),
  linear-gradient(180deg,#ffe4ec 0%,#fff2e0 55%,#fffaf0 100%);
  background-size: cover; }

/* 좌측 피고인석: 부릉이 */
.g10-dock { position:absolute; left:14px; top:78px; width:292px; text-align:center; z-index:14; }
.g10-say { background:#fff; border-radius:20px; padding:14px 16px; font-size:22px; font-weight:700;
  line-height:1.45; color:var(--ink); box-shadow:var(--shadow); position:relative; min-height:112px;
  display:flex; align-items:center; justify-content:center; }
.g10-say::after { content:''; position:absolute; left:50%; bottom:-15px; margin-left:-11px;
  border:11px solid transparent; border-top-color:#fff; }
.g10-body { margin-top:26px; }
.g10-body img { width:180px; filter:drop-shadow(0 8px 0 rgba(58,51,82,.14)); }
.g10-body.shake { animation:g10-shake .5s ease; }
@keyframes g10-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px) rotate(-4deg)}
  50%{transform:translateX(10px) rotate(4deg)} 80%{transform:translateX(-6px)} }
.g10-dock-name { margin-top:2px; font-size:22px; font-weight:800; color:var(--ink-soft); }
.g10-dock-tag { display:inline-block; margin-top:6px; font-size:19px; font-weight:800; color:#fff;
  background:var(--purple); border-radius:999px; padding:4px 14px; }

/* 무대 */
.g10-stage { position:absolute; left:318px; top:78px; right:14px; bottom:14px; }
.g10-title { font-size:30px; font-weight:800; text-align:center; margin-bottom:10px; }
.g10-title small { display:block; font-size:21px; color:var(--ink-soft); }
.g10-panel { background:var(--paper); border-radius:22px; box-shadow:var(--shadow); padding:14px 16px; }

/* A: 사건 재생 */
.g10-play { position:relative; height:236px; overflow:hidden; border-radius:18px;
  background:linear-gradient(180deg,#e8f4ff 0%,#f7fbff 62%,#efe7dd 62%,#e3d9cc 100%); }
.g10-actor { position:absolute; line-height:1; transition:opacity .25s ease; }
.g10-actor.g10-in { animation:g10-pop .35s ease; }
@keyframes g10-pop { from{transform:scale(.4)} 60%{transform:scale(1.2)} to{transform:scale(1)} }
.g10-road { position:absolute; left:0; right:0; top:172px; height:8px; background:#fff;
  opacity:.85; background-image:repeating-linear-gradient(90deg,#fff 0 46px, transparent 46px 92px); }
.g10-desc { margin-top:14px; font-size:24px; line-height:1.55; font-weight:700; color:var(--ink);
  background:#fff; border-radius:16px; padding:14px 16px; min-height:96px; }
.g10-center { text-align:center; margin-top:16px; }
.g10-center .btn { min-height:76px; font-size:28px; }

/* B: 증거 조사 */
.g10-evrow { display:flex; gap:18px; justify-content:center; }
.g10-ev { width:290px; height:380px; perspective:900px; cursor:pointer; }
.g10-ev-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d;
  transition:transform .5s ease; }
.g10-ev.flip .g10-ev-inner { transform:rotateY(180deg); }
.g10-face { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden;
  border-radius:22px; box-shadow:var(--shadow); display:flex; flex-direction:column;
  align-items:center; justify-content:center; padding:16px; text-align:center; }
.g10-face.front { background:linear-gradient(160deg,#8a7ad6,#b6a9e8); color:#fff; }
.g10-face.front .g10-q { font-size:74px; }
.g10-face.front .g10-n { font-size:26px; font-weight:800; margin-top:10px; }
.g10-face.back { background:#fff; transform:rotateY(180deg); border:5px solid var(--yellow); }
.g10-face.back .g10-ico { font-size:64px; }
.g10-face.back .g10-t { font-size:25px; font-weight:800; margin:8px 0 8px; }
.g10-face.back .g10-d { font-size:21px; line-height:1.5; color:var(--ink-soft); font-weight:700; }
.g10-face.back .g10-more { margin-top:10px; font-size:18px; font-weight:800; color:var(--purple); }
.g10-ev:active .g10-ev-inner { filter:brightness(.96); }
.g10-gate { margin-top:18px; text-align:center; }
.g10-gate .btn { min-height:76px; font-size:28px; }
.g10-off { background:#cfc9de; color:#fff; box-shadow:0 6px 0 #b3abc7; }
.g10-hint { margin-top:10px; font-size:21px; font-weight:800; color:var(--ink-soft); }

/* 확대 모달 */
.g10-modal { position:absolute; inset:0; background:rgba(44,37,71,.55); z-index:60;
  display:flex; align-items:center; justify-content:center; }
.g10-modal-card { width:660px; background:#fff; border-radius:26px; padding:26px; text-align:center;
  box-shadow:var(--shadow); animation:g10-zoom .25s ease; }
@keyframes g10-zoom { from{transform:scale(.85);opacity:0} to{transform:scale(1);opacity:1} }
.g10-modal-card .g10-ico { font-size:82px; }
.g10-modal-card .g10-t { font-size:32px; font-weight:800; margin:8px 0 10px; }
.g10-modal-card .g10-d { font-size:25px; line-height:1.6; color:var(--ink-soft); font-weight:700;
  margin-bottom:18px; }

/* C: 책임 나누기 */
.g10-defrow { display:flex; gap:14px; justify-content:center; }
.g10-def { flex:1; background:#fff; border-radius:20px; box-shadow:var(--shadow); padding:12px 8px 10px;
  text-align:center; cursor:pointer; border:5px solid transparent;
  transition:transform .1s ease, border-color .2s ease; }
.g10-def:active { transform:translateY(4px); }
.g10-def.hot { border-color:var(--yellow); }
.g10-def.ai { background:#f3f0ff; border-color:#ded6ff; cursor:pointer; }
.g10-def-ico { font-size:60px; line-height:1.1; height:76px; display:flex; align-items:center;
  justify-content:center; }
.g10-def-ico img { width:76px; }
.g10-def-name { font-size:24px; font-weight:800; }
.g10-def-sub { font-size:18px; font-weight:800; color:var(--ink-soft); margin-bottom:6px; }
.g10-slots { min-height:92px; border-radius:14px; background:#f6f3ff; padding:6px 4px;
  display:flex; flex-wrap:wrap; gap:4px; align-items:center; justify-content:center; }
.g10-slots.on { background:#fff3c4; }
.g10-chip { font-size:32px; line-height:1; animation:g10-pop .3s ease; }
.g10-slots-hint { font-size:17px; font-weight:800; color:var(--ink-soft); }
.g10-tray { margin-top:14px; background:var(--paper); border-radius:20px; box-shadow:var(--shadow);
  padding:10px 14px; display:flex; align-items:center; gap:12px; justify-content:center;
  min-height:96px; }
.g10-tray-label { font-size:21px; font-weight:800; color:var(--ink-soft); }
.g10-token { width:64px; height:64px; border-radius:16px; background:var(--yellow);
  border:4px solid #d9b21a; display:flex; align-items:center; justify-content:center; font-size:32px; }
.g10-token.empty { background:rgba(58,51,82,.06); border-color:rgba(58,51,82,.12); opacity:.5; }
.g10-fly { position:absolute; z-index:80; font-size:40px; width:64px; height:64px; border-radius:16px;
  background:var(--yellow); border:4px solid #d9b21a; display:flex; align-items:center;
  justify-content:center; transform:translate(-50%,-50%);
  transition:left .34s cubic-bezier(.3,.8,.4,1), top .34s cubic-bezier(.3,.8,.4,1); }
.g10-fly.slip { animation:g10-slip .9s ease forwards; }
@keyframes g10-slip {
  0%   { transform:translate(-50%,-50%) rotate(0deg); }
  14%  { transform:translate(-52%,-54%) rotate(-14deg); }
  28%  { transform:translate(-48%,-54%) rotate(14deg); }
  42%  { transform:translate(-52%,-52%) rotate(-12deg); }
  56%  { transform:translate(-48%,-48%) rotate(10deg); }
  100% { transform:translate(-10%,120%) rotate(150deg); opacity:0; }
}

/* D: 판결 결과 */
.g10-gavel { position:absolute; left:50%; top:40px; margin-left:-60px; font-size:110px; z-index:70;
  animation:g10-bang .7s ease forwards; pointer-events:none; }
@keyframes g10-bang { 0%{transform:translateY(-260px) rotate(-40deg); opacity:0}
  55%{transform:translateY(0) rotate(10deg); opacity:1}
  70%{transform:translateY(-30px) rotate(-6deg)}
  100%{transform:translateY(0) rotate(0); opacity:0} }
.g10-vrow { display:flex; align-items:center; gap:12px; background:#fff; border-radius:16px;
  padding:9px 14px; margin-bottom:9px; box-shadow:var(--shadow); }
.g10-vico { font-size:38px; width:46px; text-align:center; }
.g10-vico img { width:46px; vertical-align:middle; }
.g10-vname { flex:1; text-align:left; }
.g10-vname b { font-size:23px; }
.g10-vreason { font-size:18px; font-weight:700; color:var(--ink-soft); line-height:1.35; }
.g10-vnum { font-size:21px; font-weight:800; text-align:center; min-width:104px;
  background:#f6f3ff; border-radius:12px; padding:6px 8px; }
.g10-vnum span { display:block; font-size:16px; color:var(--ink-soft); }
.g10-vmark { font-size:26px; width:70px; text-align:center; white-space:nowrap; }
.g10-casescore { text-align:center; font-size:34px; font-weight:800; color:var(--purple);
  margin:6px 0 2px; }
.g10-over-lines { font-size:23px; line-height:1.65; color:var(--ink-soft); margin-bottom:12px; }
.g10-over-score { font-size:62px; font-weight:800; color:var(--purple); }
.g10-over-say { font-size:22px; font-weight:800; margin:10px 0 18px; line-height:1.5; }

/* 안내 팝업 */
.g10-tip { position:absolute; inset:0; background:rgba(44,37,71,.55); z-index:65;
  display:flex; align-items:center; justify-content:center; }
.g10-tip-card { width:720px; background:#fff; border-radius:26px; padding:26px 28px; text-align:center;
  box-shadow:var(--shadow); animation:g10-zoom .25s ease; }
.g10-tip-card img { width:120px; }
.g10-tip-card .g10-tip-text { font-size:25px; line-height:1.6; font-weight:700; color:var(--ink);
  margin:10px 0 18px; }
`;

// ============================================================
// 게임
// ============================================================

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
    const nameEl = el('div', 'game-name', '🚗 자율주행 법정');
    const spacer = el('div', 'spacer');
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
          later(() => {
            d.style.opacity = '1';
            d.classList.add('g10-in');
            if (a.sound === 'bad') ctx.audio.bad();
            if (a.sound === 'pop') ctx.audio.pop();
          }, a.at);
        }
        if (a.tx !== undefined) {
          later(() => {
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

      /** 트레이 → 피고 카드로 조각 날리기 */
      function fly(toEl: HTMLElement, slip: boolean, onLand: () => void) {
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
            later(() => t.remove(), 950);
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
        fly(slotEls['ai'], true, () => {
          ctx.audio.bad();
          shake();
          say(AI_LINES[aiTryCount % AI_LINES.length]);
          aiTryCount++;
          card.classList.remove('hot');
          floater(wrap, centerOf(card).x, centerOf(card).y + 60, '미끄러졌어! 🚫', false);
          busy = false;
          renderTray();
          if (!tipShown) {
            tipShown = true;
            later(showTip, 700);
          }
        });
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
