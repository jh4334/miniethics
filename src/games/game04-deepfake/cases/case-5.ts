import { band, type CaseData } from '../model';

export const CASE_5: CaseData = {
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
  };
