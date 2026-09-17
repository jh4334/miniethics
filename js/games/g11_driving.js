// 11차시: 안전운전 자율주행 - 장애물 피하기 + 판단 정지 퀴즈
import { buildStage, countdown, floatScore, toast, pick, randInt, shuffle, frameScaler } from './engine.js';
import { sfx } from '../audio.js';

const OBSTACLES = ['🚧', '🐕', '⚽', '🛢️', '🚙'];
const JUDGES = [
  {
    q: '🚧 앞에 공사장! 자율주행 AI가 표지판을 헷갈려해요. 어떻게 할까요?',
    options: ['속도를 줄이고 사람이 함께 주변을 살핀다', 'AI만 믿고 그대로 빠르게 달린다', '눈을 감고 지나간다'],
    a: 0,
    why: '중요한 순간엔 사람이 함께 확인! 그게 안전이에요.',
  },
  {
    q: '💥 자율주행차가 사고를 냈다는 뉴스가 나왔어요. 책임은 누구에게 있을까요?',
    options: ['만든 회사, 사용한 사람, 사회가 함께 고민할 문제다', '아무도 책임지지 않아도 된다', '무조건 AI 로봇 혼자만의 잘못이다'],
    a: 0,
    why: 'AI의 실수는 여러 사람이 함께 규칙을 만들어 풀어야 할 문제예요.',
  },
  {
    q: '⚠️ 타고 있는 차의 AI가 이상하게 작동하는 것 같아요!',
    options: ['운전하는 어른에게 바로 말해 안전한 곳에 세우고, 만든 회사에도 알린다', '괜찮겠지 하고 그냥 계속 탄다', '재미있으니 아무에게도 말하지 않는다'],
    a: 0,
    why: '문제를 발견하면 솔직하게 알리는 것이 책임감 있는 행동이에요!',
  },
];
const TIME = 55;
const MAX_REF = 200;

export default {
  id: 11,
  mount(host, ctx) {
    const ui = buildStage(host, { time: TIME });
    let score = 0, dodged = 0, hits = 0, judgeOK = 0; // judgeOK = 첫 시도에 맞힌 판단 퀴즈 수
    const scale = frameScaler();
    let alive = false, paused = false;
    let lane = 1; // 0,1,2
    let rafId = null, spawnIv = null, tickIv = null;
    let remain = TIME;
    let judgeQueue = shuffle(JUDGES);
    let nextJudgeAt = [40, 25, 12]; // 남은 시간이 이 값일 때 판단 퀴즈
    const obstacles = new Set();
    const timeouts = [];

    ui.body.innerHTML = `
      <div class="road">
        <div class="lane-line" style="left:33.3%;"></div>
        <div class="lane-line" style="left:66.6%;"></div>
        <div class="obs-zone" style="position:absolute;inset:0;"></div>
        <div class="car">🚗</div>
        <div style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:13px;color:#dfe6ff;z-index:2;">
          👈 왼쪽/오른쪽 탭으로 차선 변경 👉
        </div>
      </div>
    `;
    const road = ui.body.querySelector('.road');
    const obsZone = ui.body.querySelector('.obs-zone');
    const car = ui.body.querySelector('.car');

    const laneX = (n) => `${n * 33.3 + 16.6}%`;
    function setLane(n) {
      lane = Math.max(0, Math.min(2, n));
      car.style.left = `calc(${laneX(lane)} - 28px)`;
      sfx.tap();
    }
    setLane(1);

    road.addEventListener('pointerdown', (e) => {
      if (!alive || paused) return;
      const rect = road.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      setLane(lane + (x < 0.5 ? -1 : 1));
    });

    function spawnObstacle() {
      if (!alive || paused) return;
      const l = randInt(0, 2);
      const el = document.createElement('div');
      el.className = 'obstacle';
      el.textContent = pick(OBSTACLES);
      el.style.left = `calc(${laneX(l)} - 23px)`;
      el.style.top = '-60px';
      el.dataset.lane = l;
      el.dataset.speed = 2.6 + Math.random() * 1.6;
      el.dataset.scored = '0';
      obsZone.appendChild(el);
      obstacles.add(el);
    }

    function loop(now) {
      if (!alive) return;
      const dt = scale(now);
      if (!paused) {
        const h = road.clientHeight;
        const carTop = h - 92;
        obstacles.forEach((el) => {
          const y = parseFloat(el.style.top) + parseFloat(el.dataset.speed) * dt;
          el.style.top = `${y}px`;
          if (el.dataset.scored === '0' && y > carTop && y < carTop + 60 && Number(el.dataset.lane) === lane) {
            el.dataset.scored = '1';
            hits++;
            score = Math.max(0, score - 10);
            ui.setScore(score);
            sfx.bad();
            car.style.animation = 'shake 0.3s ease';
            timeouts.push(setTimeout(() => { car.style.animation = ''; }, 350));
            floatScore(ui.body, road.clientWidth / 2, carTop, '💥 -10', false);
          } else if (el.dataset.scored === '0' && y >= carTop + 60) {
            el.dataset.scored = '1';
            dodged++;
            score += 4;
            ui.setScore(score);
          }
          if (y > h) { obstacles.delete(el); el.remove(); }
        });
      }
      rafId = requestAnimationFrame(loop);
    }

    function showJudge() {
      if (!alive || !judgeQueue.length) return;
      paused = true;
      sfx.tick();
      const data = judgeQueue.shift();
      const order = shuffle(data.options.map((t, i) => ({ t, ok: i === data.a })));
      const modal = document.createElement('div');
      modal.className = 'judge-modal';
      modal.innerHTML = `
        <div class="jm-card">
          <div style="font-family:var(--font-title);font-size:20px;color:#4a6cff;">🚦 판단 정지! 잠깐 생각해요</div>
          <div class="jm-q">${data.q}</div>
          <div class="jm-options">${order.map((o, i) => `<button data-ok="${o.ok ? 1 : 0}">${o.t}</button>`).join('')}</div>
        </div>
      `;
      ui.body.appendChild(modal);
      let tries = 0;
      modal.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => {
          if (b.disabled) return;
          tries++;
          if (b.dataset.ok === '1') {
            // 첫 시도 정답만 온전히 인정, 다시 골라 맞힌 건 작은 점수
            const first = tries === 1;
            if (first) judgeOK++;
            score += first ? 25 : 5;
            sfx.good();
            ui.setScore(score);
            toast(ui.body, first ? `⭕ 훌륭한 판단! ${data.why}` : `👍 두 번째 만에 맞혔어요. ${data.why}`, 1600);
            modal.remove();
            paused = false;
          } else {
            sfx.bad();
            b.disabled = true;
            b.style.background = '#ffecec';
            b.style.opacity = '0.6';
            toast(ui.body, `🤔 다시 생각해 봐요! 가장 안전하고 책임감 있는 선택은?`, 1400);
          }
        });
      });
    }

    const stopCd = countdown(host, {
      title: '🚗 안전운전 자율주행',
      help: '왼쪽/오른쪽을 탭해 장애물을 피해요!<br>가끔 <b>판단 정지</b> 질문이 나오면 가장 안전한 답을 골라요 🚦',
    }, () => {
      alive = true;
      rafId = requestAnimationFrame(loop);
      spawnIv = setInterval(spawnObstacle, 750);
      tickIv = setInterval(() => {
        if (!alive || paused) return;
        remain--;
        ui.setTime(remain);
        if (remain <= 5 && remain > 0) sfx.tick();
        if (nextJudgeAt.includes(remain)) showJudge();
        if (remain <= 0) {
          alive = false;
          clearInterval(spawnIv);
          clearInterval(tickIv);
          cancelAnimationFrame(rafId);
          const ratio = score / MAX_REF;
          ctx.finish({
            score,
            stars: judgeOK === 3 && ratio >= 0.5 ? 3 : ratio >= 0.35 ? 2 : 1,
            msg: `장애물 ${dodged}개 회피, 판단 퀴즈 ${judgeOK}/3 첫 시도 성공!<br>AI 운전도 사람의 확인과 책임이 함께해야 안전해요 🦺`,
          });
        }
      }, 1000);
    });

    return () => { alive = false; stopCd(); clearInterval(spawnIv); clearInterval(tickIv); cancelAnimationFrame(rafId); timeouts.forEach(clearTimeout); };
  },
};
