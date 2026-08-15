import { band, type CaseData } from './model';

export const CASES_2: CaseData[] = [
  // --- 사건 3 (가짜) : 물 + 그림자 방향 ---
  {
    avatar: '🚨',
    account: '특종헌터',
    caption: '충격!! 태풍 때문에 도로 한복판에 상어가 나타났다!!! 공유 필수!!',
    likes: '15,203',
    shares: '8,410',
    bg: 'linear-gradient(180deg,#8a97a8 0%,#c3ccd6 100%)',
    scene: [
      band(60, 40, { background: 'linear-gradient(180deg,#5b5f66,#3f434a)' }),
      band(84, 1.6, {
        background:
          'repeating-linear-gradient(90deg,#ffe66d 0 44px, rgba(0,0,0,0) 44px 88px)'
      }),
      { x: 35, y: 10, html: '☁️', size: 74 },
      { x: 88, y: 8, html: '☀️', size: 54 },
      { x: 82, y: 25, html: '🚸', size: 68 },
      { x: 20, y: 58, html: '🚗', size: 70 },
      {
        x: 50,
        y: 66,
        html: '',
        css: {
          width: '270px',
          height: '86px',
          background: 'rgba(64,164,223,0.55)',
          borderRadius: '50%',
          border: '4px solid rgba(120,200,240,0.7)'
        }
      },
      // 해(88%,8%)와 같은 오른쪽에 그림자를 두어 '빛의 방향이 안 맞는' 상태를 만든다.
      {
        x: 62,
        y: 76,
        html: '',
        css: {
          width: '180px',
          height: '46px',
          background: 'rgba(20,20,20,0.4)',
          borderRadius: '50%'
        }
      },
      { x: 50, y: 58, html: '🦈', size: 150 }
    ],
    spots: [
      {
        label: '상어 주변 물',
        x: 50,
        y: 68,
        isClue: true,
        zoom: '💧',
        text: '물이 상어 주변에만 동그랗게 있어! 다른 도로는 말라 있는데? <b>합성한 티</b>가 나!',
        note: '상어 주변 물 — 상어 둘레에만 동그랗게 있음'
      },
      {
        label: '상어 그림자',
        x: 64,
        y: 78,
        isClue: true,
        zoom: '🌑',
        text: '해는 오른쪽 위에 있는데 그림자도 해와 <b>같은 쪽</b>에 있어! 그림자는 해 <b>반대쪽</b>에 생겨야 하는데, 빛의 방향이 안 맞아!',
        note: '상어 그림자 — 해와 같은 쪽에 생김(반대쪽이어야 정상)'
      },
      {
        label: '자동차',
        x: 20,
        y: 58,
        isClue: false,
        zoom: '🚗',
        text: '자동차는 평범해.',
        note: '자동차 — 평범함'
      },
      {
        label: '표지판',
        x: 82,
        y: 25,
        isClue: false,
        zoom: '🚸',
        text: '표지판 글자는 또렷하게 잘 보여.',
        note: '표지판 — 글자가 또렷함'
      },
      {
        label: '구름',
        x: 35,
        y: 10,
        isClue: false,
        zoom: '☁️',
        text: '구름 낀 하늘. 태풍이 지나간 것 같긴 해.',
        note: '구름 — 흐린 하늘, 이상 없음'
      },
      {
        label: '상어 이빨',
        x: 44,
        y: 51,
        isClue: false,
        zoom: '🦈',
        text: '무섭게 생겼지만 상어 이빨은 원래 이래.',
        note: '상어 이빨 — 원래 그런 모양'
      }
    ],
    real: false,
    explain:
      "'공유 필수!!'처럼 급하게 퍼뜨리라는 글은 한 번 더 의심! 물과 그림자가 단서였어요."
  },

  // --- 사건 4 (진짜) : 급식판 ---
  {
    avatar: '🍚',
    account: '급식왕',
    caption: '오늘 급식에 치킨이랑 케이크 나옴! 영양사 선생님 감사합니다 🙏',
    likes: '89',
    shares: '4',
    bg: 'linear-gradient(180deg,#a9744f 0%,#7d5233 100%)',
    scene: [
      {
        x: 50,
        y: 58,
        html: '',
        css: {
          width: '420px',
          height: '250px',
          background: 'linear-gradient(180deg,#eef1f6,#c8ccd4)',
          borderRadius: '26px',
          border: '6px solid #b0b5bd'
        }
      },
      { x: 40, y: 45, html: '🍗', size: 82 },
      { x: 60, y: 45, html: '🍰', size: 82 },
      { x: 76, y: 32, html: '🥛', size: 68 },
      {
        x: 76,
        y: 44,
        html: '흰 우유',
        css: {
          fontSize: '20px',
          fontWeight: '800',
          color: '#fff',
          background: 'rgba(0,0,0,0.4)',
          padding: '3px 12px',
          borderRadius: '9px'
        }
      },
      {
        x: 28,
        y: 74,
        html: '',
        css: {
          width: '120px',
          height: '20px',
          background: 'rgba(0,0,0,0.22)',
          borderRadius: '50%'
        }
      },
      { x: 28, y: 70, html: '🥄', size: 62 }
    ],
    spots: [
      {
        label: '치킨',
        x: 40,
        y: 45,
        isClue: false,
        zoom: '🍗',
        text: '맛있어 보이는 치킨. 자연스러워!',
        note: '치킨 — 자연스러움'
      },
      {
        label: '케이크',
        x: 60,
        y: 45,
        isClue: false,
        zoom: '🍰',
        text: '케이크 조각도 평범해.',
        note: '케이크 — 평범함'
      },
      {
        label: '우유갑 글자',
        x: 76,
        y: 32,
        isClue: false,
        zoom: '🥛',
        text: "'흰 우유' 글자가 또렷해. AI 그림이면 글자가 뭉개질 때가 많지.",
        note: '우유갑 글자 — 또렷하게 잘 보임'
      },
      {
        label: '식판',
        x: 50,
        y: 60,
        isClue: false,
        zoom: '🍽️',
        text: '반짝이는 식판. 이상 없음.',
        note: '식판 — 이상 없음'
      },
      {
        label: '숟가락 그림자',
        x: 28,
        y: 74,
        isClue: false,
        zoom: '🥄',
        text: '그림자 방향도 자연스러워.',
        note: '숟가락 그림자 — 방향 자연스러움'
      },
      {
        label: '식탁',
        x: 12,
        y: 80,
        isClue: false,
        zoom: '🪵',
        text: '평범한 식탁이야.',
        note: '식탁 — 평범함'
      }
    ],
    real: true,
    explain: '글자가 또렷하고 그림자도 자연스러웠어요. 진짜 사진이 맞아요!'
  },
];
