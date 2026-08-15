import { charImg } from '../../assets-manifest';
import { button, el, floater } from '../../ui/components';
import type { GameCtx } from '../registry';
import { PIECES } from './copy';
import type { CaseData, Defendant } from './model';

interface ResponsibilityOptions {
  wrap: HTMLElement;
  stage: HTMLElement;
  data: CaseData;
  audio: GameCtx['audio'];
  say: (text: string) => void;
  shake: () => void;
  centerOf: (target: HTMLElement) => { x: number; y: number };
  later: (action: () => void, delay: number) => void;
  nextAiLine: () => string;
  onTip: () => void;
  onJudge: (placed: Record<string, number>) => void;
}

export function renderResponsibility(options: ResponsibilityOptions) {
  const { wrap, stage, data, audio, say, shake, centerOf, later, nextAiLine, onTip, onJudge } = options;
  stage.replaceChildren();
  say('책임 조각을 공정하게 나눠 줘, 판사님!');
  const placed: Record<string, number> = {};
  data.defendants.forEach((item) => { placed[item.key] = 0; });
  let remain = PIECES;
  let busy = false;
  const slotsByKey: Record<string, HTMLElement> = {};
  const title = el('div', 'g10-title', '⚖️ 책임 나누기<small>피고를 탭하면 조각이 놓이고, 놓인 조각을 탭하면 돌아와요</small>');
  const row = el('div', 'g10-defrow');
  const tray = el('div', 'g10-tray');
  const judgeWrap = el('div', 'g10-center');
  const judgeButton = button('판결! 🔨', () => {
    if (busy) return;
    if (remain > 0) {
      audio.bad();
      say(`아직 조각이 ${remain}개 남았어. 전부 나눠 줘!`);
      shake();
      return;
    }
    onJudge(placed);
  }, 'btn big g10-off');
  judgeWrap.appendChild(judgeButton);

  data.defendants.forEach((defendant) => {
    const card = el('button', `g10-def${defendant.ai ? ' ai' : ''}`);
    card.setAttribute('type', 'button');
    card.setAttribute('aria-label', `${defendant.name}, 책임 조각 놓기`);
    const icon = el('div', 'g10-def-ico');
    if (defendant.ai) icon.appendChild(charImg('char10', '', '부릉이'));
    else icon.textContent = defendant.icon;
    const slots = el('div', 'g10-slots');
    slotsByKey[defendant.key] = slots;
    card.append(icon, el('div', 'g10-def-name', defendant.name), el('div', 'g10-def-sub', defendant.sub), slots);
    row.appendChild(card);
    card.addEventListener('click', (event) => {
      if (busy) return;
      if (!defendant.ai && slots.contains(event.target as Node) && event.target !== card && placed[defendant.key] > 0) {
        placed[defendant.key]--;
        remain++;
        audio.click();
        renderSlots(defendant);
        renderTray();
        return;
      }
      if (defendant.ai) return tryAi(card);
      if (remain <= 0) {
        audio.bad();
        const point = centerOf(card);
        floater(wrap, point.x, point.y, '조각이 없어요!', false);
        return;
      }
      placeOne(defendant, card);
    });
  });

  function renderSlots(defendant: Defendant) {
    const slots = slotsByKey[defendant.key];
    const count = placed[defendant.key];
    if (defendant.ai) {
      slots.className = 'g10-slots';
      slots.innerHTML = '<div class="g10-slots-hint">조각을 받을 수 없어요 🚫</div>';
      return;
    }
    slots.className = `g10-slots${count > 0 ? ' on' : ''}`;
    slots.innerHTML = count > 0
      ? '<div class="g10-chip">⚖️</div>'.repeat(count) + `<div class="g10-slots-hint">${count}조각</div>`
      : '<div class="g10-slots-hint">여기를 탭해 조각 놓기</div>';
  }

  function renderTray() {
    tray.replaceChildren(el('div', 'g10-tray-label', '책임 조각'));
    for (let index = 0; index < PIECES; index++) {
      tray.appendChild(el('div', `g10-token${index < remain ? '' : ' empty'}`, '⚖️'));
    }
    tray.appendChild(el('div', 'g10-tray-label', `남은 조각 ${remain}개`));
    judgeButton.className = remain === 0 && !busy ? 'btn big yellow' : 'btn big g10-off';
  }

  function fly(target: HTMLElement, slip: boolean, onLand: () => void, onReturn?: () => void) {
    const from = centerOf(tray);
    const to = centerOf(target);
    const token = el('div', 'g10-fly', '⚖️');
    token.style.left = `${from.x}px`;
    token.style.top = `${from.y}px`;
    wrap.appendChild(token);
    later(() => {
      token.style.left = `${to.x}px`;
      token.style.top = `${to.y}px`;
    }, 20);
    later(() => {
      if (!slip) token.remove();
      else {
        token.classList.add('slip');
        later(() => {
          token.classList.remove('slip');
          const back = centerOf(tray);
          token.style.left = `${back.x}px`;
          token.style.top = `${back.y}px`;
        }, 450);
        later(() => {
          token.remove();
          onReturn?.();
        }, 810);
      }
      onLand();
    }, 380);
  }

  function placeOne(defendant: Defendant, card: HTMLElement) {
    busy = true;
    remain--;
    renderTray();
    card.classList.add('hot');
    fly(slotsByKey[defendant.key], false, () => {
      placed[defendant.key]++;
      renderSlots(defendant);
      audio.pop();
      card.classList.remove('hot');
      busy = false;
      renderTray();
    });
  }

  function tryAi(card: HTMLElement) {
    if (remain <= 0) {
      audio.bad();
      say(nextAiLine());
      shake();
      return;
    }
    busy = true;
    card.classList.add('hot');
    remain--;
    renderTray();
    fly(slotsByKey.ai, true, () => {
      audio.bad();
      shake();
      say(nextAiLine());
      card.classList.remove('hot');
      const point = centerOf(card);
      floater(wrap, point.x, point.y + 60, '미끄러졌어! 🚫', false);
    }, () => {
      remain++;
      busy = false;
      renderTray();
      audio.pop();
      const point = centerOf(tray);
      floater(wrap, point.x, point.y - 70, '조각이 돌아왔어! ↩️', false);
      onTip();
    });
  }

  data.defendants.forEach(renderSlots);
  renderTray();
  stage.append(title, row, tray, judgeWrap);
}
