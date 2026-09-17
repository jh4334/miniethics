// ============================================
// AI 윤리 미니게임 천국 - 앱 본체 (화면 전환/차시 흐름)
// 흐름: 타이틀 → 스테이지맵 → 개념 카드 → 미니게임 → 결과 → 성찰 퀴즈 → 배지
// ============================================
import { LESSONS } from './data/lessons.js';
import * as S from './state.js';
import { sfx } from './audio.js';

import g01 from './games/g01_classify.js';
import g02 from './games/g02_training.js';
import g03 from './games/g03_bias.js';
import g04 from './games/g04_bubble.js';
import g05 from './games/g05_privacy.js';
import g06 from './games/g06_deepfake.js';
import g07 from './games/g07_copyright.js';
import g08 from './games/g08_prompt.js';
import g09 from './games/g09_think.js';
import g10 from './games/g10_inclusive.js';
import g11 from './games/g11_driving.js';
import g12 from './games/g12_goldenbell.js';

const GAMES = { 1: g01, 2: g02, 3: g03, 4: g04, 5: g05, 6: g06, 7: g07, 8: g08, 9: g09, 10: g10, 11: g11, 12: g12 };

const app = document.getElementById('app');
let cleanupGame = null;
let currentGameId = null;
let fromPop = false; // popstate로 인한 화면 전환이면 history를 쌓지 않음

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const starStr = (n) => '⭐'.repeat(n) + '☆'.repeat(3 - n);
const lessonOf = (id) => LESSONS.find((l) => l.id === id);

// 화면 렌더링. nav = { screen, id } 로 뒤로가기 히스토리에 기록
function render(html, nav) {
  cleanupGame?.();
  cleanupGame = null;
  currentGameId = null;
  app.innerHTML = html;
  // 화면 전환 직후 같은 자리에 온 버튼이 더블탭의 두 번째 탭을 받지 않도록 잠깐 입력 차단
  app.style.pointerEvents = 'none';
  setTimeout(() => { app.style.pointerEvents = ''; }, 350);
  if (nav) {
    if (fromPop) fromPop = false;
    else history.pushState(nav, '');
  }
}

// 안드로이드 뒤로가기(버튼/제스처)가 앱 밖으로 나가지 않도록 화면 단위로 라우팅
window.addEventListener('popstate', (e) => {
  const s = e.state || { screen: 'title' };
  fromPop = true;
  if (s.screen === 'title') showTitle();
  else if (s.screen === 'map') showMap();
  else if (s.screen === 'concepts') showConcepts(s.id);
  else { history.replaceState({ screen: 'map' }, ''); showMap(); } // 게임/퀴즈 등 진행 화면은 지도로
});

// 홈 버튼/알림 등으로 앱을 벗어나면 진행 중인 게임을 안전하게 중단
document.addEventListener('visibilitychange', () => {
  if (document.hidden && cleanupGame && currentGameId) showInterrupted(currentGameId);
});

// ---------- 타이틀 ----------
function showTitle() {
  const cleared = S.clearedCount();
  render(`
    <div class="screen title-screen">
      <div class="title-logo" id="title-logo">🤖</div>
      <h1 class="title-name">AI 윤리<br>미니게임 천국</h1>
      <div class="title-sub">12개의 미니게임으로 배우는 인공지능 윤리!</div>
      <div class="title-badges">
        ${LESSONS.map((l) => `<span class="${S.getLesson(l.id).cleared ? '' : 'locked'}" title="${l.badgeName}">${l.badge}</span>`).join('')}
      </div>
      <button class="btn btn-big btn-primary" id="start-btn">${cleared > 0 ? '이어서 하기 ▶' : '시작하기 ▶'}</button>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-ghost" id="sound-btn">${S.getState().sound ? '🔊 소리 켬' : '🔇 소리 끔'}</button>
        <button class="btn btn-ghost" id="reset-btn">🗑️ 처음부터</button>
      </div>
    </div>
  `, { screen: 'title' });
  document.getElementById('start-btn').addEventListener('click', () => { sfx.tap(); showMap(); });
  document.getElementById('sound-btn').addEventListener('click', (e) => {
    const on = S.toggleSound();
    e.target.textContent = on ? '🔊 소리 켬' : '🔇 소리 끔';
    sfx.tap();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('정말 모든 진행 상황을 지우고 처음부터 시작할까요?')) {
      S.resetAll();
      showTitle();
    }
  });
  // 교사용 숨은 메뉴: 로고를 5번 연속 탭하면 원하는 차시까지 열 수 있음
  let taps = 0, tapTimer = null;
  document.getElementById('title-logo').addEventListener('click', () => {
    taps++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { taps = 0; }, 2500);
    if (taps >= 5) {
      taps = 0;
      const n = parseInt(prompt('👩‍🏫 교사용 메뉴\n몇 차시까지 열까요? (1~12)'), 10);
      if (n >= 1 && n <= 12) { S.unlockThrough(n); sfx.badge(); showMap(); }
    }
  });
}

// ---------- 스테이지 맵 ----------
function showMap() {
  const unlocked = S.unlockedUpTo();
  const cleared = S.clearedCount();
  render(`
    <div class="screen">
      <div class="topbar">
        <button class="btn btn-ghost" id="back-btn">🏠</button>
        <div class="title">🗺️ 배움 지도</div>
        <div class="topbar-right"><div class="btn btn-ghost" style="pointer-events:none;">⭐ ${S.totalStars()}</div></div>
      </div>
      <div class="map-progress">
        <span>진행도</span>
        <div class="bar"><div style="width:${(cleared / 12) * 100}%"></div></div>
        <b>${cleared}/12</b>
      </div>
      <div class="map-grid">
        ${LESSONS.map((l) => {
          const st = S.getLesson(l.id);
          const locked = l.id > unlocked;
          return `
            <button class="stage-card ${locked ? 'locked' : ''}" data-id="${l.id}" ${locked ? 'disabled' : ''}>
              ${locked ? '<span class="lock-icon">🔒</span>' : st.cleared ? '<span class="clear-ribbon">CLEAR</span>' : ''}
              <span class="stage-num">${l.id}차시 · ${l.topic}</span>
              <span class="stage-emoji">${l.emoji}</span>
              <span class="stage-name">${l.gameName}</span>
              <span class="stage-stars">${locked ? '' : st.stars ? starStr(st.stars) : '☆☆☆'}</span>
            </button>`;
        }).join('')}
      </div>
      ${cleared >= 12 ? `<div style="text-align:center;padding-bottom:24px;">
        <button class="btn btn-primary" id="cert-btn">🎓 수료증 보기</button></div>` : ''}
    </div>
  `, { screen: 'map' });
  document.getElementById('back-btn').addEventListener('click', () => { sfx.tap(); showTitle(); });
  document.getElementById('cert-btn')?.addEventListener('click', () => { sfx.tap(); showCertificate(); });
  app.querySelectorAll('.stage-card:not(.locked)').forEach((card) => {
    card.addEventListener('click', () => { sfx.tap(); showConcepts(Number(card.dataset.id)); });
  });
}

// ---------- 개념 카드 ----------
function showConcepts(id) {
  const lesson = lessonOf(id);
  let idx = 0;
  render(`
    <div class="screen">
      <div class="topbar">
        <button class="btn btn-ghost" id="back-btn">🗺️</button>
        <div class="title">${lesson.emoji} ${lesson.id}차시. ${lesson.topic}</div>
        <div class="topbar-right"></div>
      </div>
      <div class="concept-wrap">
        <div class="concept-card" id="ccard"></div>
        <div class="concept-dots" id="cdots"></div>
        <div class="concept-nav">
          <button class="btn btn-ghost" id="prev-btn">◀ 이전</button>
          <button class="btn btn-primary" id="next-btn">다음 ▶</button>
        </div>
      </div>
    </div>
  `, { screen: 'concepts', id });
  const ccard = document.getElementById('ccard');
  const cdots = document.getElementById('cdots');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  function renderCard() {
    const c = lesson.concepts[idx];
    const last = idx === lesson.concepts.length - 1;
    ccard.style.animation = 'none';
    void ccard.offsetWidth;
    ccard.style.animation = 'pop-in 0.3s ease';
    ccard.innerHTML = `
      <div class="c-emoji">${c.emoji}</div>
      <div class="c-title">${c.title}</div>
      <div class="c-text">${c.text}</div>
      ${last ? `<div class="c-howto"><b>🎮 게임 방법</b><br>${lesson.howto}</div>` : ''}
    `;
    cdots.innerHTML = lesson.concepts.map((_, i) => `<span class="${i === idx ? 'on' : ''}"></span>`).join('');
    prevBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = last ? `🎮 ${lesson.gameName} 시작!` : '다음 ▶';
    nextBtn.className = last ? 'btn btn-green' : 'btn btn-primary';
  }
  renderCard();
  document.getElementById('back-btn').addEventListener('click', () => { sfx.tap(); showMap(); });
  prevBtn.addEventListener('click', () => { sfx.tap(); if (idx > 0) { idx--; renderCard(); } });
  nextBtn.addEventListener('click', () => {
    sfx.tap();
    if (idx < lesson.concepts.length - 1) { idx++; renderCard(); }
    else showGame(id);
  });
}

// ---------- 미니게임 ----------
function showGame(id) {
  const lesson = lessonOf(id);
  render(`
    <div class="screen">
      <div class="topbar">
        <button class="btn btn-ghost" id="back-btn">✖</button>
        <div class="title">${lesson.emoji} ${lesson.gameName}</div>
        <div class="topbar-right"></div>
      </div>
      <div class="game-stage" id="stage"></div>
    </div>
  `, { screen: 'game', id });
  document.getElementById('back-btn').addEventListener('click', () => { sfx.tap(); showMap(); });
  const stage = document.getElementById('stage');
  const game = GAMES[id];
  let finished = false;
  cleanupGame = game.mount(stage, {
    finish(result) {
      if (finished) return; // 이중 호출 방지
      finished = true;
      cleanupGame?.();
      cleanupGame = null;
      currentGameId = null;
      showResult(id, result);
    },
  });
  currentGameId = id;
}

// ---------- 게임 중단 (앱 전환 등) ----------
function showInterrupted(id) {
  const lesson = lessonOf(id);
  render(`
    <div class="screen">
      <div class="interrupt-wrap">
        <div style="font-size:72px;">😴</div>
        <div style="font-family:var(--font-title);font-size:26px;">게임이 잠시 멈췄어요</div>
        <div style="color:var(--ink-soft);line-height:1.6;">앱을 벗어나서 ${lesson.gameName} 게임을 중단했어요.<br>준비되면 다시 도전해요!</div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-ghost" id="map-btn">🗺️ 배움 지도</button>
          <button class="btn btn-green" id="retry-btn">🔄 다시 도전</button>
        </div>
      </div>
    </div>
  `, { screen: 'interrupted', id });
  document.getElementById('map-btn').addEventListener('click', () => { sfx.tap(); showMap(); });
  document.getElementById('retry-btn').addEventListener('click', () => { sfx.tap(); showGame(id); });
}

// ---------- 게임 결과 ----------
function showResult(id, { score, stars, msg }) {
  const lesson = lessonOf(id);
  const prev = S.getLesson(id);
  const isNewBest = score > prev.bestScore;
  S.setLessonResult(id, { stars, score });
  if (stars >= 2) sfx.clear(); else sfx.fail();
  render(`
    <div class="screen">
      <div class="result-wrap">
        <div class="result-card">
          <div style="font-family:var(--font-title);font-size:22px;color:var(--ink-soft);">${lesson.emoji} ${lesson.gameName} 결과</div>
          <div class="result-stars">${starStr(stars)}</div>
          <div class="result-score">${score}점 ${isNewBest ? '<span style="font-size:18px;color:var(--pink);">🎉 최고 기록!</span>' : ''}</div>
          <div class="result-best">최고 기록: ${Math.max(score, prev.bestScore)}점</div>
          <div class="result-msg">${msg}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
            <button class="btn btn-ghost" id="retry-btn">🔄 다시 도전</button>
            <button class="btn btn-green" id="quiz-btn">📝 성찰 퀴즈 풀기</button>
          </div>
        </div>
      </div>
    </div>
  `, { screen: 'result', id });
  document.getElementById('retry-btn').addEventListener('click', () => { sfx.tap(); showGame(id); });
  document.getElementById('quiz-btn').addEventListener('click', () => { sfx.tap(); showQuiz(id); });
}

// ---------- 성찰 퀴즈 ----------
// 해설 문장은 '맞아요!/아니에요.'로 시작하므로, 내 답의 정오와 헷갈리지 않게 접두어를 떼고 문장의 참/거짓을 따로 표시
const stripPrefix = (why) => why.replace(/^(맞아요|아니에요)[!.]?\s*/, '');

function showQuiz(id) {
  const lesson = lessonOf(id);
  let qi = 0, correct = 0, answered = false;
  render(`
    <div class="screen">
      <div class="quiz-wrap">
        <div class="quiz-card">
          <div class="quiz-progress" id="qp"></div>
          <div class="quiz-q" id="qq"></div>
          <div class="quiz-ox" id="qox">
            <button class="ox-o">⭕</button>
            <button class="ox-x">❌</button>
          </div>
          <div id="qexp"></div>
        </div>
      </div>
    </div>
  `, { screen: 'quiz', id });
  const qp = document.getElementById('qp');
  const qq = document.getElementById('qq');
  const qox = document.getElementById('qox');
  const qexp = document.getElementById('qexp');

  function renderQ() {
    const q = lesson.quiz[qi];
    answered = false;
    qp.textContent = `📝 성찰 퀴즈 ${qi + 1} / ${lesson.quiz.length}`;
    qq.textContent = q.q;
    qexp.innerHTML = '';
    qox.style.display = 'flex';
  }
  renderQ();

  function answer(saidO) {
    if (answered) return;
    answered = true;
    const q = lesson.quiz[qi];
    const ok = saidO === q.a;
    if (ok) { correct++; sfx.good(); } else sfx.bad();
    qox.style.display = 'none';
    qexp.innerHTML = `
      <div class="quiz-explain ${ok ? 'good' : 'bad'}">
        <b>${ok ? '⭕ 정답!' : '❌ 앗, 틀렸어요!'}</b> 이 문장은 <b>${q.a ? '맞는 말' : '틀린 말'}</b>이에요.<br>${stripPrefix(q.why)}
      </div>
      <div style="margin-top:14px;">
        <button class="btn btn-primary" id="q-next">${qi < lesson.quiz.length - 1 ? '다음 문제 ▶' : '결과 보기 🎁'}</button>
      </div>
    `;
    const nextBtn = document.getElementById('q-next');
    nextBtn.addEventListener('click', () => {
      nextBtn.disabled = true;
      sfx.tap();
      qi++;
      if (qi < lesson.quiz.length) {
        // 버튼 자리에 다음 문제의 ⭕/❌가 오므로 더블탭 방지용 짧은 지연
        setTimeout(renderQ, 250);
      } else {
        S.setQuizResult(id, correct);
        showBadge(id, correct);
      }
    });
  }
  qox.querySelector('.ox-o').addEventListener('click', () => answer(true));
  qox.querySelector('.ox-x').addEventListener('click', () => answer(false));
}

// ---------- 배지 획득 ----------
function showBadge(id, quizCorrect) {
  const lesson = lessonOf(id);
  const allCleared = S.clearedCount() >= 12;
  sfx.badge();
  render(`
    <div class="screen">
      <div class="badge-wrap">
        <div style="font-family:var(--font-title);font-size:24px;color:var(--ink-soft);">🎉 ${lesson.id}차시 완료!</div>
        <div class="badge-circle">${lesson.badge}</div>
        <div class="badge-name">${lesson.badgeName} 획득!</div>
        <div style="color:var(--ink-soft);">성찰 퀴즈 ${quizCorrect} / ${lesson.quiz.length} 정답</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
          ${allCleared
            ? '<button class="btn btn-big btn-primary" id="cert-btn">🎓 수료증 받기!</button>'
            : id < 12
              ? `<button class="btn btn-green" id="next-lesson-btn">다음 차시로 ▶</button>`
              : ''}
          <button class="btn btn-ghost" id="map-btn">🗺️ 배움 지도</button>
        </div>
      </div>
    </div>
  `, { screen: 'badge', id });
  document.getElementById('map-btn').addEventListener('click', () => { sfx.tap(); showMap(); });
  document.getElementById('next-lesson-btn')?.addEventListener('click', () => { sfx.tap(); showConcepts(id + 1); });
  document.getElementById('cert-btn')?.addEventListener('click', () => { sfx.tap(); showCertificate(); });
}

// ---------- 수료증 ----------
function showCertificate() {
  let name = S.getState().name;
  if (!name) {
    name = (prompt('수료증에 들어갈 이름을 알려주세요! ✏️ (20자까지)') || '').trim().slice(0, 20);
    if (name) S.setName(name);
  }
  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  render(`
    <div class="screen">
      <div class="result-wrap">
        <div class="cert-card">
          <div class="cert-title">🎓 수료증 🎓</div>
          <div class="cert-name">${escapeHtml(name || '멋진 어린이')}</div>
          <div class="cert-text">
            위 어린이는 <b>AI 윤리 미니게임 천국</b>의<br>
            12차시 과정을 모두 마치고<br>
            인공지능을 바르고 슬기롭게 사용하는<br>
            <b>AI 윤리 챔피언</b>이 되었음을 인증합니다.
          </div>
          <div class="cert-badges">${LESSONS.map((l) => l.badge).join('')}</div>
          <div style="color:var(--ink-soft);">${dateStr}</div>
          <div style="font-family:var(--font-title);font-size:20px;">AI 윤리 미니게임 천국 🤖</div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-ghost" id="map-btn">🗺️ 배움 지도</button>
          <button class="btn btn-ghost" id="home-btn">🏠 처음으로</button>
        </div>
        <div style="font-size:14px;color:var(--ink-soft);">📸 화면을 캡처해서 선생님께 보여주세요!</div>
      </div>
    </div>
  `, { screen: 'cert' });
  document.getElementById('map-btn').addEventListener('click', () => { sfx.tap(); showMap(); });
  document.getElementById('home-btn').addEventListener('click', () => { sfx.tap(); showTitle(); });
}

// ---------- 시작 ----------
try {
  history.replaceState({ screen: 'title' }, '');
  fromPop = true; // 첫 화면은 history를 추가로 쌓지 않음
  showTitle();
} catch (err) {
  // 저장 데이터가 깨져도 '불러오는 중'에 갇히지 않도록 복구 화면 제공
  console.error(err);
  app.innerHTML = `
    <div class="screen interrupt-wrap">
      <div style="font-size:64px;">🛠️</div>
      <div style="font-family:var(--font-title);font-size:24px;">앱을 여는 중 문제가 생겼어요</div>
      <div style="color:var(--ink-soft);">저장된 진행 상황을 초기화하면 다시 시작할 수 있어요.</div>
      <button class="btn btn-primary" id="recover-btn">🗑️ 초기화하고 다시 시작</button>
    </div>`;
  document.getElementById('recover-btn').addEventListener('click', () => { S.resetAll(); location.reload(); });
}

// 개발/테스트용 훅 (콘솔에서 화면 이동 가능)
window.__go = { showTitle, showMap, showConcepts, showGame, showResult, showQuiz, showBadge, showCertificate, showInterrupted };
