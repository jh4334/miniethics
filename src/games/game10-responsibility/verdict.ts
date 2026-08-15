import { button, el, floater } from '../../ui/components';
import type { GameCtx } from '../registry';
import type { CaseData } from './model';

interface VerdictOptions {
  wrap: HTMLElement;
  stage: HTMLElement;
  data: CaseData;
  caseIndex: number;
  placed: Record<string, number>;
  audio: GameCtx['audio'];
  say: (text: string) => void;
  updateHud: () => void;
  centerOf: (target: HTMLElement) => { x: number; y: number };
  later: (action: () => void, delay: number) => number;
  recordScore: (score: number) => void;
  onContinue: (score: number, clearFeedback: () => void) => void;
}

export function renderVerdict(options: VerdictOptions) {
  const { wrap, stage, data, caseIndex, placed, audio, say, updateHud, centerOf, later, recordScore, onContinue } = options;
  stage.replaceChildren();
  const gavel = el('div', 'g10-gavel', '🔨');
  wrap.appendChild(gavel);
  audio.good();
  later(() => gavel.remove(), 750);
  const feedbackTimers: number[] = [];
  const laterFeedback = (action: () => void, delay: number) => {
    feedbackTimers.push(later(action, delay));
  };
  const clearFeedback = () => feedbackTimers.forEach(clearTimeout);
  let deviation = 0;
  data.defendants.forEach((defendant) => {
    if (defendant.ai) return;
    const count = placed[defendant.key] ?? 0;
    deviation += count < defendant.min ? defendant.min - count : count > defendant.max ? count - defendant.max : 0;
  });
  const score = Math.max(0, 100 - 15 * deviation);
  recordScore(score);
  const title = el('div', 'g10-title', `🔨 판결 결과<small>사건 ${caseIndex + 1} 「${data.title}」</small>`);
  const panel = el('div', 'g10-panel');

  data.defendants.forEach((defendant, index) => {
    const count = placed[defendant.key] ?? 0;
    const inRange = count >= defendant.min && count <= defendant.max;
    const row = el('div', 'g10-vrow');
    const mark = defendant.ai ? '🚫' : inRange ? '⭕' : count < defendant.min ? '⬆️❌' : '⬇️❌';
    row.innerHTML = `<div class="g10-vico">${defendant.ai ? '🚗' : defendant.icon}</div>
      <div class="g10-vname"><b>${defendant.name}</b><div class="g10-vreason">${defendant.reason}</div></div>
      <div class="g10-vnum"><span>나의 판결</span>${defendant.ai ? '받을 수 없음' : `${count}조각`}</div>
      <div class="g10-vnum"><span>대법관 의견</span>${defendant.ai ? '책임 없음' : `${defendant.min}~${defendant.max}조각`}</div>
      <div class="g10-vmark">${mark}</div>`;
    panel.appendChild(row);
    if (!defendant.ai) {
      laterFeedback(() => {
        if (!row.isConnected) return;
        const point = centerOf(row);
        if (inRange) {
          audio.good();
          floater(wrap, point.x + 380, point.y, '딱 맞아! ⭕', true);
        } else {
          audio.bad();
          floater(wrap, point.x + 380, point.y, count < defendant.min ? '조금 부족! ⬆️' : '너무 많아! ⬇️', false);
        }
      }, 700 + index * 450);
    }
  });
  panel.appendChild(el('div', 'g10-casescore', `이번 사건 점수 ${score}점`));
  say(deviation === 0 ? '고마워! 이제 누가 뭘 고쳐야 할지 알겠어!' : '음… 대법관 의견과 조금 달랐네. 다음 사건도 부탁해!');
  updateHud();
  const center = el('div', 'g10-center');
  const last = caseIndex === 2;
  center.appendChild(button(last ? '최종 판결 보기 🏆' : '다음 사건 ▶', () => onContinue(score, clearFeedback), 'btn big yellow'));
  stage.append(title, panel, center);
}

interface FinalOptions {
  wrap: HTMLElement;
  scores: number[];
  audio: GameCtx['audio'];
  onFinish: (score: number) => void;
}

export function renderFinal({ wrap, scores, audio, onFinish }: FinalOptions) {
  const final = Math.round(scores.reduce((sum, score) => sum + score, 0) / Math.max(1, scores.length));
  const heading = final >= 90 ? '명판사 탄생! ⚖️✨' : final >= 70 ? '공정한 판사! ⚖️' : '견습 판사 수료 📖';
  const overlay = el('div', 'game-over-overlay');
  const card = el('div', 'card howto-card');
  card.innerHTML = `<h2>${heading}</h2><div class="g10-over-score">${final}점</div>
    <div class="g10-over-lines">사건 1 「노란 신호 사건」 <b>${scores[0] ?? 0}점</b><br>
    사건 2 「진흙 센서 사건」 <b>${scores[1] ?? 0}점</b><br>
    사건 3 「낡은 지도 사건」 <b>${scores[2] ?? 0}점</b></div>
    <div class="g10-over-say">책임 조각은 한 번도 부릉이에게 붙지 않았어요.<br><b>AI의 실수는 사람이 나눠 책임져요!</b></div>`;
  card.appendChild(button('결과 보기 🏆', () => onFinish(final), 'btn big yellow'));
  overlay.appendChild(card);
  wrap.appendChild(overlay);
  audio.fanfare();
}
