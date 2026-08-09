// 미니게임 레지스트리
// 새 게임 추가: 1) gameXX-*.ts 파일 생성 2) 아래에 등록 3) curriculum.ts에서 playable: true

import type { AudioApi } from '../core/audio';

export interface GameCtx {
  audio: AudioApi;
  /** 게임 종료 - score는 0~100 */
  finish(score: number): void;
  /** 게임 중단하고 월드맵으로 */
  quit(): void;
}

export interface MiniGame {
  lessonId: number;
  /** 게임을 container에 마운트. 반환값은 cleanup 함수 */
  mount(container: HTMLElement, ctx: GameCtx): void | (() => void);
}

import { game01 } from './game01-labeling';
import { game02 } from './game02-bias';
import { game03 } from './game03-privacy';

const GAMES: MiniGame[] = [game01, game02, game03];

export function getGame(lessonId: number): MiniGame | undefined {
  return GAMES.find((g) => g.lessonId === lessonId);
}
