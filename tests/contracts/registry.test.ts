import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/data/curriculum';
import { GAME_IDS, getGame } from '../../src/games/registry';

describe('game registry contract', () => {
  it('provides exactly one matching game for every lesson', () => {
    const expected = LESSONS.map((lesson) => lesson.id);
    expect(GAME_IDS).toEqual(expected);
    expect(new Set(GAME_IDS).size).toBe(expected.length);
    for (const lessonId of expected) {
      expect(getGame(lessonId)?.lessonId).toBe(lessonId);
    }
  });
});
