// 완성된 프로덕션 에셋 목록. 선택적 WebP 최적화본 뒤 PNG, 캐릭터는 SVG 폴백까지 사용합니다.

export const CHARACTER_ASSETS = {
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

export type AssetKey = keyof typeof CHARACTER_ASSETS;

/** 캐릭터 이미지 엘리먼트 생성: WebP → PNG → SVG 순서로 폴백 */
export function charImg(key: string, className = '', alt = ''): HTMLImageElement {
  const img = document.createElement('img');
  if (className) img.className = className;
  img.alt = alt;
  const base = CHARACTER_ASSETS[key as AssetKey] ?? CHARACTER_ASSETS.eti;
  img.src = `${base}.webp`;
  img.onerror = () => {
    if (img.src.endsWith('.webp')) {
      img.src = `${base}.png`;
    } else if (img.src.endsWith('.png')) {
      img.src = `${base}.svg`;
    } else {
      img.onerror = null;
    }
  };
  return img;
}

/**
 * 씬 배경 이미지: 용량이 작은 WebP를 먼저 시도하고, 없으면 PNG,
 * 둘 다 없으면 스스로 사라져 기존 CSS 그라데이션 배경이 그대로 보인다.
 */
export function sceneBg(pngPath: string): HTMLImageElement {
  const img = document.createElement('img');
  img.className = 'scene-bg';
  img.alt = '';
  const webpPath = pngPath.replace(/\.png$/, '.webp');
  img.src = webpPath;
  img.onerror = () => {
    if (img.src.endsWith('.webp')) {
      img.src = pngPath; // WebP가 없으면 PNG로 폴백
    } else {
      img.remove();
    }
  };
  return img;
}
