// 3차시: 골고루 밥상 - 데이터 편향 밸런스 게임
// 떨어지는 데이터를 탭해서 로봇에게 먹이되, 4종류를 골고루! 치우치면 편향 경고
import { buildStage, countdown, gameTimer, floatScore, toast, starsFromRatio, randInt, pick, frameScaler } from './engine.js';
import { sfx } from '../audio.js';

const TYPES = [
  { key: 'baby', e: '👶', name: '아기', color: '#ffd66b' },
  { key: 'kid', e: '🧒', name: '어린이', color: '#7ddba3' },
  { key: 'adult', e: '🧑', name: '어른', color: '#6bb8ff' },
  { key: 'senior', e: '👵', name: '어르신', color: '#b39dff' },
];
const TIME = 50;
const MAX_REF = 260;

export default {
  id: 3,
  mount(host, ctx) {
    const ui = buildStage(host, { time: TIME });
    let score = 0, alive = false, timer = null, spawnIv = null, rafId = null;
    const counts = { baby: 0, kid: 0, adult: 0, senior: 0 };
    let setsDone = 0, biasHits = 0;
    const falling = new Set();
    const scale = frameScaler();

    ui.body.innerHTML = `
      <div style="position:absolute;top:0;left:0;right:0;z-index:6;background:rgba(255,255,255,0.92);padding:8px 14px;display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;gap:10px;" class="type-gauges"></div>
        <div class="gauge-row">⚠️ 편향 <div class="gauge"><div class="bias-bar" style="background:var(--red);width:0%"></div></div></div>
      </div>
      <div class="fall-area" style="position:absolute;inset:0;top:74px;overflow:hidden;"></div>
      <div style="position:absolute;bottom:8px;left:0;right:0;text-align:center;pointer-events:none;z-index:6;">
        <div class="robot" style="font-size:64px;">🤖</div>
        <div class="robot-say" style="font-size:14px;color:var(--ink-soft);">데이터를 골고루 주세요!</div>
      </div>
    `;
    const gaugesEl = ui.body.querySelector('.type-gauges');
    gaugesEl.innerHTML = TYPES.map((t) => `
      <div style="flex:1;display:flex;align-items:center;gap:4px;font-size:14px;">
        ${t.e}<div class="gauge"><div class="g-${t.key}" style="background:${t.color};width:0%"></div></div>
        <span class="c-${t.key}" style="font-family:var(--font-title);min-width:16px;">0</span>
      </div>`).join('');
    const fallArea = ui.body.querySelector('.fall-area');
    const biasBar = ui.body.querySelector('.bias-bar');
    const robot = ui.body.querySelector('.robot');
    const robotSay = ui.body.querySelector('.robot-say');

    function updateGauges() {
      const vals = TYPES.map((t) => counts[t.key]);
      const max = Math.max(...vals, 1);
      TYPES.forEach((t) => {
        gaugesEl.querySelector(`.g-${t.key}`).style.width = `${(counts[t.key] / Math.max(max, 5)) * 100}%`;
        gaugesEl.querySelector(`.c-${t.key}`).textContent = counts[t.key];
      });
      const spread = Math.max(...vals) - Math.min(...vals);
      biasBar.style.width = `${Math.min(spread / 4, 1) * 100}%`;
      return spread;
    }
    const maxType = () => TYPES.reduce((a, b) => (counts[a.key] >= counts[b.key] ? a : b));

    function spawn() {
      if (!alive) return;
      // 의도적으로 '어른' 데이터가 더 자주 나옴 (현실의 데이터 쏠림 재현)
      const roll = Math.random();
      const type = roll < 0.4 ? TYPES[2] : pick(TYPES);
      const el = document.createElement('div');
      el.className = 'big-emoji-item';
      el.style.fontSize = '52px';
      el.style.left = `${randInt(8, 82)}%`;
      el.style.top = '-70px';
      el.innerHTML = `${type.e}<div class="item-label">${type.name} 데이터</div>`;
      el.dataset.speed = 1.1 + Math.random() * 0.9;
      el.dataset.type = type.key;
      fallArea.appendChild(el);
      falling.add(el);

      el.addEventListener('pointerdown', (ev) => {
        if (!alive) return;
        falling.delete(el);
        el.remove();
        const bodyRect = ui.body.getBoundingClientRect();
        const x = ev.clientX - bodyRect.left, yy = ev.clientY - bodyRect.top;
        const before = Math.max(...TYPES.map((t) => counts[t.key]));
        const isMajority = counts[type.key] >= before && before > 0; // 탭한 종류가 이미 가장 많은 종류인가?
        counts[type.key]++;
        const spread = updateGauges();
        if (spread >= 3 && isMajority) {
          // 이미 가장 많은 종류를 또 먹였을 때만 편향 감점
          biasHits++;
          score = Math.max(0, score - 5);
          sfx.bad();
          floatScore(ui.body, x, yy, '편향! -5', false);
          robot.textContent = '🥴';
          robotSay.textContent = `${maxType().name} 데이터만 너무 많아요! 다른 데이터를 주세요`;
        } else if (spread >= 3) {
          // 부족한 종류를 채우는 올바른 행동은 격려
          score += 5;
          sfx.pop();
          floatScore(ui.body, x, yy, '+5 균형 회복!', true);
          robot.textContent = '🤖';
          robotSay.textContent = `좋아요! ${type.name} 데이터가 더 필요했어요`;
        } else {
          score += 5;
          sfx.pop();
          floatScore(ui.body, x, yy, '+5', true);
          robot.textContent = '🤖';
          robotSay.textContent = '냠냠! 골고루 배우는 중~';
        }
        const minCount = Math.min(...TYPES.map((t) => counts[t.key]));
        if (minCount > setsDone) {
          setsDone = minCount;
          score += 20;
          sfx.good();
          toast(ui.body, '🌈 골고루 세트 완성! +20', 1100);
          robot.textContent = '😋';
        }
        ui.setScore(score);
      });
    }

    function loop(now) {
      if (!alive) return;
      const dt = scale(now);
      const h = fallArea.clientHeight;
      falling.forEach((el) => {
        const y = parseFloat(el.style.top) + parseFloat(el.dataset.speed) * dt;
        el.style.top = `${y}px`;
        if (y > h) { falling.delete(el); el.remove(); }
      });
      rafId = requestAnimationFrame(loop);
    }

    const stopCd = countdown(host, {
      title: '⚖️ 골고루 밥상',
      help: '떨어지는 데이터를 탭해서 로봇에게 먹여요!<br>한 종류만 먹이면 <b>편향</b> 발생! 4종류를 골고루 모으면 보너스 🌈',
    }, () => {
      alive = true;
      rafId = requestAnimationFrame(loop);
      spawnIv = setInterval(spawn, 700);
      timer = gameTimer(TIME, (t) => ui.setTime(t), () => {
        alive = false;
        clearInterval(spawnIv);
        cancelAnimationFrame(rafId);
        const spread = updateGauges();
        const balanced = spread <= 2;
        ctx.finish({
          score,
          stars: Math.max(starsFromRatio(score / MAX_REF), balanced && score >= 80 ? 2 : 1),
          msg: balanced
            ? `골고루 세트 ${setsDone}개 완성! 데이터를 골고루 모았어요.<br>다양한 데이터가 공평한 AI를 만들어요 🌈`
            : `데이터가 한쪽으로 치우쳤네요 (편향 ${biasHits}번).<br>치우친 데이터는 편향된 AI를 만들어요!`,
        });
      });
    });

    return () => { alive = false; stopCd(); timer?.stop(); clearInterval(spawnIv); cancelAnimationFrame(rafId); };
  },
};
