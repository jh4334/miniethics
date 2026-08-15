import type { CaseData } from './model';

export const CASE_2: CaseData =
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
  };
