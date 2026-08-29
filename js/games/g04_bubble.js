// 4차시: 필터버블 탈출! - 추천 영상만 누르면 거품에 갇히는 생존 게임
import { buildStage, countdown, gameTimer, floatScore, toast, randInt, pick } from './engine.js';
import { sfx } from '../audio.js';

const SAME = { e: '🎮', name: '게임 영상', cls: 'same' };
const DIVERSE = [
  { e: '📚', name: '책 이야기' },
  { e: '🎵', name: '음악' },
  { e: '⚽', name: '운동' },
  { e: '🔬', name: '과학 실험' },
  { e: '🎨', name: '미술' },
  { e: '🌍', name: '세계 여행' },
];
const TIME = 50;
const MAX_REF = 220;

export default {
  id: 4,
  mount(host, ctx) {
    const ui = buildStage(host, { time: TIME });
    let score = 0, alive = false, timer = null, spawnIv = null;
    let bubble = 30; // 0(자유) ~ 100(완전히 갇힘)
    let diverseTaps = 0, sameTaps = 0;
    const items = new Set();

    ui.body.innerHTML = `
      <div class="bubble-area" style="position:absolute;inset:0;overflow:hidden;background:#f2f8ff;"></div>
      <div class="bubble-overlay" style="position:absolute;inset:0;pointer-events:none;z-index:10;"></div>
      <div style="position:absolute;top:8px;left:0;right:0;z-index:11;display:flex;justify-content:center;pointer-events:none;">
        <div class="gauge-row" style="background:rgba(255,255,255,0.9);border-radius:999px;padding:6px 16px;width:min(360px,80%);">
          🫧 갇힘 <div class="gauge"><div class="bubble-bar" style="background:var(--purple);width:30%"></div></div>
        </div>
      </div>
    `;
    const area = ui.body.querySelector('.bubble-area');
    const overlay = ui.body.querySelector('.bubble-overlay');
    const bubbleBar = ui.body.querySelector('.bubble-bar');

    function renderBubble() {
      bubbleBar.style.width = `${bubble}%`;
      const openness = 1 - bubble / 100; // 1=활짝, 0=갇힘
      const r = 20 + openness * 75; // 시야 반지름(%)
      overlay.style.background =
        `radial-gradient(circle at 50% 55%, transparent ${r}%, rgba(160,130,255,0.28) ${r + 4}%, rgba(120,90,220,0.55) ${r + 18}%)`;
    }
    renderBubble();

    function changeBubble(d) {
      bubble = Math.max(0, Math.min(100, bubble + d));
      renderBubble();
      if (bubble >= 100) endGame(false);
    }

    function spawn() {
      if (!alive) return;
      // 알고리즘은 비슷한 것(게임 영상)을 훨씬 자주 추천!
      const isSame = Math.random() < 0.72;
      const data = isSame ? SAME : pick(DIVERSE);
      const el = document.createElement('button');
      el.className = 'big-emoji-item';
      el.style.cssText = `left:${randInt(6, 80)}%;top:${randInt(16, 74)}%;font-size:46px;border:none;background:none;`;
      el.innerHTML = `${data.e}<div class="item-label" style="${isSame ? 'background:#ffe3ef;' : 'background:#e3f7ec;'}">${isSame ? '👍 추천!' : data.name}</div>`;
      area.appendChild(el);
      items.add(el);
      const ttl = setTimeout(() => { items.delete(el); el.remove(); }, isSame ? 2600 : 1900);

      el.addEventListener('pointerdown', (ev) => {
        if (!alive) return;
        clearTimeout(ttl);
        items.delete(el);
        el.remove();
        const bodyRect = ui.body.getBoundingClientRect();
        const x = ev.clientX - bodyRect.left, y = ev.clientY - bodyRect.top;
        if (isSame) {
          sameTaps++;
          score += 2;
          changeBubble(+9);
          sfx.tap();
          floatScore(ui.body, x, y, '+2 🫧거품이 커져요', false);
        } else {
          diverseTaps++;
          score += 12;
          changeBubble(-16);
          sfx.pop();
          floatScore(ui.body, x, y, '+12 거품 탈출!', true);
        }
        ui.setScore(score);
      });
    }

    // 아무것도 안 눌러도 알고리즘이 서서히 거품을 키움
    let pressureIv = null;

    function endGame(survived) {
      if (!alive) return;
      alive = false;
      timer?.stop();
      clearInterval(spawnIv);
      clearInterval(pressureIv);
      const ratio = diverseTaps / Math.max(1, diverseTaps + sameTaps);
      let stars = 1;
      if (survived) stars = score >= MAX_REF * 0.7 && ratio >= 0.4 ? 3 : score >= MAX_REF * 0.35 ? 2 : 1;
      ctx.finish({
        score,
        stars,
        msg: survived
          ? `새로운 영상 ${diverseTaps}개를 눌러 거품을 이겨냈어요!<br>다양하게 보는 습관이 필터버블을 막아요 🌈`
          : '앗, 추천 영상만 누르다 거품에 완전히 갇혔어요!<br>가끔은 새로운 주제를 스스로 찾아보세요 🚪',
      });
    }

    const stopCd = countdown(host, {
      title: '🫧 필터버블 탈출!',
      help: '👍추천 영상만 누르면 거품에 점점 갇혀요!<br>다른 주제 영상(초록)을 눌러 거품을 터뜨리며 버텨요!',
    }, () => {
      alive = true;
      spawnIv = setInterval(spawn, 650);
      pressureIv = setInterval(() => { if (alive) changeBubble(+2.5); }, 1000);
      timer = gameTimer(TIME, (t) => ui.setTime(t), () => endGame(true));
    });

    return () => { alive = false; stopCd(); timer?.stop(); clearInterval(spawnIv); clearInterval(pressureIv); };
  },
};
