// ============================================
// 중앙 에셋 맵
// 지금은 이모지 플레이스홀더. 이미지로 교체하려면
// 값을 { img: 'assets/characters/robot.png' } 형태로 바꾸면 됨.
// 사용법은 ASSETS.md 참고.
// ============================================

export const ASSETS = {
  mascot: '🤖',        // 메인 마스코트 로봇
  mascotHappy: '😄',
  teacher: '🧑‍🏫',
  star: '⭐',
  starEmpty: '☆',
  heart: '❤️',
  heartEmpty: '🤍',
  shield: '🛡️',
  pot: '🍲',           // 8차시 냄비
  car: '🚙',           // 11차시 자율주행차
  trophy: '🏆',
};

// 에셋이 이모지면 그대로, {img} 객체면 <img> 태그 반환
export function asset(key, size = null) {
  const a = ASSETS[key];
  if (a && typeof a === 'object' && a.img) {
    const s = size ? `width:${size}px;height:${size}px;` : 'width:1em;height:1em;';
    return `<img src="${a.img}" alt="${key}" style="${s}object-fit:contain;vertical-align:middle;">`;
  }
  return a || '❓';
}
