// 8차시: 챗봇 요리사 - 냄비를 움직여 좋은 질문 재료만 받기
// 재료는 떨어질 때 같은 색이라 글을 읽고 판단해야 하고, 냄비에 닿을 때 좋은/나쁜 이유가 드러남
import { buildStage, countdown, gameTimer, floatScore, toast, pick, randInt, frameScaler } from './engine.js';
import { sfx } from '../audio.js';

const GOOD = [
  { t: '구체적으로 말하기', why: '구체적일수록 딱 맞는 답!' },
  { t: '"부탁해요" 🙏', why: '예의 바른 말은 좋은 습관!' },
  { t: '목적 알려주기', why: '왜 필요한지 말하면 더 좋아요' },
  { t: '예시 들어주기', why: '예시가 있으면 AI가 잘 이해해요' },
  { t: '"고마워요" 💚', why: '고마움을 표현하는 멋진 태도!' },
  { t: '쉬운 말로 부탁', why: '"쉽게 설명해 줘"도 좋은 질문!' },
  { t: '차근차근 질문', why: '한 번에 하나씩 물으면 정확해요' },
];
const BAD = [
  { t: '나쁜 말 😡', why: '나쁜 말은 내 습관이 돼요' },
  { t: '내 주소 알려주기', why: '개인정보는 넣지 않아요!' },
  { t: '"대충 해줘"', why: '대충 물으면 대충 답해요' },
  { t: '숙제 통째로 맡기기', why: '내가 먼저 생각해야 해요' },
  { t: '거짓말 부탁', why: '속이는 부탁은 안 돼요' },
  { t: '비밀번호 입력', why: '비밀번호는 절대 안 돼요!' },
  { t: '친구 험담', why: '친구를 깎아내리는 말은 안 돼요' },
];
const TIME = 50;
const MAX_REF = 200;

export default {
  id: 8,
  mount(host, ctx) {
    const ui = buildStage(host, { time: TIME });
    let score = 0, goodCount = 0, badCount = 0;
    let alive = false, timer = null, spawnIv = null, rafId = null;
    let potX = 0.5; // 0~1 비율
    const falling = new Set();
    const scale = frameScaler();

    ui.body.innerHTML = `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#fff6e8,#ffeeda);overflow:hidden;">
        <div style="position:absolute;top:8px;left:0;right:0;text-align:center;font-size:14px;color:var(--ink-soft);z-index:2;pointer-events:none;">
          🥕 재료에 적힌 말을 읽고 좋은 질문 재료만 냄비에 담아요! (손가락으로 냄비 이동)
        </div>
        <div class="fall-zone" style="position:absolute;inset:0;pointer-events:none;"></div>
        <div class="pot" style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);text-align:center;z-index:6;pointer-events:none;">
          <div style="font-size:70px;line-height:1;">🍲</div>
          <div class="pot-say" style="font-size:13px;color:var(--ink-soft);white-space:nowrap;">좋은 답변 요리 중...</div>
        </div>
      </div>
    `;
    const zone = ui.body.querySelector('.fall-zone');
    const pot = ui.body.querySelector('.pot');
    const potSay = ui.body.querySelector('.pot-say');

    function movePot(clientX) {
      const rect = ui.body.getBoundingClientRect();
      potX = Math.max(0.08, Math.min(0.92, (clientX - rect.left) / rect.width));
      pot.style.left = `${potX * 100}%`;
    }
    // 재료·냄비는 pointer-events:none 이라 항상 game-body가 터치 대상이 되고,
    // 포인터 캡처로 손가락이 요소 밖으로 나가도 계속 따라옴 (iOS Safari 대응)
    let activeId = null;
    ui.body.addEventListener('pointerdown', (e) => {
      if (!alive || e.isPrimary === false) return;
      activeId = e.pointerId;
      ui.body.setPointerCapture?.(e.pointerId);
      movePot(e.clientX);
    });
    ui.body.addEventListener('pointermove', (e) => {
      if (!alive || e.pointerId !== activeId) return;
      movePot(e.clientX);
    });
    const release = (e) => { if (e.pointerId === activeId) activeId = null; };
    ui.body.addEventListener('pointerup', release);
    ui.body.addEventListener('pointercancel', release);

    function spawn() {
      if (!alive) return;
      const isGood = Math.random() < 0.58;
      const item = pick(isGood ? GOOD : BAD);
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute;top:-46px;left:${randInt(6, 78)}%;z-index:4;padding:8px 14px;border-radius:999px;
        font-size:16px;white-space:nowrap;box-shadow:0 3px 0 rgba(58,58,85,0.12);
        background:#fff9ec;border:2px solid #ffd66b;pointer-events:none;`;
      el.textContent = item.t;
      el.dataset.good = isGood ? '1' : '0';
      el.dataset.why = item.why;
      el.dataset.speed = 1.4 + Math.random() * 1.1;
      zone.appendChild(el);
      falling.add(el);
    }

    function loop(now) {
      if (!alive) return;
      const dt = scale(now);
      const bodyRect = ui.body.getBoundingClientRect();
      const potRect = pot.getBoundingClientRect();
      falling.forEach((el) => {
        const y = parseFloat(el.style.top) + parseFloat(el.dataset.speed) * dt;
        el.style.top = `${y}px`;
        const r = el.getBoundingClientRect();
        // 냄비와 충돌?
        if (r.bottom >= potRect.top + 14 && r.bottom <= potRect.bottom &&
            r.left < potRect.right - 8 && r.right > potRect.left + 8) {
          falling.delete(el);
          el.remove();
          const x = r.left - bodyRect.left, yy = r.top - bodyRect.top;
          if (el.dataset.good === '1') {
            goodCount++; score += 10; sfx.pop();
            floatScore(ui.body, x, yy, `+10 ${el.dataset.why}`, true);
            potSay.textContent = '맛있는 재료! 답변이 좋아져요';
          } else {
            badCount++; score = Math.max(0, score - 10); sfx.bad();
            floatScore(ui.body, x, yy, `-10 ${el.dataset.why}`, false);
            potSay.textContent = '으엑! 나쁜 재료는 안 돼요!';
            pot.style.animation = 'shake 0.3s ease';
            setTimeout(() => { pot.style.animation = ''; }, 350);
          }
          ui.setScore(score);
          return;
        }
        if (r.top > bodyRect.bottom) { falling.delete(el); el.remove(); }
      });
      rafId = requestAnimationFrame(loop);
    }

    const stopCd = countdown(host, {
      title: '👨‍🍳 챗봇 요리사',
      help: '냄비를 좌우로 움직여 재료를 받아요!<br>재료에 적힌 말을 읽고 <b>좋은 질문 재료</b>만 담고, 나쁜 재료는 피해요 💨',
    }, () => {
      alive = true;
      rafId = requestAnimationFrame(loop);
      spawnIv = setInterval(spawn, 800);
      timer = gameTimer(TIME, (t) => ui.setTime(t), () => {
        alive = false;
        clearInterval(spawnIv);
        cancelAnimationFrame(rafId);
        const ratio = score / MAX_REF;
        const dish = ratio >= 0.7 ? '🍱 최고급 답변 정식' : ratio >= 0.35 ? '🍛 맛있는 답변 카레' : '🍙 소박한 답변 주먹밥';
        ctx.finish({
          score,
          stars: ratio >= 0.7 ? 3 : ratio >= 0.35 ? 2 : 1,
          msg: `완성된 요리: <b>${dish}</b>! (좋은 재료 ${goodCount}개, 나쁜 재료 ${badCount}개)<br>좋은 재료(질문)를 넣을수록 좋은 요리(답변)가 나와요!`,
        });
      });
    });

    return () => { alive = false; stopCd(); timer?.stop(); clearInterval(spawnIv); cancelAnimationFrame(rafId); };
  },
};
