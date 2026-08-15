import type { MiniGame } from './registry';
import { mountGame04 } from './game04-deepfake/controller';

export const game04: MiniGame = {
  lessonId: 4,
  mount: mountGame04
};
