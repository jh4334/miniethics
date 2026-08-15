import { band, type CaseData } from './model';

export const CASES_1: CaseData[] = [
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
];
