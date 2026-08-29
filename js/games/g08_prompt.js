// 8차시: 챗봇 요리사 - 냄비를 움직여 좋은 질문 재료만 받기
import { buildStage, countdown, gameTimer, floatScore, toast, pick, randInt } from './engine.js';
import { sfx } from '../audio.js';

const GOOD = ['구체적으로 말하기', '"부탁해요" 🙏', '목적 알려주기', '예시 들어주기', '"고마워요" 💚', '쉬운 말로 부탁', '차근차근 질문'];
const BAD = ['나쁜 말 😡', '내 주소 알려주기', '"대충 해줘"', '숙제 통째로 맡기기', '거짓말 부탁', '비밀번호 입력', '친구 험담'];
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

    ui.body.innerHTML = `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#fff6e8,#ffeeda);overflow:hidden;">
        <div style="position:absolute;top:8px;left:0;right:0;text-align:center;font-size:14px;color:var(--ink-soft);z-index:2;">
          🥕 좋은 질문 재료(초록)만 냄비에! 손가락으로 냄비를 움직여요
        </div>
        <div class="fall-zone" style="position:absolute;inset:0;"></div>
        <div class="pot" style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);text-align:center;z-index:6;">
          <div style="font-size:70px;line-height:1;">🍲</div>
          <div class="pot-say" style="font-size:13px;color:var(--ink-soft);">좋은 답변 요리 중...</div>
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
    ui.body.addEventListener('pointerdown', (e) => { if (alive) movePot(e.clientX); });
    ui.body.addEventListener('pointermove', (e) => {
      if (alive && (e.buttons > 0 || e.pointerType === 'touch')) movePot(e.clientX);
    });

    function spawn() {
      if (!alive) return;
      const isGood = Math.random() < 0.58;
      const text = pick(isGood ? GOOD : BAD);
      const el = document.createElement('div');
      el.style.cssText = `
        position:absolute;top:-46px;left:${randInt(6, 78)}%;z-index:4;padding:8px 14px;border-radius:999px;
        font-size:15px;white-space:nowrap;box-shadow:0 3px 0 rgba(58,58,85,0.12);
        background:${isGood ? '#e3f7ec' : '#ffecec'};border:2px solid ${isGood ? '#7ddba3' : '#ff9d9d'};`;
      el.textContent = text;
      el.dataset.good = isGood ? '1' : '0';
      el.dataset.speed = 1.4 + Math.random() * 1.1;
      zone.appendChild(el);
      falling.add(el);
    }

    function loop() {
      if (!alive) return;
      const bodyRect = ui.body.getBoundingClientRect();
      const potRect = pot.getBoundingClientRect();
      falling.forEach((el) => {
        const y = parseFloat(el.style.top) + parseFloat(el.dataset.speed);
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
            floatScore(ui.body, x, yy, '+10 냠!', true);
            potSay.textContent = '맛있는 재료! 답변이 좋아져요';
          } else {
            badCount++; score = Math.max(0, score - 10); sfx.bad();
            floatScore(ui.body, x, yy, '-10 💨', false);
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
      help: '냄비를 좌우로 움직여 <b>좋은 질문 재료(초록)</b>를 받아요!<br>나쁜 재료(빨강)를 받으면 요리를 망쳐요 💨',
    }, () => {
      alive = true;
      loop();
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
          msg: `완성된 요리: <b>${dish}</b>!<br>좋은 재료(질문)를 넣을수록 좋은 요리(답변)가 나와요!`,
        });
      });
    });

    return () => { alive = false; stopCd(); timer?.stop(); clearInterval(spawnIv); cancelAnimationFrame(rafId); };
  },
};
