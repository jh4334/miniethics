import type { SceneManager, SceneParams } from '../core/scene';
import { el, button } from '../ui/components';
import { getLesson } from '../data/curriculum';
import { save } from '../core/save';
import { audio } from '../core/audio';

export function resultScene(mgr: SceneManager) {
  return (root: HTMLElement, params: SceneParams) => {
    const lesson = getLesson(Number(params.lessonId));
    const gameScore = Number(params.score ?? 0);
    const scene = el('div', 'scene result-scene');
    root.appendChild(scene);

    // 게임을 끝낸 시점에 즉시 최소 기록(별1)을 저장한다.
    // 퀴즈 도중 이탈·새로고침해도 클리어가 사라지지 않고, 퀴즈 완료 시 상향 갱신된다.
    save.report(lesson.id, 1, gameScore, 0);

    // ---------- 1단계: 배움 정리 카드 ----------
    function showSummary() {
      scene.innerHTML = '';
      const card = el('div', 'card summary-card');
      card.innerHTML = `
        <div class="badge">✨ 오늘의 배움 정리</div>
        <h2>${lesson.id}차시 · ${lesson.title}</h2>
        <ul>${lesson.summary.map((s) => `<li>${s}</li>`).join('')}</ul>`;
      const next = button('확인 퀴즈 풀기 ✏️', showQuiz, 'btn big mint');
      next.style.marginTop = '22px';
      card.appendChild(next);
      scene.appendChild(card);
      audio.good();
    }

    // ---------- 2단계: 확인 퀴즈 ----------
    let quizCorrect = 0;
    let qIdx = 0;

    function showQuiz() {
      scene.innerHTML = '';
      const q = lesson.quiz[qIdx];
      const card = el('div', 'card quiz-card');
      card.innerHTML = `
        <div class="quiz-progress">확인 퀴즈 ${qIdx + 1} / ${lesson.quiz.length}</div>
        <h3>Q${qIdx + 1}. ${q.q}</h3>`;
      const choices = el('div', 'quiz-choices');
      let answered = false;

      // 선택지 순서를 매번 섞는다 (번호로 정답을 외우거나 공유하는 것 방지)
      const order = q.choices.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }

      order.forEach((origIdx, i) => {
        const btn = el('button', 'quiz-choice', `${['①', '②', '③', '④'][i]} ${q.choices[origIdx]}`);
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const correct = origIdx === q.answer;
          if (correct) {
            quizCorrect++;
            btn.classList.add('correct');
            audio.good();
          } else {
            btn.classList.add('wrong');
            const answerPos = order.indexOf(q.answer);
            (choices.children[answerPos] as HTMLElement).classList.add('correct');
            audio.bad();
          }
          const explain = el(
            'div',
            'quiz-explain',
            `${correct ? '🎉 <b>정답!</b>' : '😅 <b>아쉬워요!</b>'} ${q.explain}`
          );
          card.appendChild(explain);
          const next = button(
            qIdx < lesson.quiz.length - 1 ? '다음 문제 ▶' : '결과 보기 🏆',
            () => {
              qIdx++;
              if (qIdx < lesson.quiz.length) showQuiz();
              else showFinal();
            },
            'btn'
          );
          next.style.marginTop = '16px';
          card.appendChild(next);
        });
        choices.appendChild(btn);
      });
      card.appendChild(choices);
      scene.appendChild(card);
    }

    // ---------- 3단계: 별점 결과 ----------
    function showFinal() {
      // 별점: 클리어 1개 + 퀴즈 2개 이상 1개 + 퀴즈 만점&게임 70점 이상 1개
      let stars = 1;
      if (quizCorrect >= 2) stars++;
      if (quizCorrect === lesson.quiz.length && gameScore >= 70) stars++;
      save.report(lesson.id, stars, gameScore, quizCorrect);

      scene.innerHTML = '';
      const card = el('div', 'card result-final');
      const starSpan = (i: number) =>
        `<span class="${i < stars ? 'on' : 'off'}" style="opacity:0" data-star="${i}">⭐</span>`;
      card.innerHTML = `
        <h2>${stars >= 3 ? '완벽해요! 🎊' : stars === 2 ? '참 잘했어요! 🎉' : '클리어! 👏'}</h2>
        <div class="big-stars">${[0, 1, 2].map(starSpan).join('')}</div>
        <div class="score-line">게임 점수 ${gameScore}점 · 퀴즈 ${quizCorrect} / ${lesson.quiz.length} 맞힘</div>
        <div class="star-guide">⭐ 클리어 &nbsp;·&nbsp; ⭐⭐ 퀴즈 2개 이상 &nbsp;·&nbsp; ⭐⭐⭐ 퀴즈 다 맞히고 게임 70점!</div>`;
      const btns = el('div', 'result-btns');
      btns.append(
        button('🗺️ 월드맵으로', () => mgr.go('worldmap'), 'btn mint'),
        button('🔄 다시 도전', () => mgr.go('game', { lessonId: lesson.id }), 'btn ghost')
      );
      card.appendChild(btns);
      scene.appendChild(card);
      audio.fanfare();

      // 별 하나씩 등장
      const starEls = card.querySelectorAll<HTMLElement>('[data-star]');
      starEls.forEach((s, i) => {
        setTimeout(() => {
          s.style.opacity = '1';
          s.animate(
            [
              { transform: 'scale(0) rotate(-30deg)' },
              { transform: 'scale(1.4) rotate(10deg)' },
              { transform: 'scale(1)' }
            ],
            { duration: 350 }
          );
          if (i < stars) audio.star();
        }, 400 + i * 450);
      });
    }

    showSummary();

    // 데스크톱/발표용: 숫자 1~3키로 퀴즈 선택지 선택
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 4) return;
      const btns = scene.querySelectorAll<HTMLButtonElement>('.quiz-choice');
      if (!btns.length) return;
      // 이미 답한 화면이면 무시
      if (scene.querySelector('.quiz-choice.correct, .quiz-choice.wrong')) return;
      btns[n - 1]?.click();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  };
}
