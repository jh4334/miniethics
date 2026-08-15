import type { CaseData } from './model';

export const CASE_3: CaseData =
  {
    title: '낡은 지도 사건',
    desc: '부릉이가 지도만 믿고 달리다 공사장 앞까지! 한들 아저씨가 재빨리 핸들을 잡아 겨우 멈췄어요.',
    actors: [
      { emoji: '🗺️', x: 60, y: 6, size: 70 },
      { emoji: '🚧', x: 690, y: 108, size: 80 },
      { emoji: '🚗', x: -150, y: 118, size: 88, tx: 470, dur: 1800 },
      { emoji: '🧑', x: 330, y: 24, size: 62, at: 1400, sound: 'pop' },
      { emoji: '💨', x: 566, y: 148, size: 58, at: 1900 }
    ],
    evidence: [
      {
        icon: '🗺️',
        title: '지도 기록',
        desc: '도로관리소는 2주 전에 시작한 공사를 지도 회사에 알리지 않았어요.'
      },
      {
        icon: '🏭',
        title: '설계 문서',
        desc: "로보카 회사는 '지도가 오래되면 속도를 줄이는' 안전장치를 만들어 두지 않았어요."
      },
      {
        icon: '📷',
        title: '블랙박스',
        desc: '한들 아저씨는 규칙대로 앞을 보고 있다가 바로 핸들을 잡아 사고를 막았어요.'
      }
    ],
    defendants: [
      {
        key: 'road',
        icon: '🚧',
        name: '도로관리소',
        sub: '공사 담당',
        min: 3,
        max: 4,
        reason: '공사 소식을 알리지 않았으니 가장 큰 책임이에요.'
      },
      {
        key: 'company',
        icon: '🏭',
        name: '만든 회사',
        sub: '로보카',
        min: 2,
        max: 3,
        reason: '만약을 대비한 안전장치를 만들지 않은 책임이 있어요.'
      },
      {
        key: 'owner',
        icon: '🧑',
        name: '차 주인',
        sub: '한들 아저씨',
        min: 0,
        max: 0,
        reason: '규칙을 잘 지키고 사고까지 막았어요. 책임 없음, 오히려 칭찬!'
      },
      {
        key: 'ai',
        icon: '🚗',
        name: 'AI 부릉이',
        sub: '자율주행차',
        min: 0,
        max: 0,
        ai: true,
        reason: '부릉이는 낡은 지도를 받았을 뿐이에요. 좋은 데이터를 줄 책임은 사람에게 있어요.'
      }
    ]
  };
