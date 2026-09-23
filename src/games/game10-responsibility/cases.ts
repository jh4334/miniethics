import type { CaseData } from './model';

export const CASES: CaseData[] = [
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
    },
  {
      title: '진흙 센서 사건',
      desc: '비 오는 날, 부릉이가 정지 표지판을 그냥 지나쳤어요! 알고 보니 카메라에 진흙이 잔뜩 묻어 있었어요.',
      actors: [
        { emoji: '🌧️', x: 120, y: -4, size: 58 },
        { emoji: '🌧️', x: 470, y: 6, size: 58 },
        { emoji: '🌧️', x: 760, y: -4, size: 58 },
        { emoji: '🛑', x: 596, y: 104, size: 78 },
        { emoji: '🚗', x: -150, y: 118, size: 88, tx: 780, dur: 2000 },
        { emoji: '💨', x: 660, y: 150, size: 58, at: 1500, sound: 'bad' },
        { emoji: '🟤', x: 828, y: 58, size: 58, at: 2100 }
      ],
      evidence: [
        {
          icon: '⚠️',
          title: '계기판 기록',
          desc: "'센서를 닦아 주세요' 경고가 30일 동안 켜져 있었어요."
        },
        {
          icon: '📱',
          title: '회사 문자 기록',
          desc: "로보카 회사는 '센서를 꼭 닦아 주세요' 안내 문자를 세 번이나 보냈어요."
        },
        {
          icon: '🧽',
          title: '세차 기록',
          desc: "한들 아저씨는 한 달 동안 한 번도 센서를 닦지 않았어요. '귀찮아서…'"
        }
      ],
      defendants: [
        {
          key: 'company',
          icon: '🏭',
          name: '만든 회사',
          sub: '로보카',
          min: 0,
          max: 2,
          reason: '경고와 문자로 할 일을 했어요. 하지만 더 안전한 장치를 고민할 책임은 남아 있어요.'
        },
        {
          key: 'owner',
          icon: '🧑',
          name: '차 주인',
          sub: '한들 아저씨',
          min: 4,
          max: 6,
          reason: '경고를 한 달이나 무시했으니 이번엔 주인 책임이 가장 커요.'
        },
        {
          key: 'ai',
          icon: '🚗',
          name: 'AI 부릉이',
          sub: '자율주행차',
          min: 0,
          max: 0,
          ai: true,
          reason: '부릉이는 진흙을 스스로 닦을 수 없어요. 관리해 줄 사람이 필요해요.'
        }
      ]
    },
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
    }
];
