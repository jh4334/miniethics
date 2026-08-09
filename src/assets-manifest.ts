// 에셋 목록 - 파일을 같은 이름으로 교체하면 그림이 바뀝니다.
// 자세한 교체 방법은 docs/asset-guide.md 참고.

export const ASSETS = {
  /** 주인공 요원 (권장 512x512, 투명 배경) */
  hero: './assets/common/hero.svg',
  /** 가이드 로봇 '에티' (권장 512x512, 투명 배경) */
  eti: './assets/common/eti.svg',
  /** 1차시 요리사 로봇 '쿡봇' */
  cookbot: './assets/game01/cookbot.svg',
  /** 2차시 과일박사 로봇 '냠봇' */
  nyambot: './assets/game02/nyambot.svg',
  /** 3차시 악당 '정보도둑' */
  thief: './assets/game03/thief.svg'
} as const;

export type AssetKey = keyof typeof ASSETS;

export function asset(key: string): string {
  return ASSETS[key as AssetKey] ?? ASSETS.eti;
}
