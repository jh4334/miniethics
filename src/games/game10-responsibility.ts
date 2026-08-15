import type { MiniGame } from './registry';
import { mountGame10 } from './game10-responsibility/controller';

export const game10: MiniGame = {
  lessonId: 10,
  mount: mountGame10
};
