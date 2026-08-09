// 2차시: 편식하는 AI (데이터 편향)
// 빨간 사과만 배운 냠봇이 다른 과일을 못 알아보는 것을 보고,
// 다양한 과일 데이터를 골고루 골라 편향을 고쳐 준다.

import type { MiniGame, GameCtx } from './registry';
import { el, button } from '../ui/components';
import { charImg } from '../assets-manifest';

interface Food {
  emoji: string;
  name: string;
  kind: string;
}

// 데이터 카드 풀: 사과가 잔뜩(유혹), 나머지는 한 개씩
const POOL: Food[] = [
  { emoji: '🍎', name: '빨간 사과', kind: 'apple' },
  { emoji: '🍎', name: '빨간 사과', kind: 'apple' },
  { emoji: '🍎', name: '빨간 사과', kind: 'apple' },
  { emoji: '🍎', name: '빨간 사과', kind: 'apple' },
  { emoji: '🍌', name: '바나나', kind: 'banana' },
  { emoji: '🍇', name: '포도', kind: 'grape' },
  { emoji: '🍉', name: '수박', kind: 'watermelon' },
  { emoji: '🍊', name: '오렌지', kind: 'orange' },
  { emoji: '🍑', name: '복숭아', kind: 'peach' },
  { emoji: '🥝', name: '키위', kind: 'kiwi' },
  { emoji: '🍓', name: '딸기', kind: 'strawberry' },
  { emoji: '🍐', name: '배', kind: 'pear' }
];

const NON_APPLE_KINDS = ['banana', 'grape', 'watermelon', 'orange', 'peach', 'kiwi', 'strawberry', 'pear'];
const PICK_COUNT = 6;
const TEST_COUNT = 5; // 사과 1 + 무작위 과일 4

function sample<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const FOOD_BY_KIND: Record<string, Food> = {};
POOL.forEach((f) => (FOOD_BY_KIND[f.kind] = f));

export const game02: MiniGame = {
  lessonId: 2,
  mount(container: HTMLElement, ctx: GameCtx) {
    const wrap = el('div', 'game-wrap g2-scene');
    container.appendChild(wrap);
    const timers: number[] = [];

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quit = button('🗺️', () => ctx.quit(), 'icon-btn');
    const name = el('div', 'game-name', '🍽️ 편식하는 AI');
    const spacer = el('div', 'spacer');
    const phaseEl = el('div', 'game-score', '1단계: 관찰');
    topbar.append(quit, name, spacer, phaseEl);
    wrap.appendChild(topbar);

    // ---------- 냠봇 + 밥그릇 ----------
    const bot = el('div', 'g2-bot');
    const speech = el('div', 'g2-speech', '나는 과일 박사 냠봇!');
    bot.append(speech, charImg('nyambot', '', '냠봇'));
    wrap.appendChild(bot);

    const bowl = el('div', 'g2-bowl');
    const bowlBody = el('div', 'bowl-body');
    const bowlLabel = el('div', 'bowl-label', '냠봇이 배운 데이터');
    bowl.append(bowlBody, bowlLabel);
    wrap.appendChild(bowl);

    function setBowl(foods: Food[]) {
      bowlBody.innerHTML = foods.map((f) => `<span>${f.emoji}</span>`).join('');
    }

    // ---------- 1단계: 편향 관찰 ----------
    function phaseObserve() {
      setBowl([FOOD_BY_KIND.apple, FOOD_BY_KIND.apple, FOOD_BY_KIND.apple]);
      speech.textContent = '나는 빨간 사과만 먹고 배웠어! 시험 볼 준비 완료!';

      const area = el('div', 'g2-test-area');
      wrap.appendChild(area);

      const seq: { food: Food; ok: boolean }[] = [
        { food: FOOD_BY_KIND.apple, ok: true },
        { food: FOOD_BY_KIND.banana, ok: false },
        { food: FOOD_BY_KIND.grape, ok: false }
      ];
      let i = 0;
      function next() {
        if (i >= seq.length) {
          const msg = el(
            'div',
            'g2-test-row fail',
            `<span class="g2-test-emoji">😵</span> 사과만 배워서 다른 과일을 몰라봐요! 이것이 <b>&nbsp;데이터 편향&nbsp;</b> 이에요.`
          );
          area.appendChild(msg);
          const fix = button('내가 고쳐 줄게! 💪', () => {
            area.remove();
            fix.remove();
            phasePick();
          }, 'btn big mint g2-feed-btn');
          wrap.appendChild(fix);
          return;
        }
        const { food, ok } = seq[i];
        const row = el(
          'div',
          `g2-test-row ${ok ? 'ok' : 'fail'}`,
          `<span class="g2-test-emoji">${food.emoji}</span> ${food.name}을(를) 보여 주자…
           <span class="g2-test-verdict">${ok ? '"과일이야!" ⭕' : '"과일 아님! 처음 봐!" ❌'}</span>`
        );
        area.appendChild(row);
        if (ok) ctx.audio.good();
        else ctx.audio.bad();
        speech.textContent = ok ? '사과! 이건 확실히 과일!' : `${food.name}…? 그게 뭐야?`;
        i++;
        timers.push(window.setTimeout(next, 1300));
      }
      timers.push(window.setTimeout(next, 900));
    }

    // ---------- 2단계: 골고루 담기 ----------
    const picked: Food[] = [];

    function phasePick() {
      phaseEl.textContent = `2단계: 골라 담기 0/${PICK_COUNT}`;
      speech.textContent = `다양한 과일을 ${PICK_COUNT}개 골라 줘! 골고루 부탁해!`;
      setBowl([]);

      const pool = el('div', 'g2-pool');
      const feed = button('냠냠! 먹이기 🥣', () => {
        pool.remove();
        feed.remove();
        phaseTest();
      }, 'btn big pink g2-feed-btn');
      feed.disabled = true;

      POOL.forEach((food) => {
        const cardEl = el(
          'button',
          'g2-food',
          `${food.emoji}<span class="g2-food-name">${food.name}</span>`
        );
        cardEl.addEventListener('click', () => {
          if (picked.length >= PICK_COUNT) return;
          picked.push(food);
          cardEl.classList.add('picked');
          setBowl(picked);
          ctx.audio.pop();
          phaseEl.textContent = `2단계: 골라 담기 ${picked.length}/${PICK_COUNT}`;
          const kinds = new Set(picked.map((f) => f.kind));
          speech.textContent =
            kinds.size === picked.length
              ? '오~ 다양하게 담고 있구나!'
              : '음? 같은 게 또 들어왔는데…?';
          if (picked.length === PICK_COUNT) {
            feed.disabled = false;
            speech.textContent = '다 담았으면 나에게 먹여 줘!';
          }
        });
        pool.appendChild(cardEl);
      });

      wrap.append(pool, feed);
    }

    // ---------- 3단계: 다시 시험 ----------
    function phaseTest() {
      phaseEl.textContent = '3단계: 다시 시험!';
      speech.textContent = '냠냠… 새로운 데이터를 배웠어! 다시 시험 볼게!';
      setBowl(picked);
      ctx.audio.good();

      const learnedKinds = new Set(picked.map((f) => f.kind));
      learnedKinds.add('apple'); // 사과는 처음부터 알고 있음

      const testFoods: Food[] = [
        FOOD_BY_KIND.apple,
        ...sample(NON_APPLE_KINDS, TEST_COUNT - 1).map((k) => FOOD_BY_KIND[k])
      ];

      const area = el('div', 'g2-test-area');
      wrap.appendChild(area);

      let i = 0;
      let aiCorrect = 0;
      function next() {
        if (i >= testFoods.length) {
          finish(aiCorrect);
          return;
        }
        const food = testFoods[i];
        const ok = learnedKinds.has(food.kind);
        if (ok) aiCorrect++;
        const row = el(
          'div',
          `g2-test-row ${ok ? 'ok' : 'fail'}`,
          `<span class="g2-test-emoji">${food.emoji}</span> ${food.name}
           <span class="g2-test-verdict">${ok ? '"과일이야!" ⭕' : '"몰라… 안 배웠어" ❌'}</span>`
        );
        area.appendChild(row);
        if (ok) ctx.audio.good();
        else ctx.audio.bad();
        speech.textContent = ok ? `${food.name}! 배웠으니까 알아!` : `${food.name}은 밥그릇에 없었잖아…`;
        i++;
        timers.push(window.setTimeout(next, 1200));
      }
      timers.push(window.setTimeout(next, 1000));
    }

    function finish(aiCorrect: number) {
      const distinct = new Set(picked.map((f) => f.kind)).size;
      const score = Math.round((aiCorrect / TEST_COUNT) * 100);
      const perfect = score === 100;
      speech.textContent = perfect
        ? '골고루 배우니까 다 알아볼 수 있어! 고마워!'
        : '아직 처음 보는 과일이 있어… 그래도 많이 나아졌어!';

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>${perfect ? '편식 완치! 🎊' : '많이 나아졌어요! 💪'}</h2>
        <div class="howto-icons">${perfect ? '🤖🌈' : '🤖🍽️'}</div>
        <div class="howto-desc">
          내가 담은 과일 종류: <b>${distinct}가지</b><br>
          냠봇의 시험 성적: <b>${aiCorrect} / ${TEST_COUNT}</b><br><br>
          ${perfect ? '다양한 데이터를 골고루 배우면 AI의 편향이 줄어들어요!' : '같은 데이터만 담으면 여전히 못 알아봐요. 다양하게 담는 것이 핵심!'}
        </div>`;
      const done = button('결과 보기 🏆', () => ctx.finish(score), 'btn big yellow');
      cardEl.appendChild(done);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      ctx.audio.fanfare();
    }

    phaseObserve();

    return () => {
      timers.forEach((t) => clearTimeout(t));
      wrap.remove();
    };
  }
};
