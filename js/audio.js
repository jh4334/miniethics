// ============================================
// 간단한 효과음 (WebAudio 합성 - 사운드 파일 불필요)
// ============================================
import { getState } from './state.js';

let ctx = null;

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  // iOS Safari는 전화·시리·앱 전환 뒤 'interrupted' 상태가 되므로 running이 아니면 항상 복구 시도
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  return ctx;
}

// 앱으로 돌아왔을 때 오디오 컨텍스트 복구
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
});

function tone(freq, dur = 0.12, type = 'sine', gain = 0.15, when = 0) {
  const c = ac();
  if (!c || !getState().sound) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime + when);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + when);
  o.stop(c.currentTime + when + dur + 0.02);
}

export const sfx = {
  tap: () => tone(600, 0.06, 'sine', 0.1),
  good: () => { tone(660, 0.09); tone(880, 0.12, 'sine', 0.15, 0.08); },
  bad: () => { tone(220, 0.18, 'square', 0.08); },
  clear: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'sine', 0.15, i * 0.12)); },
  fail: () => { [392, 330, 262].forEach((f, i) => tone(f, 0.2, 'triangle', 0.12, i * 0.15)); },
  tick: () => tone(880, 0.05, 'sine', 0.06),
  pop: () => tone(950, 0.07, 'triangle', 0.12),
  badge: () => { [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.2, 'sine', 0.14, i * 0.1)); },
};
