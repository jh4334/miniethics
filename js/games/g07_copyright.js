// 7차시: 저작권 O/X 달리기 - 문장을 읽고 알맞은 문으로 달려 통과!
import { buildStage, countdown, toast, shuffle } from './engine.js';
import { sfx } from '../audio.js';

const STATEMENTS = [
  { s: 'AI로 만든 그림을 낼 때는 "AI 사용"을 밝히는 게 좋다', a: true, why: '정직하게 밝히는 것이 올바른 태도예요!' },
  { s: '친구가 그린 그림을 쓰려면 친구의 허락을 받아야 한다', a: true, why: '만든 사람의 허락, 꼭 필요해요!' },
  { s: '무료 이미지도 사용 조건을 확인해야 한다', a: true, why: '무료여도 조건(출처 표시 등)이 있을 수 있어요.' },
  { s: '내가 그린 그림에도 저작권이 있다', a: true, why: '어린이의 작품에도 똑같이 저작권이 있어요!' },
  { s: '출처를 밝히는 것은 창작자를 존중하는 일이다', a: true, why: '출처 표시 = 노력을 존중하는 멋진 습관!' },
  { s: '인터넷에 있는 그림은 아무거나 마음대로 써도 된다', a: false, why: '인터넷에 있어도 주인이 있어요. 허락이나 조건 확인!' },
  { s: 'AI가 그려준 그림을 내가 그렸다고 말해도 된다', a: false, why: '거짓말은 안 돼요! AI를 썼다면 솔직하게 밝혀요.' },
  { s: '유명한 캐릭터를 허락 없이 그려서 팔아도 된다', a: false, why: '캐릭터에도 저작권이 있어서 함부로 팔면 안 돼요.' },
  { s: '남의 글을 그대로 베껴서 내 숙제로 내도 된다', a: false, why: '베끼는 것은 표절! 내 생각으로 써야 해요.' },
  { s: '저작권은 어른들만 지키면 되는 규칙이다', a: false, why: '저작권은 우리 모두가 지키는 약속이에요!' },
];

export default {
  id: 7,
  mount(host, ctx) {
    const ui = buildStage(host, { time: 0, scoreLabel: '점수' });
    host.querySelector('.hud-time').style.visibility = 'hidden';
    let score = 0, correct = 0, idx = 0, alive = false;
    let lane = 0; // 0=왼쪽(O), 1=오른쪽(X)
    let rafId = null;
    const timeouts = [];
    const deck = shuffle(STATEMENTS);

    ui.body.innerHTML = `
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#d8f3d8,#f0fbe8);overflow:hidden;">
        <div class="q-banner" style="position:absolute;top:10px;left:50%;transform:translateX(-50%);width:min(560px,92%);
          background:#fff;border-radius:16px;box-shadow:var(--shadow);padding:12px 16px;text-align:center;
          font-size:17px;line-height:1.45;z-index:8;"></div>
        <div class="gates" style="position:absolute;top:-120px;left:0;right:0;display:flex;z-index:4;">
          <div class="gate gate-o" style="flex:1;text-align:center;font-size:64px;">⭕</div>
          <div class="gate gate-x" style="flex:1;text-align:center;font-size:64px;">❌</div>
        </div>
        <div style="position:absolute;top:0;bottom:0;left:50%;width:5px;background:repeating-linear-gradient(180deg,#b7d9a8 0 26px,transparent 26px 52px);"></div>
        <div class="runner" style="position:absolute;bottom:34px;left:25%;transform:translateX(-50%);font-size:60px;transition:left 0.15s ease;z-index:6;">🏃</div>
        <div style="position:absolute;bottom:4px;left:0;right:0;display:flex;justify-content:space-around;font-size:14px;color:var(--ink-soft);z-index:2;">
          <span>👈 왼쪽 탭 = ⭕ 맞아요</span><span>오른쪽 탭 = ❌ 아니에요 👉</span>
        </div>
      </div>
    `;
    const banner = ui.body.querySelector('.q-banner');
    const gates = ui.body.querySelector('.gates');
    const runner = ui.body.querySelector('.runner');

    function setLane(n) {
      lane = n;
      runner.style.left = n === 0 ? '25%' : '75%';
      sfx.tap();
    }
    ui.body.addEventListener('pointerdown', (e) => {
      if (!alive) return;
      const rect = ui.body.getBoundingClientRect();
      setLane(e.clientX - rect.left < rect.width / 2 ? 0 : 1);
    });

    function nextRound() {
      if (!alive) return;
      if (idx >= deck.length) {
        alive = false;
        const ratio = correct / deck.length;
        ctx.finish({
          score,
          stars: ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1,
          msg: `${deck.length}개 문 중 ${correct}개를 바르게 통과!<br>창작물을 존중하는 마음, 멋져요 ©️`,
        });
        return;
      }
      const q = deck[idx];
      banner.innerHTML = `<b>Q${idx + 1}.</b> ${q.s}`;
      let y = -120;
      const bodyH = ui.body.clientHeight;
      const targetY = bodyH - 110;
      const speed = Math.max(2.2, bodyH / 260);

      function fall() {
        if (!alive) return;
        y += speed;
        gates.style.top = `${y}px`;
        if (y < targetY) { rafId = requestAnimationFrame(fall); return; }
        // 도착! 판정
        const choseO = lane === 0;
        const ok = choseO === q.a;
        if (ok) {
          correct++; score += 15; sfx.good();
          runner.textContent = '🙌';
          toast(ui.body, `⭕ 통과! ${q.why}`, 1400);
        } else {
          score = Math.max(0, score - 5); sfx.bad();
          runner.textContent = '💫';
          toast(ui.body, `❌ 쿵! ${q.why}`, 1600);
        }
        ui.setScore(score);
        idx++;
        gates.style.top = '-120px';
        timeouts.push(setTimeout(() => { runner.textContent = '🏃'; nextRound(); }, 1300));
      }
      rafId = requestAnimationFrame(fall);
    }

    const stopCd = countdown(host, {
      title: '🎨 저작권 O/X 달리기',
      help: '위의 문장을 읽고 맞으면 ⭕문, 틀리면 ❌문으로!<br>화면 왼쪽/오른쪽을 탭해서 달릴 방향을 정해요',
    }, () => { alive = true; nextRound(); });

    return () => { alive = false; stopCd(); cancelAnimationFrame(rafId); timeouts.forEach(clearTimeout); };
  },
};
