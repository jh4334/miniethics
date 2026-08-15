import { band, type CaseData } from './model';

export const CASES_3: CaseData[] = [
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
