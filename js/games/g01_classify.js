// 1차시: AI야? 아니야? - 빠른 판별 탭 게임
import { buildStage, countdown, gameTimer, floatScore, toast, starsFromRatio, shuffle } from './engine.js';
import { sfx } from '../audio.js';

const ITEMS = [
  { e: '🔊', name: '스마트 스피커', ai: true, why: '말을 알아듣고 대답해요' },
  { e: '🌐', name: '번역 앱', ai: true, why: '문장을 배우고 스스로 번역해요' },
  { e: '🚗', name: '자율주행차', ai: true, why: '도로를 보고 스스로 판단해요' },
  { e: '📷', name: '얼굴 인식 카메라', ai: true, why: '얼굴을 배우고 알아봐요' },
  { e: '💬', name: 'AI 챗봇', ai: true, why: '대화를 배우고 대답을 만들어요' },
  { e: '🧹', name: '로봇 청소기', ai: true, why: '집 구조를 배우고 길을 찾아요' },
  { e: '📺', name: '영상 추천 기능', ai: true, why: '내 취향을 배우고 골라줘요' },
  { e: '🎨', name: '그림 생성 AI', ai: true, why: '그림을 배우고 새로 만들어요' },
  { e: '🌀', name: '선풍기', ai: false, why: '정해진 대로 돌기만 해요' },
  { e: '🚲', name: '자전거', ai: false, why: '내 다리 힘으로 움직여요' },
  { e: '✏️', name: '연필', ai: false, why: '스스로 배우지 않아요' },
  { e: '🫖', name: '주전자', ai: false, why: '물만 끓일 뿐이에요' },
  { e: '☂️', name: '우산', ai: false, why: '판단하는 기능이 없어요' },
  { e: '🥄', name: '숟가락', ai: false, why: '그냥 도구일 뿐이에요' },
  { e: '⚽', name: '축구공', ai: false, why: '스스로 생각하지 않아요' },
  { e: '🧦', name: '양말', ai: false, why: '배우거나 판단하지 않아요' },
];

const TIME = 45;
const MAX_REF = 200; // 별 3개 기준 점수

export default {
  id: 1,
  mount(host, ctx) {
    const ui = buildStage(host, { time: TIME });
    let score = 0, combo = 0, timer = null, alive = true;
    let queue = shuffle(ITEMS);
    let qi = 0;
    let current = null;

    ui.body.innerHTML = `
      <div style="flex:1;display:flex;flex-direction:column;">
        <div class="q-item" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;">
          <div class="qi-emoji" style="font-size:96px;"></div>
          <div class="qi-name" style="font-family:var(--font-title);font-size:26px;"></div>
          <div class="qi-combo" style="font-size:16px;color:var(--ink-soft);height:22px;"></div>
        </div>
        <div class="choice-buttons">
          <button class="btn btn-green" data-ans="1">🤖 AI 맞아!</button>
          <button class="btn btn-pink" data-ans="0">❌ AI 아니야!</button>
        </div>
      </div>
    `;
    const emojiEl = ui.body.querySelector('.qi-emoji');
    const nameEl = ui.body.querySelector('.qi-name');
    const comboEl = ui.body.querySelector('.qi-combo');

    function next() {
      if (qi >= queue.length) { queue = shuffle(ITEMS); qi = 0; }
      current = queue[qi++];
      emojiEl.textContent = current.e;
      nameEl.textContent = current.name;
      emojiEl.style.animation = 'none';
      void emojiEl.offsetWidth;
      emojiEl.style.animation = 'pop-in 0.25s ease';
    }

    function answer(saidAI, btn) {
      if (!alive || !current) return;
      const r = btn.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      const correct = saidAI === current.ai;
      if (correct) {
        combo++;
        const gain = 10 + Math.min(combo - 1, 5) * 2;
        score += gain;
        sfx.good();
        floatScore(ui.body, r.left - h.left + r.width / 2, r.top - h.top - 30, `+${gain}`, true);
        comboEl.textContent = combo >= 2 ? `🔥 ${combo}연속 정답!` : '';
      } else {
        combo = 0;
        score = Math.max(0, score - 5);
        sfx.bad();
        floatScore(ui.body, r.left - h.left + r.width / 2, r.top - h.top - 30, '-5', false);
        toast(ui.body, `${current.e} ${current.name}: ${current.why}`, 1400);
        comboEl.textContent = '';
      }
      ui.setScore(score);
      next();
    }

    ui.body.querySelectorAll('.choice-buttons .btn').forEach((btn) => {
      btn.addEventListener('click', () => answer(btn.dataset.ans === '1', btn));
    });

    const stopCd = countdown(host, {
      title: '🤖 AI야? 아니야?',
      help: '물건을 보고 인공지능이 들어있는지 판단해요!<br>연속으로 맞히면 콤보 보너스가 있어요 🔥',
    }, () => {
      next();
      timer = gameTimer(TIME, (t) => ui.setTime(t), () => {
        alive = false;
        ctx.finish({
          score,
          stars: starsFromRatio(score / MAX_REF),
          msg: 'AI는 스스로 배우고 판단하는 기술!<br>이제 주변의 AI를 찾아낼 수 있겠죠?',
        });
      });
    });

    return () => { alive = false; stopCd(); timer?.stop(); };
  },
};
