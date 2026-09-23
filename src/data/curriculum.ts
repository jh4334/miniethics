// 12차시 커리큘럼 데이터
// 1~3차시: 이 파일에 인라인, 4~12차시: src/data/lessons/lessonNN.ts 개별 파일

import { lesson04 } from './lessons/lesson04';
import { lesson05 } from './lessons/lesson05';
import { lesson06 } from './lessons/lesson06';
import { lesson07 } from './lessons/lesson07';
import { lesson08 } from './lessons/lesson08';
import { lesson09 } from './lessons/lesson09';
import { lesson10 } from './lessons/lesson10';
import { lesson11 } from './lessons/lesson11';
import { lesson12 } from './lessons/lesson12';

export interface DialogLine {
  speaker: string;
  side: 'left' | 'right';
  text: string;
}

export interface QuizQ {
  q: string;
  choices: string[];
  answer: number; // 정답 인덱스
  explain: string;
}

export interface Lesson {
  id: number;
  title: string; // 차시 제목 (학습 주제)
  islandName: string; // 월드맵 섬 이름
  emoji: string;
  color: string; // 섬 색상
  goal: string; // 학습 목표
  playable: boolean;
  gameName: string;
  howto: string; // 게임 방법 안내
  howtoIcons: string;
  chars: { left: string; right: string }; // 스토리 등장인물 에셋 키
  rightName: string; // 오른쪽 캐릭터 이름
  intro: DialogLine[];
  mission: string; // 게임 직전 미션 문구
  summary: string[]; // 배움 정리
  quiz: QuizQ[];
  // 월드맵 좌표 (1280x800 기준, %)
  x: number;
  y: number;
}

const ETI = '에티';

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'AI는 어떻게 배울까?',
    islandName: '배움의 섬',
    emoji: '🍳',
    color: '#ffd93d',
    goal: 'AI가 데이터를 보고 학습한다는 것을 이해한다',
    playable: true,
    gameName: 'AI 요리사 키우기',
    howto:
      '요리사 로봇 <b>쿡봇</b>에게 재료를 가르쳐 주자!<br>가운데 카드를 보고 <b>과일 바구니</b> 또는 <b>채소 바구니</b>를 눌러 알려 줘.<br>네가 가르친 대로 쿡봇이 배운단다. 정확하게 가르칠수록 쿡봇이 똑똑해져!',
    howtoIcons: '🍎➡️🧺',
    chars: { left: 'eti', right: 'cookbot' },
    rightName: '쿡봇',
    intro: [
      {
        speaker: ETI,
        side: 'left',
        text: '여기는 배움의 섬! 요리사 로봇 쿡봇이 살고 있어.\n그런데 쿡봇이 큰 고민에 빠졌대.'
      },
      {
        speaker: '쿡봇',
        side: 'right',
        text: '으앙~ 나는 과일과 채소를 구별하지 못해서\n샐러드에 자꾸 엉뚱한 재료를 넣어 버려…'
      },
      {
        speaker: ETI,
        side: 'left',
        text: 'AI는 사람처럼 태어날 때부터 아는 게 아니야.\n<b>데이터</b>를 보고 하나하나 배우는 거지!'
      },
      {
        speaker: '쿡봇',
        side: 'right',
        text: '나에게 재료 사진을 보여 주면서\n과일인지 채소인지 가르쳐 줄래? 부탁이야!'
      },
      {
        speaker: ETI,
        side: 'left',
        text: '좋아! 네가 알려 주는 것이 바로 쿡봇의 <b>학습 데이터</b>가 돼.\n정확하게 가르쳐야 쿡봇이 제대로 배운다는 걸 기억해!'
      }
    ],
    mission: '재료 16개를 정확하게 가르쳐서 쿡봇을 똑똑하게 만들자!',
    summary: [
      'AI는 <b>데이터</b>를 보고 배워요. 사람이 알려 준 대로 학습해요.',
      '내가 <b>정확하게</b> 가르치면 AI도 정확해지고, 틀리게 가르치면 AI도 틀려요.',
      'AI를 만들 때는 좋은 데이터를 주는 것이 정말 중요해요.'
    ],
    quiz: [
      {
        q: 'AI는 어떻게 새로운 것을 알게 될까요?',
        choices: [
          '태어날 때부터 모든 것을 알고 있다',
          '데이터를 보면서 배운다',
          '마법으로 알게 된다'
        ],
        answer: 1,
        explain: 'AI는 사람이 준 데이터를 보면서 조금씩 배워 나가요.'
      },
      {
        q: '쿡봇에게 사과를 "채소"라고 잘못 가르치면 어떻게 될까요?',
        choices: [
          '쿡봇이 알아서 고친다',
          '아무 일도 일어나지 않는다',
          '쿡봇도 사과를 채소라고 잘못 알게 된다'
        ],
        answer: 2,
        explain: 'AI는 가르쳐 준 대로 배우기 때문에, 잘못 가르치면 잘못 배워요.'
      },
      {
        q: '똑똑한 AI를 만들기 위해 가장 필요한 것은?',
        choices: ['정확하고 좋은 데이터', '비싼 컴퓨터 책상', '멋진 로봇 이름'],
        answer: 0,
        explain: 'AI의 실력은 학습 데이터의 질에 달려 있어요.'
      }
    ],
    x: 12,
    y: 72
  },
  {
    id: 2,
    title: '데이터 편향: 골고루 배워야 해요',
    islandName: '편식의 섬',
    emoji: '🍽️',
    color: '#6ee7c8',
    goal: '한쪽으로 치우친 데이터의 문제(편향)를 이해한다',
    playable: true,
    gameName: '편식하는 AI',
    howto:
      '냠봇은 <b>빨간 사과만</b> 먹고 배워서 다른 과일을 몰라 봐!<br>데이터 카드 중에서 <b>서로 다른 과일 6개</b>를 골라 밥그릇에 담아 주자.<br>골고루 담을수록 냠봇이 여러 과일을 알아볼 수 있어.',
    howtoIcons: '🍎🍌🍇➡️🥣',
    chars: { left: 'eti', right: 'nyambot' },
    rightName: '냠봇',
    intro: [
      {
        speaker: ETI,
        side: 'left',
        text: '여기는 편식의 섬. 과일 박사 로봇 냠봇이 사는 곳이야.\n그런데… 뭔가 이상한 일이 벌어지고 있어!'
      },
      {
        speaker: '냠봇',
        side: 'right',
        text: '나는 과일 박사! 빨간 사과는 과일!\n어? 바나나…? 저건 과일이 아니야! 처음 보는걸!'
      },
      {
        speaker: ETI,
        side: 'left',
        text: '저런… 냠봇은 <b>빨간 사과 데이터만</b> 먹고 배웠구나.\n이렇게 한쪽으로 쏠린 데이터를 <b>편향된 데이터</b>라고 해.'
      },
      {
        speaker: '냠봇',
        side: 'right',
        text: '내가 배운 게 치우쳐 있었다니…\n여러 가지 과일을 골고루 알려 줄래?'
      },
      {
        speaker: ETI,
        side: 'left',
        text: '냠봇의 밥그릇에 <b>다양한 과일</b>을 골고루 담아 주자.\n같은 것만 담으면 또 편식하게 될 거야!'
      }
    ],
    mission: '서로 다른 과일을 골고루 골라 냠봇의 편식을 고쳐 주자!',
    summary: [
      '한쪽으로 쏠린 데이터로 배우면 AI가 <b>잘못된 판단</b>을 해요. 이것을 <b>편향</b>이라고 해요.',
      'AI에게는 <b>다양하고 골고루</b> 섞인 데이터가 필요해요.',
      '실제 AI도 특정 사람·모습의 데이터만 배우면 다른 사람을 못 알아보는 문제가 생겨요.'
    ],
    quiz: [
      {
        q: '냠봇이 바나나를 못 알아본 이유는 무엇일까요?',
        choices: [
          '바나나가 너무 길어서',
          '빨간 사과 데이터만 보고 배워서',
          '냠봇이 잠을 못 자서'
        ],
        answer: 1,
        explain: '한 종류의 데이터만 배우면 다른 것을 만났을 때 틀리게 돼요.'
      },
      {
        q: '한쪽으로 치우친 데이터로 배운 AI에게 생기는 문제를 무엇이라고 할까요?',
        choices: ['편향', '업그레이드', '충전 부족'],
        answer: 0,
        explain: '데이터가 한쪽으로 쏠려 AI 판단이 치우치는 것을 편향이라고 해요.'
      },
      {
        q: 'AI가 얼굴 인식을 배울 때 어떤 데이터가 좋을까요?',
        choices: [
          '내 친구 한 명의 사진 100장',
          '다양한 나이·피부색·모습의 사람 사진',
          '고양이 사진만 잔뜩'
        ],
        answer: 1,
        explain: '여러 모습의 사람을 골고루 배워야 누구든 공평하게 알아볼 수 있어요.'
      }
    ],
    x: 27,
    y: 45
  },
  {
    id: 3,
    title: '개인정보를 지켜라!',
    islandName: '비밀의 섬',
    emoji: '🛡️',
    color: '#7cc7ff',
    goal: '보호해야 할 개인정보와 공개해도 되는 정보를 구분한다',
    playable: true,
    gameName: '개인정보 지킴이',
    howto:
      '정보 카드가 <b>정보도둑</b> 쪽으로 흘러가고 있어!<br><b>개인정보</b> 카드는 도둑에게 가기 전에 <b>탭!</b> 해서 방패로 지켜 줘.<br>취미처럼 <b>공개해도 되는 정보</b>는 그냥 지나가게 두면 돼.',
    howtoIcons: '📇👆🛡️',
    chars: { left: 'eti', right: 'thief' },
    rightName: '정보도둑',
    intro: [
      {
        speaker: ETI,
        side: 'left',
        text: '큰일이야! 비밀의 섬에 <b>정보도둑</b>이 나타났어.\n친구들의 소중한 정보를 훔쳐 가려고 해!'
      },
      {
        speaker: '정보도둑',
        side: 'right',
        text: '흐흐흐… 이름, 집 주소, 전화번호, 비밀번호…\n인터넷에 올라온 개인정보는 전부 내 거다!'
      },
      {
        speaker: ETI,
        side: 'left',
        text: '<b>개인정보</b>는 나와 우리 가족이 누구인지 알 수 있는 정보야.\n이름, 주소, 전화번호, 학교, 비밀번호, 얼굴 사진 같은 것들이지.'
      },
      {
        speaker: ETI,
        side: 'left',
        text: '하지만 좋아하는 색깔이나 취미처럼\n나를 특정할 수 없는 정보는 이야기해도 괜찮아.'
      },
      {
        speaker: ETI,
        side: 'left',
        text: '자, 방패를 들자! 개인정보가 도둑에게 넘어가기 전에\n네가 막아 줘야 해!'
      }
    ],
    mission: '개인정보 카드만 골라 방패로 막고, 하트 3개를 지켜 내자!',
    summary: [
      '<b>개인정보</b>는 이름, 주소, 전화번호, 학교, 비밀번호, 얼굴 사진처럼 나를 알아볼 수 있는 정보예요.',
      '개인정보는 인터넷에 함부로 올리거나 모르는 사람에게 알려 주면 안 돼요.',
      '좋아하는 색·음식·취미처럼 나를 특정할 수 없는 정보는 공개해도 괜찮아요.',
      'AI 챗봇에게도 개인정보는 알려 주지 않아야 해요.'
    ],
    quiz: [
      {
        q: '다음 중 꼭 지켜야 할 개인정보는 무엇일까요?',
        choices: ['좋아하는 계절', '우리 집 주소', '좋아하는 급식 메뉴'],
        answer: 1,
        explain: '집 주소는 나와 가족을 찾아낼 수 있는 중요한 개인정보예요.'
      },
      {
        q: '게임에서 만난 모르는 사람이 전화번호를 물어보면?',
        choices: [
          '친절하게 알려 준다',
          '알려 주지 않고 어른께 말씀드린다',
          '친구 번호를 대신 알려 준다'
        ],
        answer: 1,
        explain: '모르는 사람에게는 절대 알려 주지 않고, 보호자나 선생님께 알려요.'
      },
      {
        q: 'AI 챗봇과 대화할 때 올바른 행동은?',
        choices: [
          '내 이름과 학교, 주소를 자세히 알려 준다',
          '비밀번호를 물어보면 알려 준다',
          '개인정보는 말하지 않고 궁금한 것만 물어본다'
        ],
        answer: 2,
        explain: '챗봇에 입력한 정보도 저장될 수 있어요. 개인정보는 입력하지 않아요.'
      }
    ],
    x: 44,
    y: 68
  },
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
  lesson11,
  lesson12
];

export function getLesson(id: number): Lesson {
  return getLessonFromParam(id);
}

export class UnknownLessonError extends Error {
  readonly value: unknown;

  constructor(value: unknown) {
    super('unknown lesson');
    this.name = 'UnknownLessonError';
    this.value = value;
  }
}

export function getLessonFromParam(value: unknown): Lesson {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new UnknownLessonError(value);
  }
  const lesson = LESSONS.find((candidate) => candidate.id === value);
  if (!lesson) throw new UnknownLessonError(value);
  return lesson;
}
