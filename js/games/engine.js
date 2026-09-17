// ============================================
// 미니게임 공통 엔진 헬퍼
// 각 게임은 mount(host, ctx)로 시작하고 ctx.finish({score, stars, msg})로 종료
// ============================================
import { sfx } from '../audio.js';

export const rand = (min, max) => Math.random() * (max - min) + min;
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 게임 스테이지 기본 골격 생성: HUD + 본문 영역
export function buildStage(host, { time = 60, scoreLabel = '점수' } = {}) {
  host.innerHTML = `
    <div class="game-hud">
      <div class="hud-time">⏰ <span class="t">${time}</span></div>
      <div class="hud-extra"></div>
      <div class="hud-score">${scoreLabel} <span class="s">0</span></div>
    </div>
    <div class="game-body"></div>
  `;
  const timeEl = host.querySelector('.hud-time');
  const tEl = host.querySelector('.hud-time .t');
  const sEl = host.querySelector('.hud-score .s');
  return {
    body: host.querySelector('.game-body'),
    extra: host.querySelector('.hud-extra'),
    setTime(t) {
      tEl.textContent = Math.max(0, Math.ceil(t));
      timeEl.classList.toggle('low', t <= 10);
    },
    setScore(s) { sEl.textContent = s; },
  };
}

// 3-2-1 카운트다운 (게임 설명 포함)
export function countdown(host, { title, help }, onStart) {
  const ov = document.createElement('div');
  ov.className = 'countdown-overlay';
  ov.innerHTML = `
    <div class="cd-title">${title}</div>
    <div class="cd-help">${help}</div>
    <div class="cd-num">준비!</div>
  `;
  host.appendChild(ov);
  const numEl = ov.querySelector('.cd-num');
  let n = 3;
  const iv = setInterval(() => {
    if (n === 0) {
      clearInterval(iv);
      ov.remove();
      onStart();
      return;
    }
    numEl.textContent = n;
    numEl.style.animation = 'none';
    void numEl.offsetWidth; // 애니메이션 재시작
    numEl.style.animation = 'pop-in 0.5s ease';
    sfx.tick();
    n--;
  }, 800);
  return () => clearInterval(iv);
}

// 초 단위 게임 타이머
export function gameTimer(seconds, onTick, onEnd) {
  let remain = seconds;
  let stopped = false;
  onTick(remain);
  const iv = setInterval(() => {
    if (stopped) return;
    remain--;
    onTick(remain);
    if (remain <= 5 && remain > 0) sfx.tick();
    if (remain <= 0) {
      stopped = true;
      clearInterval(iv);
      onEnd();
    }
  }, 1000);
  return {
    stop() { stopped = true; clearInterval(iv); },
    get remain() { return remain; },
  };
}

// 점수 플로팅 이펙트 (+10 / -5)
export function floatScore(body, x, y, text, good = true) {
  const el = document.createElement('div');
  el.className = `float-score ${good ? 'good' : 'bad'}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// 안내 토스트
export function toast(body, text, ms = 1600) {
  const el = document.createElement('div');
  el.className = 'game-toast';
  el.innerHTML = text;
  body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// 별점 계산 (비율 기반): 0.35 미만 1개, 0.7 미만 2개, 이상 3개 (최소 1개)
export function starsFromRatio(ratio) {
  if (ratio >= 0.7) return 3;
  if (ratio >= 0.35) return 2;
  return 1;
}

// 프레임 속도 보정: rAF 타임스탬프로 60fps 기준 배율(dt)을 계산
// 120Hz 태블릿에서 2배속, 저사양 기기에서 반속이 되는 것을 막는다
export function frameScaler() {
  let last = null;
  return (now) => {
    const dt = last === null ? 1 : Math.min(3, (now - last) / (1000 / 60));
    last = now;
    return dt;
  };
}

// 포인터 드래그 헬퍼 (터치/마우스 공용)
// 첫 손가락(isPrimary)만 추적해 두 번째 손가락이 닿아도 드래그가 끊기지 않게 한다
export function draggable(el, { onStart, onMove, onEnd }) {
  let dragging = false;
  let activeId = null;
  let startX = 0, startY = 0;
  const down = (e) => {
    if (dragging || e.isPrimary === false) return;
    dragging = true;
    activeId = e.pointerId;
    const p = point(e);
    startX = p.x; startY = p.y;
    el.setPointerCapture?.(e.pointerId);
    onStart?.(p, e);
    e.preventDefault();
  };
  const move = (e) => {
    if (!dragging || e.pointerId !== activeId) return;
    const p = point(e);
    onMove?.({ ...p, dx: p.x - startX, dy: p.y - startY }, e);
    e.preventDefault();
  };
  const up = (e) => {
    if (!dragging || e.pointerId !== activeId) return;
    dragging = false;
    activeId = null;
    const p = point(e);
    onEnd?.({ ...p, dx: p.x - startX, dy: p.y - startY }, e);
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
  };
}

function point(e) {
  return { x: e.clientX, y: e.clientY };
}
