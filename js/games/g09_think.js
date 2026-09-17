// 9차시: AI보다 빨리! - AI가 답을 계산하기 전에 내가 먼저 정답 고르기
import { buildStage, countdown, toast, shuffle } from './engine.js';
import { sfx } from '../audio.js';

const QUESTIONS = [
  { q: '7 × 8 = ?', o: ['56', '54', '63'] },
  { q: '"학교"를 거꾸로 읽으면?', o: ['교학', '학학', '교교'] },
  { q: '대한민국의 수도는?', o: ['서울', '부산', '대전'] },
  { q: '1시간은 몇 분일까?', o: ['60분', '100분', '30분'] },
  { q: '무지개는 몇 가지 색?', o: ['7가지', '5가지', '9가지'] },
  { q: '25 + 37 = ?', o: ['62', '52', '72'] },
  { q: '물이 어는 온도는?', o: ['0℃', '10℃', '100℃'] },
  { q: '"나비"를 영어로 하면?', o: ['butterfly', 'dragonfly', 'firefly'] },
  { q: '삼각형의 변은 몇 개?', o: ['3개', '4개', '5개'] },
  { q: '100 - 64 = ?', o: ['36', '46', '34'] },
  { q: '지구에서 가장 큰 바다는?', o: ['태평양', '대서양', '인도양'] },
  { q: '세종대왕이 만든 글자는?', o: ['한글', '한자', '알파벳'] },
];
const ROUNDS = 8;

export default {
  id: 9,
  mount(host, ctx) {
    const ui = buildStage(host, { time: 0, scoreLabel: '점수' });
    host.querySelector('.hud-time').style.visibility = 'hidden';
    let score = 0, wins = 0, round = 0, alive = false;
    let aiRaf = null;
    const timeouts = [];
    const deck = shuffle(QUESTIONS).slice(0, ROUNDS);

    ui.body.innerHTML = `
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;padding:16px;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;background:#f4f6fc;border-radius:16px;padding:10px 14px;">
          <span style="font-size:34px;" class="ai-face">🤖</span>
          <div style="flex:1;">
            <div style="font-size:13px;color:var(--ink-soft);" class="ai-label">AI가 계산 중...</div>
            <div class="gauge"><div class="ai-bar" style="background:var(--purple);width:0%"></div></div>
          </div>
        </div>
        <div class="round-label" style="text-align:center;font-family:var(--font-title);color:var(--ink-soft);"></div>
        <div class="think-q" style="flex:1;display:flex;align-items:center;justify-content:center;text-align:center;
          font-family:var(--font-title);font-size:clamp(24px,5vw,36px);"></div>
        <div class="mc-options think-opts" style="grid-template-columns:repeat(3,1fr);"></div>
      </div>
    `;
    const aiBar = ui.body.querySelector('.ai-bar');
    const aiFace = ui.body.querySelector('.ai-face');
    const aiLabel = ui.body.querySelector('.ai-label');
    const qEl = ui.body.querySelector('.think-q');
    const optsEl = ui.body.querySelector('.think-opts');
    const roundLabel = ui.body.querySelector('.round-label');

    function finish() {
      alive = false;
      ctx.finish({
        score,
        stars: wins >= 7 ? 3 : wins >= 5 ? 2 : 1,
        msg: `${ROUNDS}판 중 ${wins}판을 AI보다 먼저 풀었어요!<br>먼저 스스로 생각하는 습관, 그게 진짜 실력이에요 🧠`,
      });
    }

    function nextRound() {
      if (!alive) return;
      if (round >= deck.length) { finish(); return; }
      const data = deck[round];
      const answer = data.o[0];
      const opts = shuffle(data.o);
      round++;
      roundLabel.textContent = `${round} / ${ROUNDS} 라운드`;
      qEl.textContent = data.q;
      aiFace.textContent = '🤖';
      aiLabel.textContent = 'AI가 계산 중... 먼저 답하세요!';
      optsEl.innerHTML = '';
      let resolved = false;
      const t0 = performance.now();
      const aiTime = 4500 + Math.random() * 2000;

      opts.forEach((o) => {
        const b = document.createElement('button');
        b.textContent = o;
        b.addEventListener('click', () => {
          if (resolved || !alive) return;
          if (o === answer) {
            resolved = true;
            cancelAnimationFrame(aiRaf);
            const elapsed = performance.now() - t0;
            const fast = elapsed < 2500;
            wins++;
            score += fast ? 20 : 15;
            sfx.good();
            b.classList.add('correct');
            aiFace.textContent = '😮';
            aiLabel.textContent = fast ? '엄청 빨라요! AI가 깜짝 놀랐어요!' : '내가 먼저 풀었다!';
            toast(ui.body, fast ? '⚡ 번개 정답! +20' : '⭕ AI보다 먼저! +15', 900);
            ui.setScore(score);
            timeouts.push(setTimeout(nextRound, 1100));
          } else {
            // 오답이면 그 라운드는 AI 승리: 보기를 전부 눌러보는 전략이 통하지 않게
            resolved = true;
            cancelAnimationFrame(aiRaf);
            score = Math.max(0, score - 5);
            sfx.bad();
            b.classList.add('wrong');
            optsEl.querySelectorAll('button').forEach((x) => { if (x.textContent === answer) x.classList.add('correct'); });
            aiFace.textContent = '😏';
            aiLabel.textContent = `앗, 오답! 정답은 ${answer}. 다음엔 차근차근 생각해요`;
            ui.setScore(score);
            timeouts.push(setTimeout(nextRound, 1400));
          }
        });
        optsEl.appendChild(b);
      });

      function aiLoop(now) {
        if (resolved || !alive) return;
        const p = Math.min(1, (now - t0) / aiTime);
        aiBar.style.width = `${p * 100}%`;
        if (p >= 1) {
          resolved = true;
          sfx.bad();
          aiFace.textContent = '😏';
          aiLabel.textContent = `AI: "정답은 ${answer}!" — 아쉽다, 다음엔 먼저!`;
          optsEl.querySelectorAll('button').forEach((b) => {
            if (b.textContent === answer) b.classList.add('correct');
          });
          timeouts.push(setTimeout(nextRound, 1400));
          return;
        }
        aiRaf = requestAnimationFrame(aiLoop);
      }
      aiBar.style.width = '0%';
      aiRaf = requestAnimationFrame(aiLoop);
    }

    const stopCd = countdown(host, {
      title: '🧠 AI보다 빨리!',
      help: 'AI 게이지가 다 차기 전에 정답을 먼저 골라요!<br>내 두뇌가 먼저, AI는 그다음! 💪',
    }, () => { alive = true; nextRound(); });

    return () => { alive = false; stopCd(); cancelAnimationFrame(aiRaf); timeouts.forEach(clearTimeout); };
  },
};
