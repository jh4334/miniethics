// WebAudio 합성 효과음 (에셋 파일 없이 동작, 추후 mp3 교체 가능)

let ctx: AudioContext | null = null;
const MUTE_KEY = 'miniethics-muted';
let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
})();

function ac(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.15,
  when = 0
) {
  const a = ac();
  if (!a || muted) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = a.currentTime + when;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const audio = {
  unlock() {
    ac();
  },
  setMuted(m: boolean) {
    muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    } catch {
      /* 저장 실패 시 세션 내에서만 유지 */
    }
  },
  isMuted() {
    return muted;
  },
  click() {
    tone(700, 0.08, 'triangle', 0.12);
  },
  good() {
    tone(660, 0.1, 'triangle', 0.14);
    tone(880, 0.14, 'triangle', 0.14, 0.09);
  },
  bad() {
    tone(220, 0.18, 'sawtooth', 0.1);
    tone(160, 0.22, 'sawtooth', 0.1, 0.12);
  },
  pop() {
    tone(520, 0.06, 'square', 0.08);
  },
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.14));
  },
  star() {
    tone(1200, 0.12, 'sine', 0.14);
    tone(1600, 0.18, 'sine', 0.12, 0.1);
  }
};

export type AudioApi = typeof audio;
