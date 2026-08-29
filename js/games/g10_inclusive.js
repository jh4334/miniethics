// 10차시: 모두의 AI 연구소 - 어려움을 겪는 친구에게 알맞은 도움 기능 드래그 매칭
import { buildStage, countdown, gameTimer, toast, shuffle } from './engine.js';
import { sfx } from '../audio.js';

const ROUNDS = [
  [
    { e: '👵', need: '"글자가 너무 작아서 안 보여요"', fix: '🔍 큰 글씨 모드' },
    { e: '🧏', need: '"소리를 들을 수 없어요"', fix: '💬 자막 기능' },
    { e: '👶', need: '"아직 글을 못 읽어요"', fix: '🔊 소리로 읽어주기' },
    { e: '🧑‍🦽', need: '"손을 움직이기 어려워요"', fix: '🎙️ 음성 명령' },
  ],
  [
    { e: '🌏', need: '"한국어가 아직 서툴러요"', fix: '🌐 번역 기능' },
    { e: '🙈', need: '"화면이 잘 안 보여요"', fix: '📢 화면 읽어주기' },
    { e: '👴', need: '"복잡한 앱은 너무 어려워요"', fix: '🧸 쉬운 화면 모드' },
    { e: '🗣️', need: '"사투리라서 AI가 못 알아들어요"', fix: '🎓 다양한 말투 학습' },
  ],
];
const TIME = 90;

export default {
  id: 10,
  mount(host, ctx) {
    const ui = buildStage(host, { time: TIME });
    let score = 0, matched = 0, wrong = 0, roundIdx = 0;
    let alive = false, timer = null;
    let cleanupDrag = [];
    const timeouts = [];

    ui.body.innerHTML = `<div class="match-board"></div>`;
    const board = ui.body.querySelector('.match-board');

    function finish(done) {
      if (!alive) return;
      alive = false;
      timer?.stop();
      const bonus = done ? Math.max(0, timer ? timer.remain : 0) * 2 : 0;
      score += bonus;
      ctx.finish({
        score,
        stars: done && wrong <= 2 ? 3 : done ? 2 : matched >= 4 ? 2 : 1,
        msg: done
          ? `모든 친구를 도왔어요! (시간 보너스 +${bonus})<br>모두를 생각하는 기술이 진짜 좋은 기술이에요 🌍`
          : `${matched}명의 친구를 도왔어요!<br>다양한 사람을 생각하는 마음이 자라고 있어요 🌱`,
      });
    }

    function renderRound() {
      cleanupDrag.forEach((fn) => fn());
      cleanupDrag = [];
      if (roundIdx >= ROUNDS.length) { finish(true); return; }
      const data = ROUNDS[roundIdx];
      const chips = shuffle(data.map((d) => d.fix));
      board.innerHTML = `
        <div style="text-align:center;font-size:15px;color:var(--ink-soft);">
          ${roundIdx + 1}라운드: 도움 기능을 알맞은 친구에게 드래그! 🤝
        </div>
        <div class="match-targets">
          ${data.map((d, i) => `
            <div class="match-target" data-fix="${d.fix}">
              <div class="mt-emoji">${d.e}</div>
              <div>${d.need}</div>
              <div class="mt-slot" style="font-family:var(--font-title);color:#21a45c;"></div>
            </div>`).join('')}
        </div>
        <div class="match-chips">
          ${chips.map((c) => `<div class="match-chip" data-fix="${c}">${c}</div>`).join('')}
        </div>
      `;
      let roundMatched = 0;

      board.querySelectorAll('.match-chip').forEach((chip) => {
        let startRect = null;
        const onDown = (e) => {
          if (!alive || chip.classList.contains('used')) return;
          startRect = chip.getBoundingClientRect();
          chip.classList.add('dragging');
          chip.style.left = `${e.clientX - startRect.width / 2}px`;
          chip.style.top = `${e.clientY - 30}px`;
          chip.setPointerCapture(e.pointerId);
          e.preventDefault();
        };
        const onMove = (e) => {
          if (!chip.classList.contains('dragging')) return;
          chip.style.left = `${e.clientX - startRect.width / 2}px`;
          chip.style.top = `${e.clientY - 30}px`;
          board.querySelectorAll('.match-target').forEach((t) => {
            const r = t.getBoundingClientRect();
            t.classList.toggle('drag-over',
              !t.classList.contains('matched') &&
              e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
          });
        };
        const onUp = (e) => {
          if (!chip.classList.contains('dragging')) return;
          chip.classList.remove('dragging');
          chip.style.left = '';
          chip.style.top = '';
          const target = [...board.querySelectorAll('.match-target')].find((t) => {
            const r = t.getBoundingClientRect();
            return !t.classList.contains('matched') &&
              e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
          });
          board.querySelectorAll('.match-target').forEach((t) => t.classList.remove('drag-over'));
          if (!target) return;
          if (target.dataset.fix === chip.dataset.fix) {
            target.classList.add('matched');
            target.querySelector('.mt-slot').textContent = `${chip.dataset.fix} ✓`;
            chip.classList.add('used');
            matched++; roundMatched++;
            score += 15;
            sfx.good();
            ui.setScore(score);
            if (roundMatched === data.length) {
              sfx.clear();
              toast(ui.body, roundIdx === 0 ? '🎉 1라운드 완료! 다음 친구들이 기다려요' : '🎉 모든 친구를 도왔어요!', 1100);
              roundIdx++;
              timeouts.push(setTimeout(renderRound, 1200));
            }
          } else {
            wrong++;
            score = Math.max(0, score - 3);
            sfx.bad();
            ui.setScore(score);
            target.style.animation = 'shake 0.3s ease';
            timeouts.push(setTimeout(() => { target.style.animation = ''; }, 350));
            toast(ui.body, '음... 이 친구에게 꼭 맞는 기능일까요? 🤔', 900);
          }
        };
        chip.addEventListener('pointerdown', onDown);
        chip.addEventListener('pointermove', onMove);
        chip.addEventListener('pointerup', onUp);
        chip.addEventListener('pointercancel', onUp);
        cleanupDrag.push(() => {
          chip.removeEventListener('pointerdown', onDown);
          chip.removeEventListener('pointermove', onMove);
          chip.removeEventListener('pointerup', onUp);
          chip.removeEventListener('pointercancel', onUp);
        });
      });
    }

    const stopCd = countdown(host, {
      title: '🌍 모두의 AI 연구소',
      help: 'AI를 쓰기 어려워하는 친구들이 있어요!<br>알맞은 <b>도움 기능</b>을 친구에게 드래그해서 연결해요 🤝',
    }, () => {
      alive = true;
      renderRound();
      timer = gameTimer(TIME, (t) => ui.setTime(t), () => finish(false));
    });

    return () => { alive = false; stopCd(); timer?.stop(); cleanupDrag.forEach((fn) => fn()); timeouts.forEach(clearTimeout); };
  },
};
