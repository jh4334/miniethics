import { band, type CaseData } from '../model';

export const CASE_1: CaseData = {
    avatar: '⚽',
    account: '축구광팬99',
    caption: '대박!! 세계 최고 축구선수 로니가 우리 학교 운동장에 떴다!! 실화임\u00a0ㄷㄷ',
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
          color: '#3a3352',
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
  };
