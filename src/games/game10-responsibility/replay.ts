import { button, el } from '../../ui/components';
import type { GameCtx } from '../registry';
import type { CaseData } from './model';

interface ReplayOptions {
  stage: HTMLElement;
  data: CaseData;
  caseIndex: number;
  audio: GameCtx['audio'];
  say: (text: string) => void;
  updateHud: () => void;
  laterActor: (action: () => void, delay: number) => void;
  onEvidence: () => void;
}

export function renderReplay(options: ReplayOptions) {
  const { stage, data, caseIndex, audio, say, updateHud, laterActor, onEvidence } = options;
  stage.replaceChildren();
  updateHud();
  const title = el('div', 'g10-title', `⚖️ 사건 ${caseIndex + 1} 「${data.title}」<small>재판을 시작합니다</small>`);
  const panel = el('div', 'g10-panel');
  const play = el('div', 'g10-play');
  play.appendChild(el('div', 'g10-road'));
  panel.append(play, el('div', 'g10-desc', data.desc));
  const center = el('div', 'g10-center');
  center.appendChild(button('증거를 살펴보자 🔍', onEvidence, 'btn big mint'));
  stage.append(title, panel, center);
  say('그날 일을 보여 줄게… 지금도 아찔해.');
  audio.pop();

  data.actors.forEach((actor) => {
    const node = el('div', 'g10-actor', actor.emoji);
    node.style.left = `${actor.x}px`;
    node.style.top = `${actor.y}px`;
    node.style.fontSize = `${actor.size ?? 70}px`;
    if (actor.at !== undefined) node.style.opacity = '0';
    play.appendChild(node);
    if (actor.at !== undefined) {
      laterActor(() => {
        if (!node.isConnected) return;
        node.style.opacity = '1';
        node.classList.add('g10-in');
        if (actor.sound === 'bad') audio.bad();
        if (actor.sound === 'pop') audio.pop();
      }, actor.at);
    }
    if (actor.tx !== undefined) {
      laterActor(() => {
        if (!node.isConnected) return;
        node.style.transition = `left ${actor.dur ?? 1700}ms linear, opacity .25s ease`;
        node.style.left = `${actor.tx}px`;
      }, 60);
    }
  });
}
