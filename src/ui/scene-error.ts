import { button, el } from './components';

export type RecoveryDestination = 'title' | 'worldmap';

export function renderSceneError(
  root: HTMLElement,
  destination: RecoveryDestination,
  recover: () => void
): void {
  const overlay = el('div', 'error-recovery');
  overlay.setAttribute('role', 'alert');
  const card = el('div', 'card error-card');
  card.append(
    el('div', 'error-emoji', '😵'),
    el('h2', '', '앗, 화면을 여는 중 문제가 생겼어요!'),
    el('p', '', '지금까지 모은 별은 안전해요. 아래 버튼을 눌러 다시 시작해 주세요.')
  );
  const label = destination === 'worldmap' ? '🗺️ 월드맵으로 돌아가기' : '🏠 타이틀로 돌아가기';
  card.appendChild(button(label, recover, 'btn big yellow'));
  overlay.appendChild(card);
  root.replaceChildren(overlay);
}
