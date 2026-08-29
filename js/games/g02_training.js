// 2차시: AI 훈련소 - 데이터 라벨링 드래그 게임
// 1단계: 사진을 바구니로 드래그해 AI 학습 → 2단계: 내 정확도만큼 AI가 시험을 봄
import { buildStage, countdown, floatScore, toast, shuffle, draggable } from './engine.js';
import { sfx } from '../audio.js';

const CATS = ['🐱', '😺', '😸', '😻', '🐈', '🐈‍⬛'];
const DOGS = ['🐶', '🐕', '🦮', '🐩', '🐕‍🦺', '🌭'.slice(0, 0) || '🐶'];
const TRAIN_COUNT = 10;
const TEST_COUNT = 5;

export default {
  id: 2,
  mount(host, ctx) {
    const ui = buildStage(host, { time: 0, scoreLabel: '학습' });
    let alive = true;
    let trainDone = 0, trainCorrect = 0;
    let unDrag = null;
    const timeouts = [];
    const later = (fn, ms) => timeouts.push(setTimeout(fn, ms));

    ui.setTime(0);
    host.querySelector('.hud-time').style.visibility = 'hidden';

    ui.body.innerHTML = `
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;">
        <div style="text-align:center;padding:10px;font-size:16px;color:var(--ink-soft);" class="phase-label">
          사진을 알맞은 바구니로 드래그해서 AI를 가르쳐요!
        </div>
        <div class="train-area" style="flex:1;position:relative;"></div>
        <div style="display:flex;justify-content:space-between;padding:14px 26px;">
          <div class="basket" data-kind="cat" style="text-align:center;">
            <div style="font-size:56px;">🧺</div>
            <div style="font-family:var(--font-title);font-size:18px;">🐱 고양이</div>
          </div>
          <div class="robot-face" style="text-align:center;">
            <div style="font-size:56px;" class="rf">🤖</div>
            <div style="font-size:13px;color:var(--ink-soft);" class="rf-label">배우는 중...</div>
          </div>
          <div class="basket" data-kind="dog" style="text-align:center;">
            <div style="font-size:56px;">🧺</div>
            <div style="font-family:var(--font-title);font-size:18px;">🐶 강아지</div>
          </div>
        </div>
      </div>
    `;
    const area = ui.body.querySelector('.train-area');
    const rf = ui.body.querySelector('.rf');
    const rfLabel = ui.body.querySelector('.rf-label');
    const phaseLabel = ui.body.querySelector('.phase-label');

    const deck = shuffle([
      ...shuffle(CATS).slice(0, 5).map((e) => ({ e, kind: 'cat' })),
      ...shuffle(DOGS).slice(0, 5).map((e) => ({ e, kind: 'dog' })),
    ]);

    function spawnCard() {
      if (!alive) return;
      if (trainDone >= TRAIN_COUNT) { startTest(); return; }
      const item = deck[trainDone];
      const card = document.createElement('div');
      card.className = 'big-emoji-item';
      card.style.fontSize = '72px';
      card.style.left = 'calc(50% - 40px)';
      card.style.top = '18px';
      card.style.touchAction = 'none';
      card.innerHTML = `${item.e}<div class="item-label">이건 뭘까?</div>`;
      area.appendChild(card);

      let ox = 0, oy = 0;
      unDrag = draggable(card, {
        onStart() { ox = card.offsetLeft; oy = card.offsetTop; card.style.transition = 'none'; },
        onMove(p) {
          card.style.left = `${ox + p.dx}px`;
          card.style.top = `${oy + p.dy}px`;
        },
        onEnd(p) {
          const bodyRect = ui.body.getBoundingClientRect();
          const relX = p.x - bodyRect.left;
          const nearBottom = p.y - bodyRect.top > bodyRect.height * 0.45;
          let chosen = null;
          if (nearBottom && relX < bodyRect.width * 0.45) chosen = 'cat';
          else if (nearBottom && relX > bodyRect.width * 0.55) chosen = 'dog';
          if (!chosen) {
            card.style.transition = 'left 0.2s ease, top 0.2s ease';
            card.style.left = 'calc(50% - 40px)';
            card.style.top = '18px';
            return;
          }
          unDrag?.(); unDrag = null;
          const correct = chosen === item.kind;
          trainDone++;
          if (correct) {
            trainCorrect++;
            sfx.good();
            floatScore(ui.body, relX, p.y - bodyRect.top - 30, '잘 가르쳤어요!', true);
            rf.textContent = '🤖';
            rfLabel.textContent = `똑똑해지는 중! (${trainCorrect}/${trainDone})`;
          } else {
            sfx.bad();
            floatScore(ui.body, relX, p.y - bodyRect.top - 30, '앗, 잘못 배웠어요', false);
            rf.textContent = '🥴';
            rfLabel.textContent = `헷갈려요... (${trainCorrect}/${trainDone})`;
          }
          ui.setScore(`${trainDone}/${TRAIN_COUNT}`);
          card.remove();
          later(spawnCard, 250);
        },
      });
    }

    function startTest() {
      phaseLabel.innerHTML = '🎓 <b>시험 시간!</b> 내가 가르친 대로 AI가 혼자 맞혀 봐요';
      rfLabel.textContent = '시험 보는 중...';
      const acc = trainDone ? trainCorrect / trainDone : 0;
      const testDeck = shuffle([
        ...shuffle(CATS).slice(0, 3).map((e) => ({ e, kind: 'cat' })),
        ...shuffle(DOGS).slice(0, 2).map((e) => ({ e, kind: 'dog' })),
      ]).slice(0, TEST_COUNT);
      let ti = 0, aiCorrect = 0;

      function testOne() {
        if (!alive) return;
        if (ti >= testDeck.length) {
          const score = trainCorrect * 10 + aiCorrect * 10;
          const stars = acc >= 0.9 && aiCorrect >= 4 ? 3 : acc >= 0.7 ? 2 : 1;
          later(() => ctx.finish({
            score,
            stars,
            msg: `내가 가르친 정확도 ${Math.round(acc * 100)}% → AI 시험 점수 ${aiCorrect}/${TEST_COUNT}!<br>AI의 실력은 가르친 데이터에 달려 있어요.`,
          }), 900);
          return;
        }
        const item = testDeck[ti++];
        area.innerHTML = `
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:24px;">
            <div style="font-size:84px;">${item.e}</div>
            <div style="font-size:44px;">➡️</div>
            <div style="text-align:center;">
              <div style="font-size:64px;" class="guess">🤔</div>
              <div style="font-family:var(--font-title);font-size:20px;" class="guess-text">음...</div>
            </div>
          </div>
        `;
        const guessEl = area.querySelector('.guess');
        const guessText = area.querySelector('.guess-text');
        later(() => {
          if (!alive) return;
          const right = Math.random() < Math.max(0.15, acc);
          const said = right ? item.kind : (item.kind === 'cat' ? 'dog' : 'cat');
          guessEl.textContent = said === 'cat' ? '🐱' : '🐶';
          guessText.textContent = said === 'cat' ? '"고양이!"' : '"강아지!"';
          if (right) { aiCorrect++; sfx.good(); guessText.textContent += ' ⭕'; }
          else { sfx.bad(); guessText.textContent += ' ❌'; }
          ui.setScore(`시험 ${aiCorrect}/${TEST_COUNT}`);
          later(testOne, 1000);
        }, 900);
      }
      testOne();
    }

    const stopCd = countdown(host, {
      title: '🐱 AI 훈련소',
      help: '떨어진 사진을 알맞은 바구니로 드래그!<br>내가 정확히 가르쳐야 AI가 시험을 잘 봐요 🎓',
    }, spawnCard);

    return () => {
      alive = false;
      stopCd();
      unDrag?.();
      timeouts.forEach(clearTimeout);
    };
  },
};
