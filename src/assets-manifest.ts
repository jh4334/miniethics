// 에셋 목록 - 같은 폴더에 같은 이름의 PNG를 넣으면 자동으로 PNG를 사용합니다.
// (PNG가 없으면 기본 SVG 플레이스홀더 사용. 자세한 방법은 docs/asset-guide.md)

const BASE = {
  /** 주인공 요원 (권장 1024x1024, 투명 배경) */
  hero: './assets/common/hero',
  /** 가이드 로봇 '에티' */
  eti: './assets/common/eti',
  /** 1차시 요리사 로봇 '쿡봇' */
  cookbot: './assets/game01/cookbot',
  /** 2차시 과일박사 로봇 '냠봇' */
  nyambot: './assets/game02/nyambot',
  /** 3차시 악당 '정보도둑' */
  thief: './assets/game03/thief',
  /** 4~12차시 등장 캐릭터 (각 차시 스토리·게임에서 사용) */
  char04: './assets/game04/char04',
  char05: './assets/game05/char05',
  char06: './assets/game06/char06',
  char07: './assets/game07/char07',
  char08: './assets/game08/char08',
  char09: './assets/game09/char09',
  char10: './assets/game10/char10',
  char11: './assets/game11/char11',
  char12: './assets/game12/char12'
} as const;

export type AssetKey = keyof typeof BASE;

/** 캐릭터 이미지 엘리먼트 생성: PNG 우선, 없으면 SVG 플레이스홀더로 폴백 */
export function charImg(key: string, className = '', alt = ''): HTMLImageElement {
  const img = document.createElement('img');
  if (className) img.className = className;
  img.alt = alt;
  const base = BASE[key as AssetKey] ?? BASE.eti;
  img.src = `${base}.png`;
  img.onerror = () => {
    img.onerror = null;
    img.src = `${base}.svg`;
  };
  return img;
}
