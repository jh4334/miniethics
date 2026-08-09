// 4차시: 진짜가짜 탐정단 - 오케스트레이션 에이전트가 이 파일을 완성한다
import type { MiniGame, GameCtx } from './registry';

export const game04: MiniGame = {
  lessonId: 4,
  mount(_container: HTMLElement, ctx: GameCtx) {
    // TODO: 미구현 스텁 (playable=false라 호출되지 않음)
    ctx.quit();
  }
};
