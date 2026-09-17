// 5차시: 개인정보 지킴이 - 두더지잡기식 반응 게임
// 개인정보 카드는 재빨리 탭(방패!), 안전한 정보는 그대로 두기
import { buildStage, countdown, gameTimer, floatScore, toast, starsFromRatio, pick, randInt } from './engine.js';
import { sfx } from '../audio.js';

const PRIVATE = [
  { e: '🏠', name: '집 주소' },
  { e: '📞', name: '전화번호' },
  { e: '🤳', name: '얼굴 사진' },
  { e: '🔑', name: '비밀번호' },
  { e: '📛', name: '이름 + 학교' },
  { e: '💳', name: '카드 번호' },
  { e: '📍', name: '현재 위치' },
];
const SAFE = [
  { e: '🎨', name: '좋아하는 색' },
  { e: '⚽', name: '취미' },
  { e: '🍕', name: '좋아하는 음식' },
  { e: '🌤️', name: '오늘 날씨' },
  { e: '📚', name: '좋아하는 책' },
  { e: '🐶', name: '좋아하는 동물' },
];
const TIME = 45;
const MAX_REF = 240;

export default {
  id: 5,
  mount(host, ctx) {
    const ui = buildStage(host, { time: TIME });
    let score = 0, alive = false, timer = null, spawnIv = null;
    let blocked = 0, leaked = 0, wrongTaps = 0;
    const timeouts = [];

    ui.body.innerHTML = `
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;">
        <div style="text-align:center;padding:8px;font-size:15px;color:var(--ink-soft);">
          🛡️ <b>개인정보</b>만 탭해서 막아요! 안전한 정보는 그대로 두세요
        </div>
        <div class="mole-grid" style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:12px;padding:14px;"></div>
      </div>
    `;
    const grid = ui.body.querySelector('.mole-grid');
    const holes = [];
    for (let i = 0; i < 9; i++) {
      const hole = document.createElement('div');
      hole.style.cssText = `
        background:#f4f6fc;border-radius:20px;display:flex;align-items:center;justify-content:center;
        position:relative;overflow:hidden;`;
      grid.appendChild(hole);
      holes.push({ el: hole, busy: false });
    }

    function popUp() {
      if (!alive) return;
      const free = holes.filter((h) => !h.busy);
      if (!free.length) return;
      const hole = pick(free);
      hole.busy = true;
      const isPrivate = Math.random() < 0.55;
      const item = pick(isPrivate ? PRIVATE : SAFE);
      const card = document.createElement('button');
      card.style.cssText = `
        border:none;cursor:pointer;width:92%;height:88%;border-radius:16px;font-family:inherit;
        background:${isPrivate ? '#fff' : '#fff'};box-shadow:0 4px 0 rgba(58,58,85,0.1);
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
        animation:pop-in 0.2s ease;`;
      card.innerHTML = `<span style="font-size:42px;">${item.e}</span><span style="font-size:14px;">${item.name}</span>`;
      hole.el.appendChild(card);

      let resolved = false;
      const lifetime = randInt(1300, 1900);
      const tid = setTimeout(() => {
        if (resolved || !alive) return;
        resolved = true;
        card.remove();
        hole.busy = false;
        if (isPrivate) {
          // 개인정보를 못 막고 놓침 = 유출!
          leaked++;
          score = Math.max(0, score - 8);
          ui.setScore(score);
          sfx.bad();
          toast(ui.body, `😱 ${item.name} 유출! -8`, 1000);
        }
      }, lifetime);
      timeouts.push(tid);

      card.addEventListener('pointerdown', (ev) => {
        if (resolved || !alive) return;
        resolved = true;
        clearTimeout(tid);
        const bodyRect = ui.body.getBoundingClientRect();
        const x = ev.clientX - bodyRect.left, y = ev.clientY - bodyRect.top;
        if (isPrivate) {
          blocked++;
          score += 12;
          sfx.good();
          card.innerHTML = `<span style="font-size:46px;">🛡️</span><span style="font-size:14px;">막았다!</span>`;
          floatScore(ui.body, x, y, '+12', true);
        } else {
          // 안전한 정보를 막으면 개인정보를 막은 만큼 감점: 읽지 않고 전부 탭하는 전략이 이득이 되지 않게
          wrongTaps++;
          score = Math.max(0, score - 10);
          sfx.bad();
          card.innerHTML = `<span style="font-size:46px;">😅</span><span style="font-size:13px;">이건 괜찮은 정보!</span>`;
          floatScore(ui.body, x, y, '-10 괜찮은 정보예요', false);
        }
        ui.setScore(score);
        const t2 = setTimeout(() => { card.remove(); hole.busy = false; }, 420);
        timeouts.push(t2);
      });
    }

    const stopCd = countdown(host, {
      title: '🛡️ 개인정보 지킴이',
      help: '뿅! 하고 나타나는 카드 중 <b>개인정보</b>(주소, 전화번호, 비밀번호...)만<br>재빨리 탭해서 방패로 막아요! 놓치면 유출 😱',
    }, () => {
      alive = true;
      spawnIv = setInterval(popUp, 620);
      timer = gameTimer(TIME, (t) => ui.setTime(t), () => {
        alive = false;
        clearInterval(spawnIv);
        // 별점: 점수 + '괜찮은 정보를 막은 횟수'가 적어야 높은 별
        let stars = starsFromRatio(score / MAX_REF);
        if (wrongTaps > 8) stars = Math.min(stars, 1);
        else if (wrongTaps > 3) stars = Math.min(stars, 2);
        ctx.finish({
          score,
          stars,
          msg: `개인정보 ${blocked}개를 지켰어요!${leaked ? ` (${leaked}개는 유출 😢)` : ''}${wrongTaps ? ` 괜찮은 정보를 ${wrongTaps}번 막았어요.` : ' 완벽한 보안관!'}<br>개인정보는 소중한 열쇠, 함부로 공개하지 않아요!`,
        });
      });
    });

    return () => { alive = false; stopCd(); timer?.stop(); clearInterval(spawnIv); timeouts.forEach(clearTimeout); };
  },
};
