// 1차시: AI 요리사 키우기 (데이터 라벨링)
// 재료를 과일/채소 바구니에 분류해 쿡봇을 학습시키고,
// 내 라벨링 정확도만큼 쿡봇이 배우는 것을 테스트로 확인한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

interface Item {
  emoji: string;
  name: string;
  kind: 'fruit' | 'veg';
}

const TRAIN_ITEMS: Item[] = [
  { emoji: '🍎', name: '사과', kind: 'fruit' },
  { emoji: '🥕', name: '당근', kind: 'veg' },
  { emoji: '🍌', name: '바나나', kind: 'fruit' },
  { emoji: '🥦', name: '브로콜리', kind: 'veg' },
  { emoji: '🍇', name: '포도', kind: 'fruit' },
  { emoji: '🍆', name: '가지', kind: 'veg' },
  { emoji: '🍓', name: '딸기', kind: 'fruit' },
  { emoji: '🥬', name: '배추', kind: 'veg' },
  { emoji: '🍉', name: '수박', kind: 'fruit' },
  { emoji: '🧅', name: '양파', kind: 'veg' },
  { emoji: '🍑', name: '복숭아', kind: 'fruit' },
  { emoji: '🥒', name: '오이', kind: 'veg' },
  { emoji: '🍊', name: '오렌지', kind: 'fruit' },
  { emoji: '🌽', name: '옥수수', kind: 'veg' },
  { emoji: '🥝', name: '키위', kind: 'fruit' },
  { emoji: '🥔', name: '감자', kind: 'veg' }
];

const TEST_ITEMS: Item[] = [
  { emoji: '🍐', name: '배', kind: 'fruit' },
  { emoji: '🍅', name: '토마토', kind: 'veg' },
  { emoji: '🫐', name: '블루베리', kind: 'fruit' },
  { emoji: '🍠', name: '고구마', kind: 'veg' },
  { emoji: '🍒', name: '체리', kind: 'fruit' }
];

const TIME_LIMIT = 60; // 초

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const game01: MiniGame = {
  lessonId: 1,
  mount(container: HTMLElement, ctx: GameCtx) {
    const wrap = el('div', 'game-wrap g1-scene');
    container.appendChild(wrap);

    const items = shuffle(TRAIN_ITEMS);
    let idx = 0;
    let correct = 0;
    let answered = 0;
    let timeLeft = TIME_LIMIT;
    let ended = false;
    const timers: number[] = [];

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quit = button('🗺️', () => ctx.quit(), 'icon-btn', '그만두기');
    const name = el('div', 'game-name', '🍳 AI 요리사 키우기');
    const timer = el('div', 'timer-bar');
    const fill = el('div', 'timer-fill');
    timer.appendChild(fill);
    const scoreEl = el('div', 'game-score', '가르침 0개');
    topbar.append(quit, name, timer, scoreEl);
    wrap.appendChild(topbar);

    // ---------- 쿡봇 ----------
    const bot = el('div', 'g1-bot');
    const speech = el('div', 'g1-bot-speech', '이 재료는 뭐야? 알려 줘!');
    bot.append(speech, charImg('cookbot', '', '쿡봇'));
    wrap.appendChild(bot);

    // ---------- 바구니 ----------
    const leftBasket = el('button', 'g1-basket left');
    leftBasket.innerHTML = `<div class="basket-body"><div class="basket-emoji">🍎</div>과일 바구니</div>`;
    const rightBasket = el('button', 'g1-basket right');
    rightBasket.innerHTML = `<div class="basket-body"><div class="basket-emoji">🥕</div>채소 바구니</div>`;
    wrap.append(leftBasket, rightBasket);

    const progress = el('div', 'g1-progress');
    wrap.appendChild(progress);

    let card: HTMLElement | null = null;

    function showItem() {
      if (ended) return;
      if (idx >= items.length) {
        startTest();
        return;
      }
      const item = items[idx];
      card = el(
        'div',
        'g1-item-card',
        `${item.emoji}<div class="g1-item-name">${item.name}</div>`
      );
      wrap.appendChild(card);
      progress.textContent = `📦 ${idx + 1} / ${items.length}`;
    }

    function answer(kind: 'fruit' | 'veg') {
      if (ended || !card || idx >= items.length) return;
      const item = items[idx];
      const isCorrect = item.kind === kind;
      answered++;
      if (isCorrect) {
        correct++;
        ctx.audio.good();
        floater(wrap, 640, 300, '잘 가르쳤어! ⭕', true);
        speech.textContent = `아하! ${item.name}는 ${kind === 'fruit' ? '과일' : '채소'}구나!`;
      } else {
        ctx.audio.bad();
        floater(wrap, 640, 300, '어라? 잘못 배웠어 ❌', false);
        speech.textContent = `음… ${item.name}를 ${kind === 'fruit' ? '과일' : '채소'}로 기억할게…?`;
      }
      scoreEl.textContent = `가르침 ${correct}개`;
      const c = card;
      c.classList.add(kind === 'fruit' ? 'fly-left' : 'fly-right');
      timers.push(window.setTimeout(() => c.remove(), 300));
      card = null;
      idx++;
      timers.push(window.setTimeout(showItem, 340));
    }

    leftBasket.addEventListener('click', () => answer('fruit'));
    rightBasket.addEventListener('click', () => answer('veg'));

    // ---------- 타이머 ----------
    const tick = window.setInterval(() => {
      if (ended) return;
      timeLeft -= 0.2;
      const pct = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
      fill.style.width = `${pct}%`;
      fill.classList.toggle('danger', pct < 25);
      if (timeLeft <= 0) startTest();
    }, 200);
    timers.push(tick);

    // ---------- 테스트 페이즈: 쿡봇 실력 확인 ----------
    function startTest() {
      if (ended) return;
      ended = true;
      clearInterval(tick);
      if (card) card.remove();
      leftBasket.remove();
      rightBasket.remove();
      progress.remove();

      const accuracy = items.length ? correct / items.length : 0;
      speech.textContent = '배운 걸 시험해 볼게! 두구두구…';
      ctx.audio.pop();

      let testIdx = 0;
      let aiCorrect = 0;
      const testEl = el('div', 'g1-test-item');
      const verdict = el('div', 'g1-test-result');
      wrap.append(testEl, verdict);

      function runTest() {
        if (testIdx >= TEST_ITEMS.length) {
          finish();
          return;
        }
        const t = TEST_ITEMS[testIdx];
        testEl.textContent = t.emoji;
        verdict.textContent = '🤔 생각 중…';
        verdict.style.color = 'var(--ink-soft)';
        timers.push(
          window.setTimeout(() => {
            // 내가 가르친 정확도만큼 쿡봇이 맞힌다
            const ok = Math.random() < accuracy;
            if (ok) {
              aiCorrect++;
              verdict.textContent = `"${t.name}는 ${t.kind === 'fruit' ? '과일' : '채소'}!" ⭕`;
              verdict.style.color = 'var(--green)';
              ctx.audio.good();
            } else {
              verdict.textContent = `"${t.name}는 ${t.kind === 'fruit' ? '채소' : '과일'}…?" ❌`;
              verdict.style.color = 'var(--red)';
              ctx.audio.bad();
            }
            testIdx++;
            timers.push(window.setTimeout(runTest, 950));
          }, 800)
        );
      }

      function finish() {
        const score = Math.round(accuracy * 100);
        testEl.remove();
        verdict.remove();
        speech.textContent =
          score >= 90
            ? '네 덕분에 최고의 요리사가 됐어! 고마워!'
            : score >= 60
              ? '많이 배웠어! 조금 더 정확하면 완벽할 거야!'
              : '으음… 잘못 배운 게 많은 것 같아…';

        const overlay = el('div', 'game-over-overlay');
        const cardEl = el('div', 'card howto-card');
        cardEl.innerHTML = `
          <h2>학습 완료! 🎓</h2>
          <div class="howto-icons">${score >= 70 ? '🤖✨' : '🤖💦'}</div>
          <div class="howto-desc">
            내가 정확하게 가르친 재료: <b>${correct} / ${items.length}</b><br>
            쿡봇의 시험 성적: <b>${aiCorrect} / ${TEST_ITEMS.length}</b><br><br>
            내가 가르친 만큼 AI가 배웠어요!
          </div>`;
        const done = button('결과 보기 🏆', () => ctx.finish(score), 'btn big yellow');
        cardEl.appendChild(done);
        overlay.appendChild(cardEl);
        wrap.appendChild(overlay);
        ctx.audio.fanfare();
      }

      runTest();
    }

    showItem();

    return () => {
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      wrap.remove();
    };
  }
};
