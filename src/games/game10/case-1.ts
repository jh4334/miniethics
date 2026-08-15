import type { CaseData } from './model';

export const CASE_1: CaseData =
  {
    title: '노란 신호 사건',
    desc: '부릉이가 교차로에서 노란 신호를 초록 신호로 착각! 끼익—! 자전거와 부딪힐 뻔했어요. (자전거 바퀴 파손, 다친 사람은 없음)',
    actors: [
      { emoji: '🚦', x: 400, y: 0, size: 76 },
      { emoji: '🚗', x: -150, y: 118, size: 88, tx: 330, dur: 1700 },
      { emoji: '🚲', x: 900, y: 126, size: 76, tx: 520, dur: 1700 },
      { emoji: '💥', x: 428, y: 96, size: 84, at: 1750, sound: 'bad' },
      { emoji: '😱', x: 588, y: 34, size: 62, at: 1950 }
    ],
    evidence: [
      {
        icon: '📷',
        title: '블랙박스 기록',
        desc: '부릉이의 눈(카메라)이 노란 신호를 초록 신호로 잘못 읽었어요.'
      },
      {
        icon: '🏭',
        title: '로보카 회사 회의록',
        desc: "회사는 '노란 신호를 가끔 잘못 본다'는 오류를 3달 전에 알고도 업데이트를 미뤘어요."
      },
      {
        icon: '😴',
        title: '차 안 카메라',
        desc: "차 주인 한들 아저씨는 '위험하면 핸들을 잡으세요' 규칙을 알면서도 푹 잠들어 있었어요."
      }
    ],
    defendants: [
      {
        key: 'company',
        icon: '🏭',
        name: '만든 회사',
        sub: '로보카',
        min: 3,
        max: 4,
        reason: '오류를 알고도 고치지 않았으니 가장 큰 책임이에요.'
      },
      {
        key: 'owner',
        icon: '🧑',
        name: '차 주인',
        sub: '한들 아저씨',
        min: 2,
        max: 3,
        reason: '규칙을 어기고 잠들었으니 책임이 있어요.'
      },
      {
        key: 'ai',
        icon: '🚗',
        name: 'AI 부릉이',
        sub: '자율주행차',
        min: 0,
        max: 0,
        ai: true,
        reason: '부릉이는 책임을 질 수 없어요. 대신 회사가 부릉이를 고쳐야 해요.'
      }
    ]
  };
