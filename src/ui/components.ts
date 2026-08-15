// 공통 UI 헬퍼

import { audio } from '../core/audio';

/** 엘리먼트 생성 헬퍼 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  html = ''
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html) e.innerHTML = html;
  return e;
}

/** 클릭 사운드가 포함된 버튼. ariaLabel은 이모지 전용 버튼의 스크린리더 안내용 */
export function button(
  label: string,
  onClick: () => void,
  className = 'btn',
  ariaLabel?: string
): HTMLButtonElement {
  const b = el('button', className);
  b.type = 'button';
  b.innerHTML = label;
  if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
  b.addEventListener('click', () => {
    audio.click();
    onClick();
  });
  return b;
}

/** 별점 표시 (★/☆) */
export function starsHtml(count: number, max = 3): string {
  let s = '';
  for (let i = 0; i < max; i++) {
    s += `<span class="${i < count ? 'on' : 'off'}">⭐</span>`;
  }
  return s;
}

/** 게임 화면 위에 떠오르는 O/X 피드백 */
export function floater(
  parent: HTMLElement,
  x: number,
  y: number,
  text: string,
  good: boolean
) {
  const f = el('div', `floater ${good ? 'good' : 'bad'}`, text);
  f.style.left = `${x}px`;
  f.style.top = `${y}px`;
  parent.appendChild(f);
  setTimeout(() => f.remove(), 800);
}

/** 화면 좌표(clientX/Y) → 1280x800 스테이지 좌표 변환 */
export function stagePoint(stage: HTMLElement, clientX: number, clientY: number) {
  const r = stage.getBoundingClientRect();
  return {
    x: ((clientX - r.left) / r.width) * 1280,
    y: ((clientY - r.top) / r.height) * 800
  };
}
