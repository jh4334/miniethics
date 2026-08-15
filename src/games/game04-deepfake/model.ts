export interface Obj {
  x: number;
  y: number;
  html: string;
  /** 이모지 크기(px) */
  size?: number;
  /** 추가 인라인 스타일 (camelCase) */
  css?: Record<string, string>;
}

/** 돋보기 조사 지점 */
export interface Spot {
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

export interface CaseData {
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
export const PHOTO = { left: 56, top: 168, w: 588, h: 420 };
export const TIME_LIMIT = 45; // 사건당 초
export const LENS_PER_CASE = 3;

/** 가로 띠(하늘/잔디/도로/자막 바 등) 도형 헬퍼 */
export function band(
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
