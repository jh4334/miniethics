import { describe, expect, it } from 'vitest';
import { LESSONS } from '../../src/data/curriculum';
import { calculateResultStars } from '../../src/scenes/result';

describe('curriculum contract', () => {
  it('keeps exactly twelve unique sequential playable lessons with complete content', () => {
    expect(LESSONS.map((lesson) => lesson.id)).toEqual(
      Array.from({ length: 12 }, (_, index) => index + 1)
    );
    expect(new Set(LESSONS.map((lesson) => lesson.id)).size).toBe(12);

    for (const lesson of LESSONS) {
      expect(lesson.playable).toBe(true);
      for (const value of [
        lesson.title,
        lesson.islandName,
        lesson.emoji,
        lesson.color,
        lesson.goal,
        lesson.gameName,
        lesson.howto,
        lesson.howtoIcons,
        lesson.rightName,
        lesson.mission
      ]) {
        expect(value.trim()).not.toBe('');
      }
      expect(lesson.chars.left.trim()).not.toBe('');
      expect(lesson.chars.right.trim()).not.toBe('');
      expect(lesson.intro.length).toBeGreaterThan(0);
      for (const line of lesson.intro) {
        expect(line.speaker.trim()).not.toBe('');
        expect(line.text.trim()).not.toBe('');
        expect(['left', 'right']).toContain(line.side);
      }
      expect(lesson.summary.length).toBeGreaterThan(0);
      expect(lesson.summary.every((line) => line.trim() !== '')).toBe(true);
      expect(lesson.quiz).toHaveLength(3);
      for (const question of lesson.quiz) {
        expect(question.q.trim()).not.toBe('');
        expect(question.explain.trim()).not.toBe('');
        expect(question.choices.length).toBeGreaterThanOrEqual(2);
        expect(question.choices.every((choice) => choice.trim() !== '')).toBe(true);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer).toBeLessThan(question.choices.length);
      }
      expect(lesson.x).toBeGreaterThanOrEqual(0);
      expect(lesson.x).toBeLessThanOrEqual(100);
      expect(lesson.y).toBeGreaterThanOrEqual(0);
      expect(lesson.y).toBeLessThanOrEqual(100);
    }
  });

  it('keeps the one, two, and three-star thresholds unchanged', () => {
    expect(calculateResultStars(100, 1, 3)).toBe(1);
    expect(calculateResultStars(0, 2, 3)).toBe(2);
    expect(calculateResultStars(69, 3, 3)).toBe(2);
    expect(calculateResultStars(70, 3, 3)).toBe(3);
  });
});
