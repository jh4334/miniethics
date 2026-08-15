import { floater } from '../../ui/components';
import type { GameCtx } from '../registry';
import { CASES, TOTAL_CLUES } from './cases';
import { LENS_PER_CASE, PHOTO, TIME_LIMIT } from './model';
import { GAME04_STYLES } from './styles';
import { createGame04View } from './view';

type Phase = 'investigate' | 'verdict' | 'explain' | 'over';

export function mountGame04(container: HTMLElement, ctx: GameCtx) {
  const style = document.createElement('style');
  style.id = 'g04-style';
  style.textContent = GAME04_STYLES;
  document.head.appendChild(style);
  let done = false;
  const view = createGame04View(container, safeQuit);
  const timers: number[] = [];
  let phase: Phase = 'investigate';
  let caseIndex = 0;
  let correct = 0;
  let clues = 0;
  let lenses = LENS_PER_CASE;
  let seconds = TIME_LIMIT;
  let judgeLockUntil = 0;
  let ended = false;
  let used = new Set<number>();

  function later(action: () => void, delay: number) {
    timers.push(window.setTimeout(action, delay));
  }
  function points() {
    return correct * 10 + clues * 5;
  }
  function safeQuit() {
    if (done) return;
    done = true;
    ctx.quit();
  }
  function safeFinish(score: number) {
    if (done) return;
    done = true;
    ctx.finish(score);
  }
  function renderCase() {
    phase = 'investigate';
    lenses = LENS_PER_CASE;
    seconds = TIME_LIMIT;
    used = new Set<number>();
    view.setTimer(100);
    view.setHud(lenses, points());
    view.renderCase(CASES[caseIndex], caseIndex, investigate, judge);
    judgeLockUntil = Date.now() + 450;
    later(view.unlockVerdict, 450);
  }
  function investigate(index: number, marker: HTMLButtonElement) {
    if (phase !== 'investigate' || ended || used.has(index) || lenses <= 0) return;
    const spot = CASES[caseIndex].spots[index];
    used.add(index);
    lenses--;
    const x = PHOTO.left + (spot.x / 100) * PHOTO.w;
    const y = PHOTO.top + (spot.y / 100) * PHOTO.h;
    if (spot.isClue) {
      clues++;
      view.markSpot(index, 'found');
      ctx.audio.good();
      floater(view.wrap, x, y, '단서 발견! 🔎', true);
      view.addNote('clue', `🔎 단서: ${spot.note}`);
      view.say('오오, 예리한데!');
    } else {
      view.markSpot(index, 'checked');
      ctx.audio.pop();
      floater(view.wrap, x, y, '이상 없음 ✅', true);
      view.addNote('ok', `✅ 이상 없음: ${spot.note}`);
    }
    marker.disabled = true;
    view.setHud(lenses, points());
    view.showZoom(spot);
    if (lenses === 0) {
      view.lockUnused(used);
      view.say('돋보기를 다 썼어! 이제 판정할 시간이야.');
    }
  }
  function judge(guess: boolean | null) {
    if (phase !== 'investigate' || ended) return;
    if (guess !== null && Date.now() < judgeLockUntil) return;
    judgeLockUntil = 0;
    phase = 'verdict';
    view.closeZoom();
    view.lockUnused(used);
    const data = CASES[caseIndex];
    const ok = guess !== null && guess === data.real;
    if (ok) {
      correct++;
      ctx.audio.good();
      view.say('역시 탐정단이야!');
    } else {
      ctx.audio.bad();
      view.say('괜찮아, 다음 사건에서 만회하자!');
    }
    view.showStamp(ok, data.real, guess === null);
    view.setHud(lenses, points());
    later(showExplain, 1100);
  }
  function showExplain() {
    if (ended) return;
    phase = 'explain';
    const data = CASES[caseIndex];
    const missed = data.spots.filter((spot, index) => spot.isClue && !used.has(index));
    data.spots.forEach((spot, index) => {
      if (spot.isClue && !used.has(index)) view.markSpot(index, 'found');
    });
    view.showExplain({ data, last: caseIndex === CASES.length - 1, missed, onNext: nextCase });
  }
  function nextCase() {
    if (ended) return;
    if (caseIndex === CASES.length - 1) return gameOver();
    caseIndex++;
    renderCase();
  }
  function gameOver() {
    if (ended) return;
    ended = true;
    phase = 'over';
    const score = Math.max(0, Math.min(100, points()));
    view.showGameOver(correct, clues, TOTAL_CLUES, score, () => safeFinish(score));
    if (score >= 70) ctx.audio.fanfare();
    else ctx.audio.star();
  }
  const tick = window.setInterval(() => {
    if (ended || phase !== 'investigate') return;
    seconds -= 0.2;
    view.setTimer(Math.max(0, (seconds / TIME_LIMIT) * 100));
    if (seconds <= 0) judge(null);
  }, 200);
  renderCase();
  return () => {
    ended = true;
    clearInterval(tick);
    timers.forEach(clearTimeout);
    style.remove();
    view.wrap.remove();
  };
}
