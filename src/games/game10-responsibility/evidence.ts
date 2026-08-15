import { button, el, floater } from '../../ui/components';
import type { GameCtx } from '../registry';
import type { CaseData, Evidence } from './model';

interface EvidenceOptions {
  wrap: HTMLElement;
  stage: HTMLElement;
  data: CaseData;
  audio: GameCtx['audio'];
  say: (text: string) => void;
  shake: () => void;
  onReady: () => void;
}

export function renderEvidence({ wrap, stage, data, audio, say, shake, onReady }: EvidenceOptions) {
  stage.replaceChildren();
  say('증거를 꼼꼼히 봐 줘. 나도 진실이 알고 싶어.');
  const flipped = data.evidence.map(() => false);
  const title = el('div', 'g10-title', '🔍 증거 조사<small>카드 3장을 모두 탭해서 확인하세요</small>');
  const row = el('div', 'g10-evrow');
  const gate = el('div', 'g10-gate');
  const hint = el('div', 'g10-hint', '증거 3장을 모두 뒤집어야 판결을 시작할 수 있어요.');
  const gateButton = button('판결 준비 ⚖️', () => {
    if (!flipped.every(Boolean)) {
      audio.bad();
      say('증거를 다 보기 전엔 판결할 수 없어!');
      shake();
      floater(wrap, 790, 620, '증거부터 확인! 🔍', false);
      return;
    }
    onReady();
  }, 'btn big g10-off');

  data.evidence.forEach((item, index) => {
    const card = el('button', 'g10-ev');
    card.setAttribute('type', 'button');
    card.setAttribute('aria-label', `증거 ${index + 1}: ${item.title}`);
    card.setAttribute('aria-pressed', 'false');
    const inner = el('div', 'g10-ev-inner');
    const front = el('div', 'g10-face front', `<div class="g10-q">❓</div><div class="g10-n">증거 ${index + 1}</div>`);
    const back = el('div', 'g10-face back', `<div class="g10-ico">${item.icon}</div><div class="g10-t">${item.title}</div><div class="g10-d">${item.desc}</div><div class="g10-more">👆 다시 탭하면 크게 보기</div>`);
    inner.append(front, back);
    card.appendChild(inner);
    row.appendChild(card);
    card.addEventListener('click', () => {
      if (flipped[index]) return openEvidence(stage, item, audio, card);
      flipped[index] = true;
      card.classList.add('flip');
      card.setAttribute('aria-pressed', 'true');
      audio.pop();
      const remaining = flipped.filter((value) => !value).length;
      if (remaining === 0) {
        gateButton.className = 'btn big yellow';
        hint.textContent = '증거를 모두 확인했어요! 이제 판결을 준비하세요.';
        say('증거를 다 봤구나. 이제 책임을 나눠 줘…');
        audio.good();
      } else {
        hint.textContent = `아직 증거 ${remaining}장이 남았어요.`;
      }
    });
  });
  gate.append(gateButton, hint);
  stage.append(title, row, gate);
}

function openEvidence(
  stage: HTMLElement,
  item: Evidence,
  audio: GameCtx['audio'],
  trigger: HTMLButtonElement
) {
  audio.click();
  const modal = el('div', 'g10-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'g10-evidence-dialog-title');
  const card = el('div', 'g10-modal-card', `<div class="g10-ico">${item.icon}</div><div class="g10-t" id="g10-evidence-dialog-title">${item.title}</div><div class="g10-d">${item.desc}</div>`);
  const close = () => {
    modal.remove();
    trigger.focus({ preventScroll: true });
  };
  const closeButton = button('닫기 ✖', close, 'btn ghost');
  card.appendChild(closeButton);
  modal.appendChild(card);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus({ preventScroll: true });
    }
  });
  stage.appendChild(modal);
  closeButton.focus({ preventScroll: true });
}
