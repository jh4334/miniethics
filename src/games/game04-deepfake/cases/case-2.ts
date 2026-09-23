import { band, type CaseData } from '../model';

export const CASE_2: CaseData = {
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
  };
