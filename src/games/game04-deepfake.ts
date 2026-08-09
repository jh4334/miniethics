// 4차시: 진짜가짜 탐정단 (딥페이크 판별)
// SNS 게시물 6건을 수사한다. 사건마다 돋보기 3번으로 사진 속 지점을 조사해
// 단서(손가락·글자·그림자·경계선·출처)를 모으고, 진짜⭕/가짜❌를 판정한다.

import type { MiniGame, GameCtx } from './registry';
import { el, button, floater } from '../ui/components';
import { charImg } from '../assets-manifest';

// ---------- 데이터 타입 ----------

/** 사진 장면을 구성하는 이모지/도형 하나 (좌표는 사진 영역 % 기준, 중심점) */
interface Obj {
  x: number;
  y: number;
  html: string;
  /** 이모지 크기(px) */
  size?: number;
  /** 추가 인라인 스타일 (camelCase) */
  css?: Record<string, string>;
}

/** 돋보기 조사 지점 */
interface Spot {
  label: string;
  x: number;
  y: number;
  isClue: boolean;
  /** 확대 뷰에 크게 보여 줄 이모지 */
  zoom: string;
  /** 확대 뷰 관찰 텍스트 */
  text: string;
  /** 수사 노트에 남길 짧은 기록 */
  note: string;
}

interface CaseData {
  avatar: string;
  account: string;
  caption: string;
  likes: string;
  shares: string;
  /** 사진 배경 CSS */
  bg: string;
  scene: Obj[];
  spots: Spot[];
  /** 진짜면 true */
  real: boolean;
  explain: string;
}

// ---------- 레이아웃 상수 (1280x800) ----------
const PHOTO = { left: 56, top: 168, w: 588, h: 420 };
const TIME_LIMIT = 45; // 사건당 초
const LENS_PER_CASE = 3;

/** 가로 띠(하늘/잔디/도로/자막 바 등) 도형 헬퍼 */
function band(
  top: number,
  height: number,
  css: Record<string, string>,
  html = ''
): Obj {
  return {
    x: 0,
    y: 0,
    html,
    css: {
      left: '0',
      top: `${top}%`,
      width: '100%',
      height: `${height}%`,
      transform: 'none',
      ...css
    }
  };
}

// ---------- 사건 데이터 (가짜 4 + 진짜 2, 난이도 순서 고정) ----------
const CASES: CaseData[] = [
  // --- 사건 1 (가짜) : 손가락 + 글자 ---
  {
    avatar: '⚽',
    account: '축구광팬99',
    caption: '대박!! 세계 최고 축구선수 로니가 우리 학교 운동장에 떴다!! 실화임 ㄷㄷ',
    likes: '2,847',
    shares: '901',
    bg: 'linear-gradient(180deg,#a9dcff 0%,#dff1ff 60%,#eaf8ff 100%)',
    scene: [
      band(74, 26, { background: 'linear-gradient(180deg,#8ed14f,#4f9e35)' }),
      { x: 82, y: 12, html: '☁️', size: 56 },
      { x: 15, y: 28, html: '🏫', size: 104 },
      {
        x: 50,
        y: 15,
        html: '환영! 로L|우#',
        css: {
          width: '300px',
          height: '62px',
          background: '#ff6b6b',
          border: '5px solid #fff',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '26px',
          fontWeight: '800',
          letterSpacing: '2px',
          filter: 'blur(0.6px)'
        }
      },
      { x: 52, y: 55, html: '🧍‍♂️', size: 150 },
      { x: 44, y: 58, html: '🖐️', size: 44 },
      { x: 62, y: 78, html: '⚽', size: 54 },
      { x: 50, y: 88, html: '👟', size: 44 }
    ],
    spots: [
      {
        label: '선수의 오른손',
        x: 44,
        y: 58,
        isClue: true,
        zoom: '🖐️',
        text: '손가락이… 하나, 둘… <b>여섯 개</b>?! AI가 만든 그림은 손가락 개수가 이상할 때가 많아!',
        note: '선수의 오른손 — 손가락이 여섯 개!'
      },
      {
        label: '현수막 글자',
        x: 63,
        y: 15,
        isClue: true,
        zoom: '🔤',
        text: "현수막 글자가 '환영! 로L|우#'라고 뭉개져 있어. <b>AI는 글자를 잘 못 그려!</b>",
        note: '현수막 글자 — 뭉개져서 읽을 수 없음'
      },
      {
        label: '축구공',
        x: 62,
        y: 78,
        isClue: false,
        zoom: '⚽',
        text: '평범한 축구공이야. 이상한 점은 없어 보여.',
        note: '축구공 — 평범함'
      },
      {
        label: '하늘',
        x: 82,
        y: 12,
        isClue: false,
        zoom: '☁️',
        text: '맑은 하늘이야. 특별히 이상하지 않아.',
        note: '하늘 — 특별한 점 없음'
      },
      {
        label: '학교 건물',
        x: 15,
        y: 28,
        isClue: false,
        zoom: '🏫',
        text: '학교 건물은 자연스러워 보여.',
        note: '학교 건물 — 자연스러움'
      },
      {
        label: '운동화',
        x: 50,
        y: 88,
        isClue: false,
        zoom: '👟',
        text: '운동화는 평범해 보여.',
        note: '운동화 — 평범함'
      }
    ],
    real: false,
    explain: '손가락 6개와 뭉개진 글자! AI 가짜 사진이 남기는 대표 단서예요.'
  },

  // --- 사건 2 (진짜) : 공원 미끄럼틀 ---
  {
    avatar: '🏘️',
    account: '동네소식통',
    caption: '우리 동네 공원에 무지개 미끄럼틀이 새로 생겼어요~ 주말에 놀러 오세요!',
    likes: '134',
    shares: '12',
    bg: 'linear-gradient(180deg,#cfefff 0%,#eafaf0 100%)',
    scene: [
      band(70, 30, { background: 'linear-gradient(180deg,#9be07a,#5cb85c)' }),
      { x: 18, y: 10, html: '☀️', size: 72 },
      { x: 12, y: 40, html: '🌳', size: 96 },
      {
        x: 58,
        y: 82,
        html: '',
        css: {
          width: '200px',
          height: '48px',
          background: 'rgba(60,60,60,0.28)',
          borderRadius: '50%'
        }
      },
      { x: 50, y: 50, html: '🛝', size: 150 },
      { x: 70, y: 62, html: '👧👦', size: 58 },
      { x: 86, y: 70, html: '🪑', size: 62 }
    ],
    spots: [
      {
        label: '미끄럼틀',
        x: 50,
        y: 50,
        isClue: false,
        zoom: '🛝',
        text: '새 미끄럼틀이네. 색도 모양도 자연스러워.',
        note: '미끄럼틀 — 색과 모양 자연스러움'
      },
      {
        label: '그림자',
        x: 58,
        y: 82,
        isClue: false,
        zoom: '🌑',
        text: '그림자가 해 반대쪽으로 나 있어. 빛의 방향이 딱 맞아!',
        note: '그림자 — 빛의 방향과 딱 맞음'
      },
      {
        label: '나무',
        x: 12,
        y: 40,
        isClue: false,
        zoom: '🌳',
        text: '나뭇잎이 자연스러워.',
        note: '나무 — 나뭇잎 자연스러움'
      },
      {
        label: '아이들 손',
        x: 70,
        y: 62,
        isClue: false,
        zoom: '✋',
        text: '손가락도 다섯 개씩, 정상이야!',
        note: '아이들 손 — 손가락 다섯 개, 정상'
      },
      {
        label: '벤치',
        x: 86,
        y: 70,
        isClue: false,
        zoom: '🪑',
        text: '평범한 벤치야.',
        note: '벤치 — 평범함'
      },
      {
        label: '해',
        x: 18,
        y: 10,
        isClue: false,
        zoom: '☀️',
        text: '해가 쨍쨍해. 이상 없음!',
        note: '해 — 이상 없음'
      }
    ],
    real: true,
    explain: '어색한 단서가 하나도 없었죠? 꼼꼼히 살펴도 단서가 없으면 진짜일 가능성이 높아요.'
  },

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
      {
        x: 40,
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
        x: 38,
        y: 78,
        isClue: true,
        zoom: '🌑',
        text: '해는 오른쪽에 있는데 그림자는 반대쪽이야. <b>빛의 방향이 안 맞아!</b>',
        note: '상어 그림자 — 빛의 방향과 반대'
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

  // --- 사건 5 (가짜) : 좌우 비대칭 + 겹침 + 출처 ---
  {
    avatar: '📺',
    account: '찐뉴스TV (구독자 3명)',
    caption: "속보!! 대통령이 '전국 초등학생 숙제 금지법'을 발표했습니다!",
    likes: '52,412',
    shares: '30,118',
    bg: 'linear-gradient(180deg,#1b2a5e 0%,#2c3f86 100%)',
    scene: [
      band(
        82,
        18,
        {
          background: '#c0392b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '26px',
          fontWeight: '800'
        },
        '속보 | 숙제 금지법 발표'
      ),
      { x: 14, y: 22, html: '🇰🇷', size: 74 },
      { x: 50, y: 42, html: '🧑‍💼', size: 172 },
      {
        x: 43,
        y: 34,
        html: '',
        css: {
          width: '24px',
          height: '32px',
          background: '#f2c9a0',
          borderRadius: '50%',
          border: '2px solid #d9a87c'
        }
      },
      {
        x: 57,
        y: 34,
        html: '',
        css: {
          width: '46px',
          height: '58px',
          background: '#f2c9a0',
          borderRadius: '50%',
          border: '2px solid #d9a87c'
        }
      },
      { x: 53, y: 64, html: '✋', size: 56 },
      { x: 55, y: 62, html: '🎤', size: 62 }
    ],
    spots: [
      {
        label: '양쪽 귀',
        x: 50,
        y: 33,
        isClue: true,
        zoom: '👂',
        text: '왼쪽 귀와 오른쪽 귀 모양이 완전히 달라! <b>AI 영상은 좌우가 안 맞을 때가 많아.</b>',
        note: '양쪽 귀 — 좌우 크기와 모양이 다름'
      },
      {
        label: '마이크와 손',
        x: 61,
        y: 66,
        isClue: true,
        zoom: '🎤',
        text: '마이크가 손가락을 <b>뚫고</b> 지나가고 있어! 진짜 영상이면 불가능하지.',
        note: '마이크와 손 — 마이크가 손가락을 통과함'
      },
      {
        label: '자막',
        x: 14,
        y: 88,
        isClue: false,
        zoom: '🔤',
        text: '자막 글자는 또렷하게 보여.',
        note: '자막 — 글자 또렷함'
      },
      {
        label: '넥타이',
        x: 44,
        y: 53,
        isClue: false,
        zoom: '👔',
        text: '넥타이는 평범해.',
        note: '넥타이 — 평범함'
      },
      {
        label: '태극기',
        x: 14,
        y: 22,
        isClue: false,
        zoom: '🇰🇷',
        text: '태극기는 자연스러워.',
        note: '태극기 — 자연스러움'
      },
      {
        label: '머리카락',
        x: 41,
        y: 18,
        isClue: false,
        zoom: '💇',
        text: '머리 모양은 딱히 이상하지 않아.',
        note: '머리카락 — 이상 없음'
      }
    ],
    real: false,
    explain:
      "이런 소식이 진짜라면 모든 뉴스에 나왔겠죠? <b>구독자 3명</b> 채널의 '속보'는 꼭 의심하고, 다른 뉴스와 비교해 확인해요."
  },

  // --- 사건 6 (가짜) : 얼굴 합성, 친구 피해 ---
  {
    avatar: '👤',
    account: '누군지몰라요 (프로필 없음)',
    caption: '우리 반 민지가 학교 유리창을 깨는 장면 포착! 민지 최악!',
    likes: '12',
    shares: '37',
    bg: 'linear-gradient(180deg,#f0e4d0 0%,#e2d3b6 100%)',
    scene: [
      band(70, 30, { background: 'linear-gradient(180deg,#cbb894,#a89272)' }),
      {
        x: 75,
        y: 26,
        html: '<span style="font-size:86px">✱</span>',
        css: {
          width: '150px',
          height: '120px',
          background: 'rgba(180,225,240,0.6)',
          border: '8px solid #8b6f47',
          borderRadius: '6px',
          color: '#33485e'
        }
      },
      { x: 20, y: 60, html: '⚽', size: 58 },
      { x: 52, y: 82, html: '👟', size: 48 },
      // 얼굴 중심이 emoji 박스 중심보다 아래에 그려지므로 인물을 위로 올려
      // 밝은 하이라이트(얼굴)와 목 경계선을 배치할 공간을 만든다.
      { x: 50, y: 36, html: '👧', size: 172 },
      band(0, 100, { background: 'rgba(15,12,30,0.42)' }),
      {
        x: 50,
        y: 47,
        html: '',
        css: {
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,235,0.78) 0%, rgba(255,255,235,0.5) 45%, rgba(255,255,235,0) 72%)'
        }
      },
      {
        x: 50,
        y: 61,
        html: '',
        css: {
          width: '104px',
          height: '5px',
          background: 'rgba(255,255,255,0.85)',
          transform: 'translate(-50%,-50%) rotate(-7deg)',
          boxShadow: '0 3px 0 rgba(0,0,0,0.35)'
        }
      }
    ],
    spots: [
      {
        label: '얼굴 밝기',
        x: 50,
        y: 44,
        isClue: true,
        zoom: '😶',
        text: '몸은 어두운데 <b>얼굴만 환하게 밝아</b>. 다른 사진의 얼굴을 붙인 것 같아!',
        note: '얼굴 밝기 — 몸은 어두운데 얼굴만 환함'
      },
      {
        label: '목 경계선',
        x: 50,
        y: 63,
        isClue: true,
        zoom: '➖',
        text: '목에 어긋난 경계선이 보여. <b>얼굴 합성</b>의 대표 단서야!',
        note: '목 경계선 — 어긋난 합성 자국'
      },
      {
        label: '깨진 유리창',
        x: 75,
        y: 26,
        isClue: false,
        zoom: '🪟',
        text: '유리창이 깨져 있긴 하네…',
        note: '깨진 유리창 — 깨져 있음(누가 그랬는지는 모름)'
      },
      {
        label: '복도 바닥',
        x: 30,
        y: 78,
        isClue: false,
        zoom: '🧱',
        text: '바닥은 평범한 복도야.',
        note: '복도 바닥 — 평범함'
      },
      {
        label: '신발',
        x: 52,
        y: 82,
        isClue: false,
        zoom: '👟',
        text: '신발은 평범해.',
        note: '신발 — 평범함'
      },
      {
        label: '공',
        x: 20,
        y: 60,
        isClue: false,
        zoom: '⚽',
        text: '공이 떨어져 있네. 그 자체로는 단서가 아니야.',
        note: '공 — 단서 아님'
      }
    ],
    real: false,
    explain:
      '가짜 사진으로 친구를 나쁘게 말하는 것이 딥페이크의 가장 큰 피해예요. 이런 게시물은 퍼뜨리지 말고 <b>어른께 알려요</b>.'
  }
];

const TOTAL_CLUES = CASES.reduce(
  (s, c) => s + c.spots.filter((sp) => sp.isClue).length,
  0
); // 8

const CSS = `
.g04-scene { background: linear-gradient(180deg,#ffe6f0 0%,#fff6fa 55%,#f2ecff 100%); }
.g04-lens {
  font-size: 24px; font-weight: 800; background: rgba(255,255,255,0.92);
  padding: 8px 18px; border-radius: 999px; box-shadow: var(--shadow); white-space: nowrap;
}
.g04-post {
  position: absolute; left: 40px; top: 86px; width: 620px; height: 694px;
  background: #fff; border-radius: 22px; box-shadow: var(--shadow);
  padding: 16px; box-sizing: border-box;
}
.g04-post-head { height: 66px; display: flex; align-items: center; gap: 12px; }
.g04-avatar {
  width: 54px; height: 54px; border-radius: 50%; background: #f1edff;
  display: flex; align-items: center; justify-content: center; font-size: 32px; flex: none;
}
.g04-account { flex: 1; font-size: 23px; font-weight: 800; color: var(--ink); line-height: 1.25; }
.g04-badge {
  font-size: 20px; font-weight: 800; color: #fff; background: var(--purple);
  padding: 7px 15px; border-radius: 999px; flex: none;
}
.g04-photo {
  position: relative; width: 588px; height: 420px; border-radius: 14px; overflow: hidden;
}
.g04-obj {
  position: absolute; transform: translate(-50%,-50%);
  display: flex; align-items: center; justify-content: center; line-height: 1;
  text-align: center;
}
.g04-marker {
  position: absolute; width: 72px; height: 72px; transform: translate(-50%,-50%);
  border-radius: 50%; border: 4px solid rgba(255,255,255,0.92);
  background: rgba(255,255,255,0.26); color: #fff; font-size: 32px; padding: 0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  font-family: var(--font); z-index: 6; animation: g04-twinkle 1.5s ease-in-out infinite;
}
@keyframes g04-twinkle {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.75); }
  50% { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
}
.g04-marker.found {
  border-color: var(--red); background: rgba(255,107,107,0.4); animation: none;
}
.g04-marker.checked {
  border-color: rgba(110,110,120,0.9); background: rgba(110,110,120,0.4); animation: none;
}
.g04-marker.off { opacity: 0.32; animation: none; cursor: default; }
.g04-caption {
  margin-top: 14px; font-size: 22px; font-weight: 700; line-height: 1.4; color: var(--ink);
}
.g04-meta { margin-top: 10px; font-size: 20px; color: var(--ink-soft); }
.g04-zoom-back { position: absolute; inset: 0; background: rgba(30,25,50,0.55); z-index: 15; }
.g04-zoom {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  width: 470px; background: var(--paper); border-radius: 20px; padding: 16px 20px 18px;
  z-index: 16; text-align: center; box-shadow: 0 10px 0 rgba(0,0,0,0.2);
  animation: pop-in 0.25s ease;
}
.g04-zoom-emoji { font-size: 76px; line-height: 1.1; }
.g04-zoom-title { font-size: 22px; font-weight: 800; color: var(--purple); }
.g04-zoom-text { font-size: 22px; line-height: 1.5; margin: 8px 0 14px; color: var(--ink); }
.g04-stamp {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%,-50%) rotate(-14deg);
  font-size: 46px; font-weight: 800; padding: 14px 28px; border-radius: 18px;
  border: 8px solid; background: rgba(255,255,255,0.92); z-index: 18; white-space: nowrap;
  animation: g04-stamp-in 0.4s ease;
}
.g04-stamp.ok { color: var(--green); border-color: var(--green); }
.g04-stamp.no { color: var(--red); border-color: var(--red); }
@keyframes g04-stamp-in {
  from { transform: translate(-50%,-50%) rotate(-14deg) scale(2.6); opacity: 0; }
  to { transform: translate(-50%,-50%) rotate(-14deg) scale(1); opacity: 1; }
}
.g04-note {
  position: absolute; left: 690px; top: 86px; width: 550px; height: 694px;
  padding: 16px 18px; box-sizing: border-box; display: flex; flex-direction: column;
}
.g04-detective { display: flex; align-items: center; gap: 12px; }
.g04-detective img { height: 104px; flex: none; }
.g04-bubble {
  flex: 1; background: #fff; border: 4px solid var(--ink); border-radius: 16px;
  padding: 10px 14px; font-size: 22px; font-weight: 700; line-height: 1.35; color: var(--ink);
}
.g04-notes-title { margin-top: 12px; font-size: 23px; font-weight: 800; color: var(--ink); }
.g04-notes {
  flex: 1; margin-top: 8px; overflow-y: auto; background: #fff;
  border-radius: 14px; padding: 12px 14px; min-height: 0;
}
.g04-line { font-size: 22px; line-height: 1.4; margin-bottom: 10px; }
.g04-line.clue { color: var(--red); font-weight: 800; }
.g04-line.ok { color: var(--ink-soft); }
.g04-line.miss { color: var(--red); font-weight: 700; opacity: 0.85; }
.g04-empty { font-size: 22px; color: var(--ink-soft); line-height: 1.4; }
.g04-verdict { display: flex; gap: 14px; margin-top: 14px; }
.g04-verdict .btn { flex: 1; min-height: 76px; font-size: 26px; }
/* 사건 전환 직후 오탭 방지: 잠깐 입력을 막는다 (모양은 그대로) */
.g04-verdict.g04-lock { pointer-events: none; }
.g04-answer { font-size: 30px; font-weight: 800; text-align: center; margin: 6px 0 10px; }
.g04-answer.ok { color: var(--green); }
.g04-answer.no { color: var(--red); }
.g04-explain-text {
  flex: 1; background: #fff; border-radius: 14px; padding: 14px 16px;
  font-size: 23px; line-height: 1.55; color: var(--ink); overflow-y: auto; min-height: 0;
}
.g04-next { margin-top: 14px; min-height: 76px; font-size: 26px; width: 100%; }
`;

export const game04: MiniGame = {
  lessonId: 4,
  mount(container: HTMLElement, ctx: GameCtx) {
    // ---------- 전용 스타일 주입 ----------
    const styleEl = document.createElement('style');
    styleEl.id = 'g04-style';
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    const wrap = el('div', 'game-wrap g04-scene');
    container.appendChild(wrap);

    // ---------- 상태 ----------
    type Phase = 'investigate' | 'verdict' | 'explain' | 'over';
    let phase: Phase = 'investigate';
    let caseIdx = 0;
    let correctCount = 0;
    let clueCount = 0;
    let lensLeft = LENS_PER_CASE;
    let timeLeft = TIME_LIMIT;
    /** 사건 전환 직후 판정 입력을 무시할 시각(ms) — 연속 탭 오판정 방지 */
    let judgeLockUntil = 0;
    const JUDGE_LOCK_MS = 450;
    let ended = false; // 게임 종료(오버레이 표시)
    let done = false; // finish/quit 중복 방지
    const timers: number[] = [];
    /** 이번 사건에서 이미 조사한 지점 index */
    let used = new Set<number>();
    /** 이번 사건의 마커 엘리먼트 */
    let markers: HTMLButtonElement[] = [];

    function safeFinish(score: number) {
      if (done) return;
      done = true;
      ctx.finish(score);
    }
    function safeQuit() {
      if (done) return;
      done = true;
      ctx.quit();
    }
    function later(fn: () => void, ms: number) {
      timers.push(window.setTimeout(fn, ms));
    }
    function curScore() {
      return correctCount * 10 + clueCount * 5;
    }

    // ---------- 상단 바 ----------
    const topbar = el('div', 'game-topbar');
    const quitBtn = button('🗺️', () => safeQuit(), 'icon-btn');
    const nameEl = el('div', 'game-name', '🔍 진짜가짜 탐정단');
    const timer = el('div', 'timer-bar');
    const fill = el('div', 'timer-fill');
    timer.appendChild(fill);
    const lensEl = el('div', 'g04-lens', '🔍×3');
    const scoreEl = el('div', 'game-score', '점수 0');
    topbar.append(quitBtn, nameEl, timer, lensEl, scoreEl);
    wrap.appendChild(topbar);

    // ---------- 게시물 카드 / 수사 노트 ----------
    const post = el('div', 'g04-post');
    const note = el('div', 'card g04-note');
    wrap.append(post, note);

    function updateHud() {
      lensEl.textContent = `🔍×${lensLeft}`;
      scoreEl.textContent = `점수 ${curScore()}`;
    }

    // ---------- 사건 렌더링 ----------
    let photo: HTMLElement;
    let bubble: HTMLElement;
    let notesBox: HTMLElement;
    let notesTitle: HTMLElement;
    let verdictRow: HTMLElement;

    function say(text: string) {
      if (bubble) bubble.textContent = text;
    }

    function renderCase() {
      const c = CASES[caseIdx];
      phase = 'investigate';
      closeZoom();
      lensLeft = LENS_PER_CASE;
      timeLeft = TIME_LIMIT;
      used = new Set<number>();
      markers = [];
      fill.style.width = '100%';
      fill.classList.remove('danger');
      updateHud();

      // --- 게시물 ---
      post.innerHTML = '';
      const head = el('div', 'g04-post-head');
      const avatar = el('div', 'g04-avatar', c.avatar);
      const account = el('div', 'g04-account', c.account);
      const badge = el('div', 'g04-badge', `사건 ${caseIdx + 1}/6`);
      head.append(avatar, account, badge);

      photo = el('div', 'g04-photo');
      photo.style.background = c.bg;
      for (const o of c.scene) {
        const d = el('div', 'g04-obj', o.html);
        d.style.left = `${o.x}%`;
        d.style.top = `${o.y}%`;
        if (o.size) d.style.fontSize = `${o.size}px`;
        if (o.css) Object.assign(d.style, o.css);
        photo.appendChild(d);
      }
      c.spots.forEach((spot, i) => {
        const m = el('button', 'g04-marker', '✨');
        m.style.left = `${spot.x}%`;
        m.style.top = `${spot.y}%`;
        m.setAttribute('aria-label', `${spot.label} 조사하기`);
        m.addEventListener('click', () => investigate(i, m));
        photo.appendChild(m);
        markers.push(m);
      });

      const caption = el('div', 'g04-caption', c.caption);
      const meta = el('div', 'g04-meta', `❤️ ${c.likes}   🔁 ${c.shares}`);
      post.append(head, photo, caption, meta);

      // --- 수사 노트 ---
      note.innerHTML = '';
      const detective = el('div', 'g04-detective');
      bubble = el('div', 'g04-bubble', '이 게시물, 진짜일까?');
      detective.append(charImg('char04', '', '찰칵이'), bubble);

      notesTitle = el('div', 'g04-notes-title', '📓 수사 노트');
      notesBox = el('div', 'g04-notes');
      notesBox.innerHTML =
        '<div class="g04-empty">사진 위 <b>✨ 돋보기 지점</b>을 탭해서 살펴보자! (3번 가능)</div>';

      verdictRow = el('div', 'g04-verdict g04-lock');
      const realBtn = button('진짜야! ⭕', () => judge(true), 'btn big mint');
      const fakeBtn = button('가짜야! ❌', () => judge(false), 'btn big pink');
      verdictRow.append(realBtn, fakeBtn);

      note.append(detective, notesTitle, notesBox, verdictRow);

      // 이전 화면의 '다음 사건 ▶' 버튼과 판정 버튼이 같은 자리에 있어서,
      // 빠르게 두 번 탭하면 두 번째 탭이 새 사건의 판정으로 떨어질 수 있다.
      // 사건이 시작된 직후 잠깐(0.45초) 판정 입력을 막는다.
      judgeLockUntil = Date.now() + JUDGE_LOCK_MS;
      const lockedRow = verdictRow;
      later(() => lockedRow.classList.remove('g04-lock'), JUDGE_LOCK_MS);
    }

    function addNote(cls: string, text: string) {
      const empty = notesBox.querySelector('.g04-empty');
      if (empty) empty.remove();
      const line = el('div', `g04-line ${cls}`, text);
      notesBox.appendChild(line);
      notesBox.scrollTop = notesBox.scrollHeight;
    }

    // ---------- 돋보기 조사 ----------
    function investigate(i: number, marker: HTMLButtonElement) {
      if (phase !== 'investigate' || ended) return;
      if (used.has(i) || lensLeft <= 0) return;
      const c = CASES[caseIdx];
      const spot = c.spots[i];
      used.add(i);
      lensLeft--;

      const fx = PHOTO.left + (spot.x / 100) * PHOTO.w;
      const fy = PHOTO.top + (spot.y / 100) * PHOTO.h;

      if (spot.isClue) {
        clueCount++;
        marker.className = 'g04-marker found';
        marker.textContent = '📌';
        ctx.audio.good();
        floater(wrap, fx, fy, '단서 발견! 🔎', true);
        addNote('clue', `🔎 단서: ${spot.note}`);
        say('오오, 예리한데!');
      } else {
        marker.className = 'g04-marker checked';
        marker.textContent = '✅';
        ctx.audio.pop();
        floater(wrap, fx, fy, '이상 없음 ✅', true);
        addNote('ok', `✅ 이상 없음: ${spot.note}`);
      }
      updateHud();
      showZoom(spot);

      if (lensLeft <= 0) {
        markers.forEach((m, idx) => {
          if (!used.has(idx)) {
            m.classList.add('off');
            m.disabled = true;
          }
        });
        say('돋보기를 다 썼어! 이제 판정할 시간이야.');
      }
    }

    let zoomEls: HTMLElement[] = [];
    function closeZoom() {
      zoomEls.forEach((e) => e.remove());
      zoomEls = [];
    }

    function showZoom(spot: Spot) {
      closeZoom();
      const back = el('div', 'g04-zoom-back');
      const cardEl = el('div', 'g04-zoom');
      cardEl.innerHTML = `
        <div class="g04-zoom-emoji">${spot.zoom}</div>
        <div class="g04-zoom-title">🔍 ${spot.label} 확대</div>
        <div class="g04-zoom-text">${spot.text}</div>`;
      cardEl.appendChild(button('닫기 ✖️', () => closeZoom(), 'btn'));
      back.addEventListener('click', () => closeZoom());
      zoomEls = [back, cardEl];
      photo.append(back, cardEl);
    }

    // ---------- 판정 ----------
    function judge(guess: boolean | null) {
      if (phase !== 'investigate' || ended) return;
      // 사건 전환 직후의 연속 탭은 무시 (시간 초과 판정 guess===null 은 예외)
      if (guess !== null && Date.now() < judgeLockUntil) return;
      judgeLockUntil = 0;
      phase = 'verdict';
      closeZoom();
      const c = CASES[caseIdx];
      const ok = guess !== null && guess === c.real;

      // 남은 마커 잠그기
      markers.forEach((m, idx) => {
        m.disabled = true;
        if (!used.has(idx)) m.classList.add('off');
      });

      const stamp = el('div', `g04-stamp ${ok ? 'ok' : 'no'}`);
      if (ok) {
        correctCount++;
        stamp.textContent = c.real ? '⭕ 진짜 확인' : '❌ 가짜 판정';
        ctx.audio.good();
        say('역시 탐정단이야!');
      } else {
        stamp.textContent = guess === null ? '⏰ 시간 초과!' : '💦 판정 실패';
        ctx.audio.bad();
        say('괜찮아, 다음 사건에서 만회하자!');
      }
      photo.appendChild(stamp);
      updateHud();
      later(showExplain, 1100);
    }

    // ---------- 해설 ----------
    function showExplain() {
      if (ended) return;
      phase = 'explain';
      const c = CASES[caseIdx];

      // 못 찾은 단서를 사진 위에 공개
      const missed: Spot[] = [];
      c.spots.forEach((spot, idx) => {
        if (spot.isClue && !used.has(idx)) {
          missed.push(spot);
          const m = markers[idx];
          m.className = 'g04-marker found';
          m.textContent = '📌';
        }
      });

      notesTitle.textContent = '📢 사건의 진실';
      notesBox.innerHTML = '';
      const answer = el(
        'div',
        `g04-answer ${c.real ? 'ok' : 'no'}`,
        c.real ? '이 게시물은 진짜! ⭕' : '이 게시물은 가짜! ❌'
      );
      let body = c.explain;
      if (missed.length) {
        body += '<br><br><b>놓친 단서 📌</b><br>';
        body += missed.map((s) => `· ${s.note}`).join('<br>');
      }
      const explainBox = el('div', 'g04-explain-text', body);

      verdictRow.innerHTML = '';
      const last = caseIdx >= CASES.length - 1;
      const nextBtn = button(
        last ? '수사 결과 보기 🏆' : '다음 사건 ▶',
        () => nextCase(),
        'btn big yellow g04-next'
      );
      verdictRow.appendChild(nextBtn);

      note.innerHTML = '';
      const detective = el('div', 'g04-detective');
      const b = el('div', 'g04-bubble', bubble.textContent || '');
      bubble = b;
      detective.append(charImg('char04', '', '찰칵이'), b);
      note.append(detective, notesTitle, answer, explainBox, verdictRow);
    }

    function nextCase() {
      if (ended) return;
      if (caseIdx >= CASES.length - 1) {
        gameOver();
        return;
      }
      caseIdx++;
      renderCase();
    }

    // ---------- 종료 ----------
    function gameOver() {
      if (ended) return;
      ended = true;
      phase = 'over';
      const score = Math.max(0, Math.min(100, curScore()));
      const grade =
        score >= 90
          ? '전설의 탐정! 🕵️✨'
          : score >= 70
            ? '베테랑 탐정! 🔍'
            : score >= 40
              ? '견습 탐정 💪'
              : '신입 탐정 🌱';

      const overlay = el('div', 'game-over-overlay');
      const cardEl = el('div', 'card howto-card');
      cardEl.innerHTML = `
        <h2>${grade}</h2>
        <div class="howto-icons">🔍🕵️📰</div>
        <div class="howto-desc">
          정확한 판정: <b>${correctCount} / ${CASES.length}</b><br>
          발견한 단서: <b>${clueCount} / ${TOTAL_CLUES}</b><br><br>
          겉모습만 믿지 말고 단서와 출처를 확인하는 것, 그게 진짜 탐정이야!
        </div>`;
      const doneBtn = button('결과 보기 🏆', () => safeFinish(score), 'btn big yellow');
      cardEl.appendChild(doneBtn);
      overlay.appendChild(cardEl);
      wrap.appendChild(overlay);
      if (score >= 70) ctx.audio.fanfare();
      else ctx.audio.star();
    }

    // ---------- 타이머 ----------
    const tick = window.setInterval(() => {
      if (ended || phase !== 'investigate') return;
      timeLeft -= 0.2;
      const pct = Math.max(0, (timeLeft / TIME_LIMIT) * 100);
      fill.style.width = `${pct}%`;
      fill.classList.toggle('danger', pct < 25);
      if (timeLeft <= 0) judge(null);
    }, 200);

    renderCase();

    return () => {
      ended = true;
      clearInterval(tick);
      timers.forEach((t) => clearTimeout(t));
      styleEl.remove();
      wrap.remove();
    };
  }
};
