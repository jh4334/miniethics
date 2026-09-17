// 6차시: 진짜? 가짜! 탐정 - 단서를 읽고 스와이프로 판별
import { buildStage, countdown, gameTimer, toast, shuffle, draggable } from './engine.js';
import { sfx } from '../audio.js';

const CARDS = [
  { e: '🎤', title: '유명 가수의 신곡 발표 사진', clues: ['🖐️ 손가락이 6개다', '💡 그림자 방향이 제각각', '❓ 출처 표시가 없다'], real: false, why: 'AI가 만든 딥페이크 사진! 겉모습도 어색했지만 진짜 단서는 "출처가 없다"예요.' },
  { e: '👽', title: '"대통령, 외계인과 악수!" 영상', clues: ['😱 너무 충격적인 제목', '📰 다른 뉴스엔 전혀 없음', '👄 입 모양과 소리가 어긋남'], real: false, why: '딥페이크 영상! 충격적일수록 다른 뉴스와 비교해 봐야 해요.' },
  { e: '🍚', title: '"우리 학교 급식 폐지된대!"', clues: ['🗣️ 출처가 "누가 그러던데..."', '🏫 학교 공지에는 없는 얘기', '📅 언제부터인지도 안 나옴'], real: false, why: '출처 없는 소문! 학교 공지나 선생님께 확인해야 해요.' },
  { e: '💧', title: '"물만 마시면 시험 100점 비법"', clues: ['🤑 너무 좋기만 한 이야기', '🔬 과학적 근거가 없음', '🔗 수상한 광고 링크로 연결'], real: false, why: '가짜 정보! 너무 좋은 이야기는 일단 의심해 보세요.' },
  { e: '📱', title: '엄마 목소리 전화 "급해, 돈 보내줘"', clues: ['🎙️ 목소리는 진짜 같음', '💸 갑자기 돈을 요구함', '⏰ 지금 당장 하라고 재촉'], real: false, why: 'AI 딥보이스 사기일 수 있어요! 목소리가 같아도 끊고, 아는 번호로 직접 다시 전화해 확인!' },
  { e: '🌧️', title: '기상청 "내일 큰 비 소식"', clues: ['🏛️ 공식 기관의 발표', '📰 여러 뉴스가 똑같이 보도', '🌐 기상청 홈페이지에도 있음'], real: true, why: '진짜 정보! 공식 기관 + 여러 곳에서 확인되면 믿을 만해요.' },
  { e: '📚', title: '도서관 주말 휴관 안내문', clues: ['🏛️ 도서관 공식 홈페이지 공지', '📞 전화로도 확인 가능', '📅 날짜와 이유가 명확함'], real: true, why: '진짜 공지! 공식 홈페이지와 전화로 확인할 수 있어요.' },
  { e: '🐼', title: '동물원 아기 판다 탄생 뉴스', clues: ['🏛️ 동물원 공식 발표', '📷 여러 각도의 자연스러운 사진', '📰 기자 이름과 날짜가 있음'], real: true, why: '진짜 뉴스! 출처와 기자, 날짜가 분명하면 신뢰도가 높아요.' },
  { e: '🏃', title: '학교 운동회 날짜 안내장', clues: ['🧑‍🏫 담임 선생님이 직접 나눠줌', '🏫 학교 도장이 찍혀 있음', '📅 날짜·장소가 정확함'], real: true, why: '진짜 안내장! 믿을 수 있는 사람이 직접 준 공식 문서예요.' },
  { e: '🏛️', title: '박물관 어린이 무료입장 소식', clues: ['✅ 박물관 공식 SNS 계정', '📅 기간과 조건이 명확', '🌐 홈페이지에도 같은 내용'], real: true, why: '진짜 이벤트! 공식 계정과 홈페이지가 일치하면 안심!' },
];

const TIME = 120; // 단서를 꼼꼼히 읽을 시간 (카드당 약 12초)

export default {
  id: 6,
  mount(host, ctx) {
    const ui = buildStage(host, { time: TIME, scoreLabel: '점수' });
    let score = 0, correct = 0, idx = 0, alive = false, timer = null;
    let unDrag = null;
    const deck = shuffle(CARDS);
    const timeouts = [];

    ui.body.innerHTML = `
      <div class="swipe-hint"><span>👈 가짜야!</span><span>진짜야! 👉</span></div>
      <div class="card-slot" style="position:absolute;inset:0;"></div>
    `;
    const slot = ui.body.querySelector('.card-slot');

    function finish() {
      if (!alive) return;
      alive = false;
      timer?.stop();
      // 별점은 '답한 카드 중 정답 비율'로 (시간이 모자라 못 본 카드는 오답으로 세지 않음)
      const answered = idx;
      const ratio = answered ? correct / answered : 0;
      const stars = answered >= 8 && ratio >= 0.9 ? 3 : answered >= 6 && ratio >= 0.7 ? 2 : 1;
      ctx.finish({
        score,
        stars,
        msg: `${answered}장 중 ${correct}장을 정확히 판별했어요!${answered < CARDS.length ? ' (시간이 조금 부족했어요 ⏰)' : ''}<br>단서 확인 습관이 명탐정을 만들어요 🔎`,
      });
    }

    function showCard() {
      if (!alive) return;
      if (idx >= deck.length) { finish(); return; }
      const data = deck[idx];
      const card = document.createElement('div');
      card.className = 'swipe-card';
      card.innerHTML = `
        <div style="font-size:13px;color:var(--ink-soft);">단서 ${idx + 1} / ${deck.length}</div>
        <div class="sc-emoji">${data.e}</div>
        <div class="sc-title">${data.title}</div>
        <div class="sc-clues">${data.clues.join('<br>')}</div>
        <div class="swipe-stamp left">가짜!</div>
        <div class="swipe-stamp right">진짜!</div>
      `;
      slot.appendChild(card);
      const stampL = card.querySelector('.swipe-stamp.left');
      const stampR = card.querySelector('.swipe-stamp.right');

      const decide = (saidReal) => {
        unDrag?.(); unDrag = null;
        const ok = saidReal === data.real;
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        card.style.transform = `translate(calc(-50% + ${saidReal ? 480 : -480}px), -50%) rotate(${saidReal ? 20 : -20}deg)`;
        card.style.opacity = '0';
        if (ok) { correct++; score += 15; sfx.good(); }
        else { score = Math.max(0, score - 5); sfx.bad(); }
        ui.setScore(score);
        toast(ui.body, `${ok ? '⭕ 정답!' : '❌ 앗!'} ${data.why}`, 1500);
        idx++;
        timeouts.push(setTimeout(() => { card.remove(); showCard(); }, 700));
      };

      unDrag = draggable(card, {
        onStart() { card.style.transition = 'none'; },
        onMove(p) {
          card.style.transform = `translate(calc(-50% + ${p.dx}px), calc(-50% + ${p.dy * 0.25}px)) rotate(${p.dx * 0.05}deg)`;
          stampL.style.opacity = Math.min(1, Math.max(0, -p.dx / 90));
          stampR.style.opacity = Math.min(1, Math.max(0, p.dx / 90));
        },
        onEnd(p) {
          if (p.dx > 90) decide(true);
          else if (p.dx < -90) decide(false);
          else {
            card.style.transition = 'transform 0.2s ease';
            card.style.transform = 'translate(-50%, -50%)';
            stampL.style.opacity = 0;
            stampR.style.opacity = 0;
          }
        },
      });
    }

    const stopCd = countdown(host, {
      title: '🕵️ 진짜? 가짜! 탐정',
      help: '단서 3개를 꼼꼼히 읽고 판별!<br>가짜 같으면 👈왼쪽, 진짜 같으면 오른쪽👉으로 카드를 밀어요',
    }, () => {
      alive = true;
      showCard();
      timer = gameTimer(TIME, (t) => ui.setTime(t), finish);
    });

    return () => { alive = false; stopCd(); timer?.stop(); unDrag?.(); timeouts.forEach(clearTimeout); };
  },
};
