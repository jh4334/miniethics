import { charImg } from '../../assets-manifest';
import { button, el } from '../../ui/components';
import type { CaseData, Spot } from './model';

export interface ExplainState {
  data: CaseData;
  last: boolean;
  missed: Spot[];
  onNext: () => void;
}

export function createGame04View(container: HTMLElement, onQuit: () => void) {
  const wrap = el('div', 'game-wrap g04-scene');
  const topbar = el('div', 'game-topbar');
  const lens = el('div', 'g04-lens', '🔍×3');
  const score = el('div', 'game-score', '점수 0');
  const timer = el('div', 'timer-bar');
  const fill = el('div', 'timer-fill');
  timer.appendChild(fill);
  topbar.append(button('🗺️', onQuit, 'icon-btn', '그만두기'), el('div', 'game-name', '🔍 진짜가짜 탐정단'), timer, lens, score);
  const post = el('div', 'g04-post');
  const note = el('div', 'card g04-note');
  wrap.append(topbar, post, note);
  container.appendChild(wrap);

  let photo = el('div');
  let bubble = el('div');
  let notesBox = el('div');
  let notesTitle = el('div');
  let verdictRow = el('div');
  let markers: HTMLButtonElement[] = [];
  let zoomEls: HTMLElement[] = [];

  function setHud(lensLeft: number, points: number) {
    lens.textContent = `🔍×${lensLeft}`;
    score.textContent = `점수 ${points}`;
  }

  function setTimer(percent: number) {
    fill.style.width = `${percent}%`;
    fill.classList.toggle('danger', percent < 25);
  }

  function say(text: string) {
    bubble.textContent = text;
  }

  function renderCase(data: CaseData, index: number, onInvestigate: (spotIndex: number, marker: HTMLButtonElement) => void, onJudge: (guess: boolean) => void) {
    closeZoom();
    post.replaceChildren();
    const head = el('div', 'g04-post-head');
    head.append(el('div', 'g04-avatar', data.avatar), el('div', 'g04-account', data.account), el('div', 'g04-badge', `사건 ${index + 1}/6`));
    photo = el('div', 'g04-photo');
    photo.style.background = data.bg;
    for (const object of data.scene) {
      const node = el('div', 'g04-obj', object.html);
      node.style.left = `${object.x}%`;
      node.style.top = `${object.y}%`;
      if (object.size) node.style.fontSize = `${object.size}px`;
      if (object.css) Object.assign(node.style, object.css);
      photo.appendChild(node);
    }
    markers = data.spots.map((spot, spotIndex) => {
      const marker = el('button', 'g04-marker', '✨');
      marker.style.left = `${spot.x}%`;
      marker.style.top = `${spot.y}%`;
      marker.setAttribute('aria-label', `${spot.label} 조사하기`);
      marker.addEventListener('click', () => onInvestigate(spotIndex, marker));
      photo.appendChild(marker);
      return marker;
    });
    post.append(head, photo, el('div', 'g04-caption', data.caption), el('div', 'g04-meta', `❤️ ${data.likes}   🔁 ${data.shares}`));
    note.replaceChildren();
    const detective = el('div', 'g04-detective');
    bubble = el('div', 'g04-bubble', '이 게시물, 진짜일까?');
    detective.append(charImg('char04', '', '찰칵이'), bubble);
    notesTitle = el('div', 'g04-notes-title', '📓 수사 노트');
    notesBox = el('div', 'g04-notes');
    notesBox.innerHTML = '<div class="g04-empty">사진 위 <b>✨ 돋보기 지점</b>을 탭해서 살펴보자! (3번 가능)</div>';
    verdictRow = el('div', 'g04-verdict g04-lock');
    verdictRow.append(button('진짜야! ⭕', () => onJudge(true), 'btn big mint'), button('가짜야! ❌', () => onJudge(false), 'btn big pink'));
    note.append(detective, notesTitle, notesBox, verdictRow);
  }

  function addNote(kind: 'clue' | 'ok', text: string) {
    notesBox.querySelector('.g04-empty')?.remove();
    notesBox.appendChild(el('div', `g04-line ${kind}`, text));
    notesBox.scrollTop = notesBox.scrollHeight;
  }

  function showZoom(spot: Spot) {
    closeZoom();
    const back = el('div', 'g04-zoom-back');
    const card = el('div', 'g04-zoom');
    card.innerHTML = `<div class="g04-zoom-emoji">${spot.zoom}</div><div class="g04-zoom-title">🔍 ${spot.label} 확대</div><div class="g04-zoom-text">${spot.text}</div>`;
    card.appendChild(button('닫기 ✖️', closeZoom, 'btn'));
    back.addEventListener('click', closeZoom);
    zoomEls = [back, card];
    photo.append(back, card);
  }

  function closeZoom() {
    zoomEls.forEach((node) => node.remove());
    zoomEls = [];
  }

  function lockUnused(used: Set<number>) {
    markers.forEach((marker, index) => {
      marker.disabled = true;
      if (!used.has(index)) marker.classList.add('off');
    });
  }

  function markSpot(index: number, kind: 'found' | 'checked') {
    const marker = markers[index];
    marker.className = `g04-marker ${kind}`;
    marker.textContent = kind === 'found' ? '📌' : '✅';
  }

  function showStamp(ok: boolean, real: boolean, timedOut: boolean) {
    const stamp = el('div', `g04-stamp ${ok ? 'ok' : 'no'}`);
    stamp.textContent = ok ? real ? '⭕ 진짜 확인' : '❌ 가짜 판정' : timedOut ? '⏰ 시간 초과!' : '💦 판정 실패';
    photo.appendChild(stamp);
  }

  function showExplain({ data, last, missed, onNext }: ExplainState) {
    notesTitle.textContent = '📢 사건의 진실';
    const answer = el('div', `g04-answer ${data.real ? 'ok' : 'no'}`, data.real ? '이 게시물은 진짜! ⭕' : '이 게시물은 가짜! ❌');
    let body = data.explain;
    if (missed.length) body += `<br><br><b>놓친 단서 📌</b><br>${missed.map((spot) => `· ${spot.note}`).join('<br>')}`;
    verdictRow = el('div', 'g04-verdict');
    verdictRow.appendChild(button(last ? '수사 결과 보기 🏆' : '다음 사건 ▶', onNext, 'btn big yellow g04-next'));
    const detective = el('div', 'g04-detective');
    const nextBubble = el('div', 'g04-bubble', bubble.textContent || '');
    bubble = nextBubble;
    detective.append(charImg('char04', '', '찰칵이'), nextBubble);
    note.replaceChildren(detective, notesTitle, answer, el('div', 'g04-explain-text', body), verdictRow);
  }

  function showGameOver(correct: number, clues: number, total: number, points: number, onFinish: () => void) {
    const grade = points >= 90 ? '전설의 탐정! 🕵️✨' : points >= 70 ? '베테랑 탐정! 🔍' : points >= 40 ? '견습 탐정 💪' : '신입 탐정 🌱';
    const overlay = el('div', 'game-over-overlay');
    const card = el('div', 'card howto-card');
    card.innerHTML = `<h2>${grade}</h2><div class="howto-icons">🔍🕵️📰</div><div class="howto-desc">정확한 판정: <b>${correct} / 6</b><br>발견한 단서: <b>${clues} / ${total}</b><br><br>겉모습만 믿지 말고 단서와 출처를 확인하는 것, 그게 진짜 탐정이야!</div>`;
    card.appendChild(button('결과 보기 🏆', onFinish, 'btn big yellow'));
    overlay.appendChild(card);
    wrap.appendChild(overlay);
  }

  return { wrap, setHud, setTimer, say, renderCase, addNote, showZoom, closeZoom, lockUnused, markSpot, showStamp, showExplain, showGameOver, unlockVerdict: () => verdictRow.classList.remove('g04-lock') };
}
