import type { CaseData } from '../model';

export const CASE_4: CaseData = {
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
  };
