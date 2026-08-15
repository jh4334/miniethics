import { charImg } from '../../assets-manifest';
import { button, el } from '../../ui/components';
import type { GameCtx } from '../registry';
import { CASES } from './cases';
import { AI_LINES } from './copy';
import { renderEvidence } from './evidence';
import { renderReplay } from './replay';
import { renderResponsibility } from './responsibility';
import { GAME10_STYLES } from './styles';
import { renderFinal, renderVerdict } from './verdict';

export function mountGame10(container: HTMLElement, ctx: GameCtx) {
  const style = document.createElement('style');
  style.id = 'g10-style';
  style.textContent = GAME10_STYLES;
  document.head.appendChild(style);
  const wrap = el('div', 'game-wrap g10-scene');
  const timers: number[] = [];
  const actorTimers: number[] = [];
  let exited = false;
  let caseIndex = 0;
  let aiLineIndex = 0;
  let tipShown = false;
  const scores: number[] = [];

  const topbar = el('div', 'game-topbar');
  const score = el('div', 'game-score', '사건 1/3 · ⭐0점');
  topbar.append(button('🗺️', safeQuit, 'icon-btn', '그만두기'), el('div', 'game-name', '🚗 자율주행 법정'), el('div', 'g10-spacer'), score);
  const dock = el('div', 'g10-dock');
  const speech = el('div', 'g10-say');
  const body = el('div', 'g10-body');
  body.appendChild(charImg('char10', '', '부릉이'));
  dock.append(speech, body, el('div', 'g10-dock-name', '🚗 부릉이'), el('div', 'g10-dock-tag', '피고인석'));
  const stage = el('div', 'g10-stage');
  wrap.append(topbar, dock, stage);
  container.appendChild(wrap);

  function safeQuit() {
    if (exited) return;
    exited = true;
    ctx.quit();
  }
  function safeFinish(value: number) {
    if (exited) return;
    exited = true;
    ctx.finish(value);
  }
  function later(action: () => void, delay: number) {
    const id = window.setTimeout(action, delay);
    timers.push(id);
    return id;
  }
  function laterActor(action: () => void, delay: number) {
    const id = later(action, delay);
    actorTimers.push(id);
  }
  function clearActorTimers() {
    actorTimers.forEach(clearTimeout);
    actorTimers.length = 0;
  }
  function averageScore() {
    return scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;
  }
  function updateHud() {
    score.textContent = `사건 ${Math.min(caseIndex + 1, 3)}/3 · ⭐${averageScore()}점`;
  }
  function say(text: string) {
    speech.textContent = text;
  }
  function shake() {
    body.classList.remove('shake');
    void body.offsetWidth;
    body.classList.add('shake');
  }
  function centerOf(target: HTMLElement) {
    const targetRect = target.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const scale = wrapRect.width > 0 ? wrapRect.width / 1280 : 1;
    return {
      x: (targetRect.left + targetRect.width / 2 - wrapRect.left) / scale,
      y: (targetRect.top + targetRect.height / 2 - wrapRect.top) / scale
    };
  }
  function nextAiLine() {
    const line = AI_LINES[aiLineIndex % AI_LINES.length];
    aiLineIndex++;
    return line;
  }
  function showTip() {
    if (tipShown) return;
    tipShown = true;
    later(() => {
      const tip = el('div', 'g10-tip');
      const card = el('div', 'g10-tip-card');
      card.append(charImg('eti', '', '에티'), el('div', 'g10-tip-text', '봤지? <b>AI는 책임 조각을 받을 수 없어.</b><br>반성할 마음도, 물어 줄 돈도 없거든.<br>그래서 AI의 실수는 늘 <b>사람들이 나눠서</b> 책임져야 해!'), button('알겠어!', () => tip.remove(), 'btn big yellow'));
      tip.appendChild(card);
      wrap.appendChild(tip);
      ctx.audio.star();
    }, 400);
  }

  function phaseA() {
    clearActorTimers();
    renderReplay({ stage, data: CASES[caseIndex], caseIndex, audio: ctx.audio, say, updateHud, laterActor, onEvidence: phaseB });
  }
  function phaseB() {
    clearActorTimers();
    renderEvidence({ wrap, stage, data: CASES[caseIndex], audio: ctx.audio, say, shake, onReady: phaseC });
  }
  function phaseC() {
    renderResponsibility({ wrap, stage, data: CASES[caseIndex], audio: ctx.audio, say, shake, centerOf, later, nextAiLine, onTip: showTip, onJudge: phaseD });
  }
  function phaseD(placed: Record<string, number>) {
    renderVerdict({
      wrap, stage, data: CASES[caseIndex], caseIndex, placed, audio: ctx.audio, say, updateHud, centerOf, later,
      recordScore: (value) => { scores[caseIndex] = value; },
      onContinue: (_value, clearFeedback) => {
        clearFeedback();
        if (caseIndex === CASES.length - 1) renderFinal({ wrap, scores, audio: ctx.audio, onFinish: safeFinish });
        else {
          caseIndex++;
          phaseA();
        }
      }
    });
  }

  phaseA();
  return () => {
    exited = true;
    timers.forEach(clearTimeout);
    style.remove();
    wrap.remove();
  };
}
