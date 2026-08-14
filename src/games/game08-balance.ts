// 8차시: 미루의 숙제 대작전 (자원 배분 + 선택의 결과 체험)
// 페이즈1(저녁): 숙제 8개를 '스스로(3칸) / 같이(2칸) / 맡기기(1칸)' 중 하나로 처리한다.
//                저녁 시간은 20칸뿐이라 전부 스스로 할 수는 없다.
// 페이즈2(다음 날 학교): 선택의 결과가 한꺼번에 밝혀지고, 마지막에 균형 저울로 결산한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

// ---------- 데이터 타입 ----------

type Method = 'self' | 'together' | 'delegate';
type Verdict = 'ok' | 'soso' | 'bad';

interface Outcome {
  points: number;
  /** 페이즈1 미루 반응 대사 */
  p1: string;
  /** 페이즈2 다음 날 장면 */
  p2: string;
  /** 페이즈2 에티 코멘트 */
  eti: string;
  verdict: Verdict;
}

interface Task {
  emoji: string;
  title: string;
  desc: string;
  self: Outcome;
  together: Outcome;
  delegate: Outcome;
}

// ---------- 규칙 상수 ----------

const TIME_TOTAL = 20; // 저녁 시간 칸
const COST: Record<Method, number> = { self: 3, together: 2, delegate: 1 };
const METHOD_ICON: Record<Method, string> = { self: '🧠', together: '🤝', delegate: '🤖' };
const METHOD_NAME: Record<Method, string> = {
  self: '내가 스스로',
  together: 'AI와 같이',
  delegate: 'AI에게 맡김'
};

// 선택 버튼 좌표(1280x800 기준) - 흔들림 피드백 플로터 위치 계산용
const BTN_W = 340;
const BTN_H = 96;
const BTN_GAP = 24;
const BTN_LEFT = 106;
const BTN_TOP = 664;

// ---------- 숙제 데이터 (고정 순서 8개) ----------

const TASKS: Task[] = [
  {
    emoji: '📔',
    title: '일기 쓰기',
    desc: '오늘 있었던 일과 내 기분을 일기로 쓰기',
    self: {
      points: 10,
      verdict: 'ok',
      p1: '오늘 체육 시간 이야기를 써야지! 내 하루는 내가 제일 잘 알아.',
      p2: '<b>선생님</b> "미루의 일기는 마음이 잘 느껴지는 글이구나!"',
      eti: '내 경험과 내 마음은 나만 쓸 수 있어!'
    },
    together: {
      points: 5,
      verdict: 'soso',
      p1: '내용은 내가 쓰고, 맞춤법만 봐 달라고 해야지.',
      p2: '<b>선생님</b> "글이 깔끔하네. 내용은 네가 쓴 거지?"<br><b>미루</b> "응! 내 이야기야!"',
      eti: '내용이 네 것이면 괜찮아. 그래도 일기는 끝까지 네 힘으로 써 보는 게 최고야.'
    },
    delegate: {
      points: 0,
      verdict: 'bad',
      p1: '도우미봇~ 일기도 부탁해!',
      p2: '<b>선생님</b> "가족과 캠핑을 갔었다고? 좋았겠다!"<br><b>미루</b> "네…? 저 어제 학원 갔는데요…"',
      eti: 'AI는 네 하루를 모르니까 이야기를 지어내 버려!'
    }
  },
  {
    emoji: '🔍',
    title: '조사 숙제',
    desc: '세종대왕이 만든 것을 조사해 오기',
    self: {
      points: 5,
      verdict: 'soso',
      p1: '도서관 책을 뒤져서 찾아볼게. 시간이 꽤 걸리겠는걸…',
      p2: '<b>선생님</b> "잘 조사했네!"',
      eti: '직접 찾는 것도 좋아. 하지만 AI로 시간을 아꼈다면 다른 숙제를 스스로 할 시간이 생겼을 거야.'
    },
    together: {
      points: 10,
      verdict: 'ok',
      p1: '도우미봇에게 물어보고, 진짜인지 확인한 다음 내 말로 정리해야지!',
      p2: '<b>선생님</b> "정확하게 조사하고 네 말로 잘 정리했구나!"',
      eti: 'AI로 빠르게 찾고, 사실인지 확인하고, 내 말로 정리! 최고의 활용법이야.'
    },
    delegate: {
      points: 0,
      verdict: 'bad',
      p1: '찾아서 그대로 뽑아 줘~ 읽어 볼 시간은 없어!',
      p2: '발표 시간, <b>미루</b> "세종대왕은… 거북선을 만들었습니다!"<br><b>친구들</b> "그건 이순신 장군이야!!"',
      eti: 'AI는 가끔 틀린 정보를 그럴듯하게 말해. 확인 없이 내면 이렇게 돼!'
    }
  },
  {
    emoji: '✏️',
    title: '수학 익힘책',
    desc: '수학 익힘책 문제 5개 풀기',
    self: {
      points: 10,
      verdict: 'ok',
      p1: '연필 꽉! 어려워도 내가 풀어야 실력이 늘지.',
      p2: '<b>선생님</b> "미루, 칠판에 나와서 풀어 볼래?"<br>— 미루가 술술 푼다!',
      eti: '스스로 풀어 본 문제는 언제든 다시 풀 수 있어. 생각 근육이 자랐네!'
    },
    together: {
      points: 5,
      verdict: 'soso',
      p1: '두 문제는 모르겠어… 힌트만 받고 다시 풀어 볼래.',
      p2: '<b>선생님</b> "잘 풀었구나!"',
      eti: '먼저 고민하고 힌트만 받은 건 좋은 방법이야. 다음엔 조금 더 스스로 버텨 보자!'
    },
    delegate: {
      points: 0,
      verdict: 'bad',
      p1: '답 알려 줘~ 옮겨 적기만 하면 끝!',
      p2: '<b>선생님</b> "칠판에서 3번을 풀어 볼래?"<br><b>미루</b> "어… 어…? 답은 아는데 푸는 법을 몰라!"',
      eti: '답만 베끼면 머릿속에는 아무것도 남지 않아.'
    }
  },
  {
    emoji: '💌',
    title: '사과 편지',
    desc: '다툰 친구 소라에게 사과 편지 쓰기',
    self: {
      points: 10,
      verdict: 'ok',
      p1: '소라야 미안해… 내 진심을 꾹꾹 눌러 담아 쓸래.',
      p2: '<b>소라</b> "미루야, 편지 읽고 감동했어. 우리 화해하자!"',
      eti: '서툴러도 진심이 담긴 말이 마음을 움직여.'
    },
    together: {
      points: 5,
      verdict: 'soso',
      p1: '내 마음을 먼저 쓰고, 더 좋은 표현만 물어봐야지.',
      p2: '<b>소라</b> "고마워, 네 마음 잘 전해졌어."',
      eti: '마음은 네 것, AI는 표현만 도왔으니 괜찮아.'
    },
    delegate: {
      points: 0,
      verdict: 'bad',
      p1: '사과 편지도 도우미봇이 쓰면 금방이지~',
      p2: `<b>소라</b> "'심심한 사과의 말씀을 드립니다'…? 이거 정말 네가 쓴 거야?"<br>— 소라가 더 서운해한다…`,
      eti: '마음을 전하는 일을 기계에 맡기면 진심이 사라져 버려.'
    }
  },
  {
    emoji: '✅',
    title: '맞춤법 검사',
    desc: '다 써 놓은 글쓰기 숙제의 맞춤법 검사하기',
    self: {
      points: 5,
      verdict: 'soso',
      p1: '사전을 한 장 한 장 넘기며 확인해 볼게… 오래 걸리네.',
      p2: '<b>선생님</b> "틀린 글자가 두 개 남았네?"',
      eti: '이런 반복 작업은 AI가 사람보다 빠르고 정확해. 아낀 시간을 생각하는 숙제에 쓰면 좋아!'
    },
    together: {
      points: 5,
      verdict: 'soso',
      p1: '반은 내가 보고, 반은 도우미봇에게 부탁할까?',
      p2: '<b>선생님</b> "깔끔하구나!"',
      eti: '나쁘지 않아! 그런데 이런 단순 작업은 통째로 맡겨도 괜찮은 일이야.'
    },
    delegate: {
      points: 10,
      verdict: 'ok',
      p1: '도우미봇, 맞춤법 검사 부탁해! 그동안 난 다른 숙제를 하자.',
      p2: '<b>선생님</b> "맞춤법이 완벽하구나!"',
      eti: '잘했어! 단순 반복 작업은 AI에게 맡기고, 아낀 시간을 생각하는 데 쓰는 거야.'
    }
  },
  {
    emoji: '🔤',
    title: '영어 단어',
    desc: '모르는 영어 단어 10개 뜻을 찾고 외우기',
    self: {
      points: 5,
      verdict: 'soso',
      p1: '두꺼운 종이 사전으로 한 단어씩 찾아볼게…',
      p2: '쪽지시험 통과!',
      eti: '잘했어! 그런데 찾는 데 시간이 오래 걸렸지? 찾기는 AI에게 맡기고 외우는 데 시간을 쓰면 더 좋아.'
    },
    together: {
      points: 10,
      verdict: 'ok',
      p1: '도우미봇에게 뜻과 발음을 물어보고, 소리 내어 읽으며 외워야지!',
      p2: '쪽지시험 만점!<br><b>선생님</b> "발음도 좋은걸?"',
      eti: '찾기는 AI, 외우기는 나! 역할을 잘 나눴어.'
    },
    delegate: {
      points: 0,
      verdict: 'bad',
      p1: '뜻 목록만 만들어 줘~ 그대로 베껴 쓸래.',
      p2: '쪽지시험…<br><b>미루</b> "하나도 기억이 안 나!"',
      eti: '베껴 쓰기만 하면 머릿속은 텅 비어. 외우는 건 AI가 대신 못 해 줘.'
    }
  },
  {
    emoji: '📊',
    title: '설문 표 정리',
    desc: '우리 반 급식 설문지 32장을 세어서 표로 정리하기',
    self: {
      points: 5,
      verdict: 'soso',
      p1: '바를 정(正) 자를 쓰면서 세어 볼게… 서른두 장이나 되네…',
      p2: '표 완성! 그런데 다시 세어 보니 숫자 하나가 틀렸다!',
      eti: '사람은 단순 반복에서 실수하기 쉬워. 이런 일은 AI가 잘하는 일이야.'
    },
    together: {
      points: 5,
      verdict: 'soso',
      p1: '반씩 나눠서 세어 볼까?',
      p2: '무난하게 완성!',
      eti: '좋아! 그런데 숫자 세기 같은 일은 통째로 맡겨도 되는 일이야.'
    },
    delegate: {
      points: 10,
      verdict: 'ok',
      p1: '도우미봇, 세어서 표로 만들어 줘!',
      p2: '깔끔한 표 완성!<br><b>선생님</b> "한눈에 들어오는 정리네!"',
      eti: '기계가 잘하는 일은 기계에게! 덕분에 시간을 벌었어.'
    }
  },
  {
    emoji: '📖',
    title: '독서 감상문',
    desc: '책을 읽고 내 생각과 느낀 점 쓰기',
    self: {
      points: 10,
      verdict: 'ok',
      p1: '주인공이 부러웠던 이유를 솔직하게 써 볼래.',
      p2: '<b>선생님</b> "미루만의 생각이 담긴 감상문이구나. 최고야!"',
      eti: '느낀 점은 세상에 하나뿐인 네 생각이야.'
    },
    together: {
      points: 5,
      verdict: 'soso',
      p1: '줄거리 요약만 도움받고, 느낀 점은 내가 쓸래.',
      p2: '<b>선생님</b> "느낀 점이 참 좋네."',
      eti: '느낀 점을 스스로 썼다면 괜찮은 방법이야.'
    },
    delegate: {
      points: 0,
      verdict: 'bad',
      p1: '감상문쯤이야~ 도우미봇, 부탁해!',
      p2: '<b>선생님</b> "이 책의 어떤 장면에서 그렇게 느꼈니?"<br><b>미루</b> "어… 그게… (읽지도, 생각하지도 않았는데!)"',
      eti: 'AI가 쓴 감상은 네 마음이 아니야. 질문 하나에 들통나 버려.'
    }
  }
];

/** 시간이 모자라 못 낸 숙제 공통 장면 */
const MISSED = {
  p2: '<b>선생님</b> "숙제는 어디 있니?"<br><b>미루</b> "다… 다 못 했어요…"',
  eti: '시간 계획도 균형이야. AI에게 맡겨도 되는 일은 맡겨서 시간을 아끼자!'
};

// ---------- 전용 스타일 ----------

const CSS = `
.g08-scene { transition: background 0.7s ease; }
.g08-night { background: linear-gradient(180deg,#2f2a55 0%,#4a3f7d 55%,#7160a8 100%); }
.g08-day { background: linear-gradient(180deg,#a8dcff 0%,#e6f4ff 45%,#fff7e0 100%); }

.g08-time {
  flex: 1; display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.92); border-radius: 999px;
  padding: 8px 16px; box-shadow: var(--shadow);
}
.g08-time-label { font-size: 22px; font-weight: 800; color: var(--ink); flex: none; }
.g08-segs { flex: 1; display: flex; gap: 4px; }
.g08-seg {
  flex: 1; min-width: 14px; height: 26px; border-radius: 8px;
  background: linear-gradient(180deg, var(--mint), var(--sky));
  transition: background 0.25s ease, opacity 0.25s ease, transform 0.25s ease;
}
.g08-seg.g08-low { background: linear-gradient(180deg, var(--red), var(--orange)); }
.g08-seg.off { background: #cfcada; opacity: 0.5; transform: scaleY(0.55); }

.g08-miru-box { position: absolute; left: 20px; top: 92px; width: 300px; text-align: center; }
.g08-speech {
  background: #fff; border: 5px solid var(--ink); border-radius: 20px;
  padding: 14px 16px; font-size: 22px; font-weight: 700; line-height: 1.4;
  color: var(--ink); min-height: 132px; text-align: left;
}
.g08-miru-box img { display: block; width: 220px; margin: 12px auto 0; }

.g08-scale {
  position: absolute; left: 340px; top: 84px; width: 900px; height: 210px;
  transition: left 0.5s ease, top 0.5s ease, transform 0.5s ease;
}
.g08-scale.big { left: 280px; top: 168px; transform: scale(1.22); }
.g08-beam {
  position: absolute; left: 50%; top: 66px; width: 460px; margin-left: -230px;
  height: 18px; border-radius: 9px; background: var(--ink);
  transform-origin: 50% 50%; transition: transform 0.4s ease;
}
.g08-pivot {
  position: absolute; left: 50%; top: 78px; width: 0; height: 0;
  transform: translateX(-50%);
  border-left: 26px solid transparent; border-right: 26px solid transparent;
  border-bottom: 96px solid var(--ink);
}
.g08-base {
  position: absolute; left: 50%; top: 172px; width: 260px; margin-left: -130px;
  height: 20px; border-radius: 10px; background: var(--ink);
}
.g08-plate {
  position: absolute; top: 16px; width: 190px; margin-left: -95px;
  transform-origin: 50% 0; transition: transform 0.4s ease;
}
.g08-plate.l { left: 0; }
.g08-plate.r { left: 460px; }
.g08-plate-inner {
  background: #fff; border: 4px solid var(--ink); border-radius: 16px;
  padding: 8px 4px; font-size: 22px; font-weight: 800; color: var(--ink);
  text-align: center; white-space: nowrap;
}
.g08-both {
  position: absolute; left: 50%; top: 4px; transform: translateX(-50%);
  background: var(--yellow); border: 4px solid var(--ink); border-radius: 999px;
  padding: 6px 18px; font-size: 22px; font-weight: 800; color: var(--ink);
  white-space: nowrap;
}

.g08-task-card {
  position: absolute; left: 400px; top: 316px; width: 800px; min-height: 284px;
  background: var(--paper); border: 6px solid var(--ink); border-radius: 26px;
  padding: 16px 26px; text-align: center; box-shadow: var(--shadow);
  animation: g08-pop 0.35s ease;
}
.g08-task-emoji { font-size: 70px; line-height: 1.15; }
.g08-task-title { font-size: 30px; font-weight: 800; color: var(--ink); }
.g08-task-desc { font-size: 23px; line-height: 1.45; color: var(--ink-soft); margin-top: 10px; }
@keyframes g08-pop {
  0% { transform: scale(0.75) translateY(24px); opacity: 0; }
  65% { transform: scale(1.05) translateY(0); opacity: 1; }
  100% { transform: scale(1); }
}

.g08-opts { position: absolute; left: ${BTN_LEFT}px; top: ${BTN_TOP}px; display: flex; gap: ${BTN_GAP}px; }
.g08-opt {
  width: ${BTN_W}px; height: ${BTN_H}px; border: none; border-radius: 22px;
  font-family: var(--font); font-weight: 800; color: var(--ink); cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  box-shadow: 0 6px 0 rgba(58,51,82,0.25);
}
.g08-opt-main { font-size: 28px; }
.g08-opt-cost { font-size: 22px; opacity: 0.75; }
.g08-opt.self { background: var(--mint); }
.g08-opt.together { background: var(--yellow); }
.g08-opt.delegate { background: var(--sky); }
.g08-opt:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(58,51,82,0.25); }
.g08-opt.g08-disabled { background: #c8c3d6; color: rgba(58,51,82,0.45); opacity: 0.6; }
.g08-opt.g08-shake { animation: g08-shake 0.4s ease; }
@keyframes g08-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-11px); }
  40% { transform: translateX(11px); }
  60% { transform: translateX(-7px); }
  80% { transform: translateX(7px); }
}

.g08-banner {
  position: absolute; left: 50%; top: 300px; transform: translateX(-50%);
  background: #fff; border: 6px solid var(--ink); border-radius: 26px;
  padding: 18px 46px; font-size: 46px; font-weight: 800; color: var(--ink);
  z-index: 40; animation: g08-pop 0.35s ease;
}

.g08-result-card {
  position: absolute; left: 340px; top: 92px; width: 900px; height: 648px;
  background: var(--paper); border: 6px solid var(--ink); border-radius: 26px;
  padding: 18px 24px; box-shadow: var(--shadow);
  display: flex; flex-direction: column; animation: g08-pop 0.3s ease;
}
.g08-res-head {
  display: flex; align-items: center; gap: 14px;
  border-bottom: 4px dashed #ddd6ee; padding-bottom: 12px; flex: none;
}
.g08-res-emoji { font-size: 50px; line-height: 1; flex: none; }
.g08-res-title { flex: 1; font-size: 28px; font-weight: 800; color: var(--ink); text-align: left; }
.g08-res-method {
  flex: none; font-size: 22px; font-weight: 800; color: var(--ink);
  background: var(--cream); border: 4px solid var(--ink); border-radius: 999px;
  padding: 6px 16px; white-space: nowrap;
}
.g08-res-scene {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: 26px; line-height: 1.65; color: var(--ink); text-align: center; padding: 10px 6px;
}
.g08-badge-slot { flex: none; min-height: 78px; display: flex; align-items: center; justify-content: center; }
.g08-badge {
  font-size: 30px; font-weight: 800; background: #fff;
  border: 6px solid; border-radius: 20px; padding: 10px 26px;
  animation: g08-stamp 0.35s ease;
}
.g08-badge.ok { color: var(--green); border-color: var(--green); }
.g08-badge.soso { color: var(--orange); border-color: var(--orange); }
.g08-badge.bad { color: var(--red); border-color: var(--red); }
@keyframes g08-stamp {
  from { transform: scale(2.2); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.g08-eti { display: flex; align-items: center; gap: 12px; flex: none; }
.g08-eti img { width: 84px; flex: none; }
.g08-eti-bubble {
  flex: 1; background: #fff; border: 4px solid var(--ink); border-radius: 16px;
  padding: 10px 14px; font-size: 22px; font-weight: 700; line-height: 1.4; color: var(--ink);
}
.g08-next { width: 100%; min-height: 66px; font-size: 26px; margin-top: 14px; flex: none; }

.g08-verdict-box {
  position: absolute; left: 190px; top: 470px; width: 900px;
  background: var(--paper); border: 6px solid var(--ink); border-radius: 26px;
  padding: 20px 26px; text-align: center; box-shadow: var(--shadow);
  animation: g08-pop 0.35s ease;
}
.g08-verdict-text { font-size: 28px; font-weight: 700; line-height: 1.5; color: var(--ink); }
.g08-verdict-box .btn { margin-top: 16px; min-height: 68px; font-size: 28px; }
.g08-final-line { font-size: 23px; color: var(--purple); font-weight: 800; margin-top: 12px; }
`;

// ---------- 게임 본체 ----------

export const game08: MiniGame = {
  lessonId: 8,
  mount(container: HTMLElement, ctx: GameCtx) {
    const styleEl = document.createElement('style');
    styleEl.id = 'g08-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    const wrap = el('div', 'game-wrap g08-scene g08-night');
    container.appendChild(wrap);

    // ---------- 상태 ----------
    const timers: number[] = [];
    let timeLeft = TIME_TOTAL;
    let taskIdx = 0;
    let busy = false;
    let over = false; // 페이즈 진행 중단 플래그
    let exited = false; // finish/quit 중복 호출 가드
    const picks: (Method | null)[] = TASKS.map(() => null);
    let selfCount = 0;
    let togetherCount = 0;
    let delegateCount = 0;
    let scoreSum = 0;

    function later(fn: () => void, ms: number) {
      timers.push(window.setTimeout(fn, ms));
    }

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quitBtn = button(
      '🗺️',
      () => {
        if (exited) return;
        exited = true;
        ctx.quit();
      },
      'icon-btn', '그만두기');
    const nameEl = el('div', 'game-name', '📚 미루의 숙제 대작전');
    const progressEl = el('div', 'game-score', '숙제 1 / 8');
    const timeEl = el('div', 'g08-time');
    const timeLabel = el('div', 'g08-time-label', '⏰ 저녁');
    const segsEl = el('div', 'g08-segs');
    const segs: HTMLElement[] = [];
    for (let i = 0; i < TIME_TOTAL; i++) {
      const s = el('div', 'g08-seg');
      segs.push(s);
      segsEl.appendChild(s);
    }
    timeEl.append(timeLabel, segsEl);
    const scoreEl = el('div', 'game-score', '점수 0');
    scoreEl.style.display = 'none';
    topbar.append(quitBtn, nameEl, progressEl, timeEl, scoreEl);
    wrap.appendChild(topbar);

    // ---------- 미루 + 말풍선 ----------
    const miruBox = el('div', 'g08-miru-box');
    const speech = el('div', 'g08-speech', '오늘 저녁 숙제가 8개나 있어…<br>어떤 방법으로 할지 골라 줘!');
    miruBox.append(speech, charImg('char08', '', '미루'));
    wrap.appendChild(miruBox);

    // ---------- 균형 저울 ----------
    const scale = el('div', 'g08-scale');
    const beam = el('div', 'g08-beam');
    const plateL = el('div', 'g08-plate l');
    const plateLIn = el('div', 'g08-plate-inner', '🧠 스스로 0');
    plateL.appendChild(plateLIn);
    const plateR = el('div', 'g08-plate r');
    const plateRIn = el('div', 'g08-plate-inner', '🤖 맡김 0');
    plateR.appendChild(plateRIn);
    beam.append(plateL, plateR);
    const pivot = el('div', 'g08-pivot');
    const base = el('div', 'g08-base');
    const bothEl = el('div', 'g08-both', '🤝 같이 0');
    scale.append(bothEl, beam, pivot, base);
    wrap.appendChild(scale);

    function updateScale() {
      plateLIn.textContent = `🧠 스스로 ${selfCount}`;
      plateRIn.textContent = `🤖 맡김 ${delegateCount}`;
      bothEl.textContent = `🤝 같이 ${togetherCount}`;
      const tilt = Math.max(-25, Math.min(25, (selfCount - delegateCount) * 5));
      beam.style.transform = `rotate(${-tilt}deg)`;
      plateL.style.transform = `rotate(${tilt}deg)`;
      plateR.style.transform = `rotate(${tilt}deg)`;
    }
    updateScale();

    // ---------- 숙제 카드 ----------
    let taskCard: HTMLElement | null = null;

    function showTask() {
      if (taskCard) taskCard.remove();
      const t = TASKS[taskIdx];
      taskCard = el(
        'div',
        'g08-task-card',
        `<div class="g08-task-emoji">${t.emoji}</div>
         <div class="g08-task-title">${t.title}</div>
         <div class="g08-task-desc">${t.desc}</div>`
      );
      wrap.appendChild(taskCard);
      progressEl.textContent = `숙제 ${taskIdx + 1} / 8`;
      updateOptButtons();
    }

    // ---------- 선택 버튼 ----------
    const optsEl = el('div', 'g08-opts');
    const methods: Method[] = ['self', 'together', 'delegate'];
    const optBtns: HTMLButtonElement[] = [];
    methods.forEach((m, i) => {
      const b = el('button', `g08-opt ${m}`);
      b.innerHTML = `<span class="g08-opt-main">${METHOD_ICON[m]} ${
        m === 'delegate' ? 'AI에게 다 맡기기' : METHOD_NAME[m]
      }</span><span class="g08-opt-cost">⏰ ${COST[m]}칸</span>`;
      b.addEventListener('click', () => choose(m, i));
      optBtns.push(b);
      optsEl.appendChild(b);
    });
    wrap.appendChild(optsEl);

    function updateOptButtons() {
      methods.forEach((m, i) => {
        optBtns[i].classList.toggle('g08-disabled', COST[m] > timeLeft);
      });
    }

    function spendTime(cost: number) {
      const from = timeLeft;
      timeLeft -= cost;
      for (let k = 0; k < cost; k++) {
        const idx = from - 1 - k;
        later(() => {
          if (segs[idx]) segs[idx].classList.add('off');
          if (timeLeft <= 5) {
            segs.forEach((s) => s.classList.add('g08-low'));
          }
        }, 60 + k * 100);
      }
    }

    function choose(m: Method, btnIdx: number) {
      if (busy || over || taskIdx >= TASKS.length) return;
      const cost = COST[m];
      if (cost > timeLeft) {
        ctx.audio.bad();
        const b = optBtns[btnIdx];
        b.classList.add('g08-shake');
        later(() => b.classList.remove('g08-shake'), 420);
        floater(
          wrap,
          BTN_LEFT + btnIdx * (BTN_W + BTN_GAP) + BTN_W / 2,
          BTN_TOP + BTN_H / 2 - 20,
          '⏰ 시간이 모자라!',
          false
        );
        return;
      }

      busy = true;
      ctx.audio.pop();
      const t = TASKS[taskIdx];
      picks[taskIdx] = m;
      if (m === 'self') selfCount++;
      else if (m === 'together') togetherCount++;
      else delegateCount++;

      spendTime(cost);
      updateScale();
      speech.innerHTML = `"${t[m].p1}"`;
      taskIdx++;

      later(() => {
        busy = false;
        if (over) return;
        if (taskIdx >= TASKS.length) {
          startSchool();
        } else if (timeLeft < 1) {
          busy = true; // 남은 숙제 미제출 연출 중에는 입력 차단
          speech.innerHTML = '으악, 벌써 잘 시간이야!<br>남은 숙제는… 못 했어…';
          updateOptButtons();
          later(startSchool, 1500);
        } else {
          showTask();
        }
      }, 900);
    }

    showTask();

    // ---------- 페이즈 2: 다음 날 학교 ----------
    let resultIdx = 0;
    let resultCard: HTMLElement | null = null;

    function startSchool() {
      if (over) return;
      busy = true;
      wrap.classList.remove('g08-night');
      wrap.classList.add('g08-day');
      optsEl.remove();
      if (taskCard) {
        taskCard.remove();
        taskCard = null;
      }
      scale.style.display = 'none';
      progressEl.style.display = 'none';
      timeEl.style.display = 'none';
      scoreEl.style.display = '';
      speech.innerHTML = '두근두근… 오늘 숙제 검사 시간이야.';

      const banner = el('div', 'g08-banner', '🌞 다음 날, 학교');
      wrap.appendChild(banner);
      ctx.audio.fanfare();
      later(() => {
        banner.remove();
        busy = false;
        showResult();
      }, 1200);
    }

    function showResult() {
      if (over) return;
      if (resultIdx >= TASKS.length) {
        showBalance();
        return;
      }
      if (resultCard) resultCard.remove();

      const t = TASKS[resultIdx];
      const m = picks[resultIdx];
      const out = m ? t[m] : null;
      const methodLabel = m ? `${METHOD_ICON[m]} ${METHOD_NAME[m]}` : '⏰ 미제출';
      const sceneHtml = out ? out.p2 : MISSED.p2;
      const etiText = out ? out.eti : MISSED.eti;

      const card = el('div', 'g08-result-card');
      const head = el('div', 'g08-res-head');
      head.append(
        el('div', 'g08-res-emoji', t.emoji),
        el('div', 'g08-res-title', t.title),
        el('div', 'g08-res-method', methodLabel)
      );
      const sceneEl = el('div', 'g08-res-scene', sceneHtml);
      const badgeSlot = el('div', 'g08-badge-slot');
      const etiRow = el('div', 'g08-eti');
      const etiBubble = el('div', 'g08-eti-bubble', etiText);
      etiRow.append(charImg('eti', '', '에티'), etiBubble);
      card.append(head, sceneEl, badgeSlot, etiRow);
      wrap.appendChild(card);
      resultCard = card;

      // 두구두구… 0.5초 후 판정 공개
      later(() => {
        if (over) return;
        const badge = el('div', 'g08-badge');
        if (!out) {
          badge.classList.add('bad');
          badge.textContent = '❌ 미제출 +0';
          ctx.audio.bad();
          floater(wrap, 790, 430, '+0점', false);
        } else if (out.verdict === 'ok') {
          badge.classList.add('ok');
          badge.textContent = '⭕ 딱 맞는 방법! +10';
          ctx.audio.good();
          floater(wrap, 790, 430, '+10점', true);
        } else if (out.verdict === 'soso') {
          badge.classList.add('soso');
          badge.textContent = '🔺 나쁘지 않아 +5';
          ctx.audio.pop();
          floater(wrap, 790, 430, '+5점', true);
        } else {
          badge.classList.add('bad');
          badge.textContent = '❌ 이런… +0';
          ctx.audio.bad();
          floater(wrap, 790, 430, '+0점', false);
        }
        badgeSlot.appendChild(badge);
        scoreSum += out ? out.points : 0;
        scoreEl.textContent = `점수 ${scoreSum}`;

        let advanced = false;
        const next = button(
          '다음 ▶',
          () => {
            if (over || advanced) return;
            advanced = true;
            resultIdx++;
            showResult();
          },
          'btn mint g08-next'
        );
        card.appendChild(next);
      }, 500);
    }

    // ---------- 균형 저울 결산 ----------
    function showBalance() {
      if (over) return;
      if (resultCard) {
        resultCard.remove();
        resultCard = null;
      }
      speech.innerHTML = '자, 오늘 내 저울은 어땠을까?';

      scale.style.display = '';
      scale.classList.add('big');
      const net = selfCount - delegateCount;
      const absNet = Math.abs(net);
      let bonus = 0;
      let msg = '';
      if (absNet <= 2) {
        bonus = 20;
        msg = '⚖️ 완벽한 균형이야! <b>균형 보너스 +20점</b>';
      } else if (absNet <= 4) {
        bonus = 10;
        msg = '조금 기울었네! <b>균형 보너스 +10점</b>';
      } else if (net >= 5) {
        bonus = 0;
        msg = '🧠 쪽으로 너무 기울었어! 혼자 다 하려다 시간이 부족했지?<br><b>보너스 +0점</b>';
      } else {
        bonus = 0;
        msg = '🤖 쪽으로 너무 기울었어! 생각 근육이 약해지고 있어…<br><b>보너스 +0점</b>';
      }

      // 0도에서 최종 기울기로 애니메이션
      beam.style.transform = 'rotate(0deg)';
      plateL.style.transform = 'rotate(0deg)';
      plateR.style.transform = 'rotate(0deg)';
      later(() => updateScale(), 350);

      const box = el('div', 'g08-verdict-box');
      const text = el('div', 'g08-verdict-text', msg);
      box.appendChild(text);
      wrap.appendChild(box);

      later(() => {
        if (over) return;
        if (bonus === 20) ctx.audio.star();
        else if (bonus === 10) ctx.audio.pop();
        else ctx.audio.bad();
        scoreSum += bonus;
        scoreEl.textContent = `점수 ${scoreSum}`;
        const done = button('결과 확인 🏆', () => showOverlay(bonus), 'btn big yellow');
        box.appendChild(done);
      }, 900);
    }

    // ---------- 마무리 오버레이 ----------
    function showOverlay(bonus: number) {
      if (over) return;
      over = true;
      const taskScore = scoreSum - bonus;
      const score = Math.max(0, Math.min(100, Math.round(scoreSum)));
      const perfect = TASKS.reduce((n, t, i) => {
        const m = picks[i];
        return n + (m && t[m].verdict === 'ok' ? 1 : 0);
      }, 0);
      const miruLine =
        score >= 90
          ? '이제 뭘 맡기고 뭘 내가 할지 알겠어! 고마워!'
          : score >= 60
            ? '오늘은 어제보다 훨씬 나았어! 조금만 더 연습하자!'
            : '으음… 아직 균형 잡기가 어렵네. 다시 도전할래!';

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>숙제 대작전 완료! ⚖️</h2>
        <div class="howto-icons">${score >= 70 ? '🐿️✨' : '🐿️💦'}</div>
        <div class="howto-desc">
          딱 맞는 방법으로 한 숙제: <b>${perfect} / 8</b><br>
          숙제 점수: <b>${taskScore} / 80</b> · 균형 보너스: <b>+${bonus}</b><br><br>
          스스로 할 일, AI와 같이 할 일, 맡겨도 되는 일 — 균형이 답이에요!
          <div class="g08-final-line">미루: "${miruLine}"</div>
        </div>`;
      const doneBtn = button(
        '결과 보기 🏆',
        () => {
          if (exited) return;
          exited = true;
          ctx.finish(score);
        },
        'btn big yellow'
      );
      cardEl.appendChild(doneBtn);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      ctx.audio.fanfare();
    }

    // ---------- cleanup ----------
    return () => {
      over = true;
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      styleEl.remove();
      wrap.remove();
    };
  }
};
