// 12차시: AI 윤리 골든벨 - 총정리 서바이벌 퀴즈
import { buildStage, countdown, toast, shuffle } from './engine.js';
import { sfx } from '../audio.js';
import { GOLDENBELL } from '../data/lessons.js';

const Q_COUNT = 12;
const Q_TIME = 15; // 문제당 제한 시간(초)

export default {
  id: 12,
  mount(host, ctx) {
    const ui = buildStage(host, { time: 0, scoreLabel: '점수' });
    host.querySelector('.hud-time').style.visibility = 'hidden';
    let score = 0, correct = 0, streak = 0, hearts = 3, qi = 0;
    let alive = false, qRaf = null;
    const timeouts = [];
    const deck = shuffle(GOLDENBELL).slice(0, Q_COUNT);

    ui.body.innerHTML = `
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;padding:16px;gap:10px;background:linear-gradient(180deg,#fff8e0,#fff);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="hearts"></div>
          <div class="gb-round" style="font-family:var(--font-title);color:var(--ink-soft);"></div>
          <div class="gb-streak" style="font-size:15px;min-width:90px;text-align:right;"></div>
        </div>
        <div class="gauge"><div class="q-timer-bar" style="background:var(--orange);width:100%"></div></div>
        <div class="gb-q" style="flex:1;display:flex;align-items:center;justify-content:center;text-align:center;
          font-size:clamp(18px,3.4vw,24px);line-height:1.5;padding:0 8px;"></div>
        <div class="mc-options gb-opts"></div>
      </div>
    `;
    const heartsEl = ui.body.querySelector('.hearts');
    const roundEl = ui.body.querySelector('.gb-round');
    const streakEl = ui.body.querySelector('.gb-streak');
    const timerBar = ui.body.querySelector('.q-timer-bar');
    const qEl = ui.body.querySelector('.gb-q');
    const optsEl = ui.body.querySelector('.gb-opts');

    function renderHearts() {
      heartsEl.textContent = '❤️'.repeat(hearts) + '🤍'.repeat(3 - hearts);
    }

    function finish() {
      alive = false;
      cancelAnimationFrame(qRaf);
      const survived = hearts > 0 && qi >= deck.length;
      ctx.finish({
        score,
        stars: survived && correct >= 10 ? 3 : correct >= 7 ? 2 : 1,
        msg: survived
          ? `🎊 골든벨 완주! ${deck.length}문제 중 ${correct}문제 정답!<br>당신은 진정한 AI 윤리 챔피언입니다! 👑`
          : `${correct}문제까지 성공! 하트가 다 떨어졌지만<br>여기까지 온 것도 대단해요. 다시 도전해 볼까요? 💪`,
      });
    }

    function nextQ() {
      if (!alive) return;
      if (qi >= deck.length || hearts <= 0) { finish(); return; }
      const data = deck[qi];
      const answerText = data.options[data.a];
      const opts = shuffle(data.options);
      qi++;
      roundEl.textContent = `${qi} / ${deck.length} 문제`;
      qEl.textContent = data.q;
      optsEl.innerHTML = '';
      renderHearts();
      let resolved = false;
      const t0 = performance.now();

      function lose(reasonText) {
        hearts--;
        streak = 0;
        streakEl.textContent = '';
        renderHearts();
        sfx.bad();
        toast(ui.body, reasonText, 1300);
        optsEl.querySelectorAll('button').forEach((b) => {
          if (b.textContent === answerText) b.classList.add('correct');
        });
        timeouts.push(setTimeout(nextQ, 1400));
      }

      opts.forEach((o) => {
        const b = document.createElement('button');
        b.textContent = o;
        b.addEventListener('click', () => {
          if (resolved || !alive) return;
          resolved = true;
          cancelAnimationFrame(qRaf);
          if (o === answerText) {
            correct++;
            streak++;
            const bonus = Math.min(streak - 1, 5) * 5;
            score += 20 + bonus;
            sfx.good();
            b.classList.add('correct');
            streakEl.textContent = streak >= 2 ? `🔥 ${streak}연속!` : '';
            if (bonus) toast(ui.body, `⭕ 정답! 연속 보너스 +${bonus}`, 900);
            ui.setScore(score);
            timeouts.push(setTimeout(nextQ, 1000));
          } else {
            b.classList.add('wrong');
            lose(`❌ 정답은 "${answerText}"!`);
          }
        });
        optsEl.appendChild(b);
      });

      function tick(now) {
        if (resolved || !alive) return;
        const p = Math.max(0, 1 - (now - t0) / (Q_TIME * 1000));
        timerBar.style.width = `${p * 100}%`;
        if (p <= 0) {
          resolved = true;
          lose(`⏰ 시간 초과! 정답은 "${answerText}"`);
          return;
        }
        qRaf = requestAnimationFrame(tick);
      }
      qRaf = requestAnimationFrame(tick);
    }

    const stopCd = countdown(host, {
      title: '🏆 AI 윤리 골든벨',
      help: `지금까지 배운 모든 것을 총정리!<br>하트 ❤️ 3개로 ${Q_COUNT}문제에 도전하세요. 연속 정답 보너스 🔥`,
    }, () => { alive = true; nextQ(); });

    return () => { alive = false; stopCd(); cancelAnimationFrame(qRaf); timeouts.forEach(clearTimeout); };
  },
};
