import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve('.');

async function physicalLines(relativePath: string): Promise<number> {
  const source = await readFile(path.join(root, relativePath), 'utf8');
  return source.split(/\r?\n/).length;
}

describe('game 04 and game 10 module boundaries', () => {
  it.each([
    'src/games/game04-deepfake.ts',
    'src/games/game10-responsibility.ts'
  ])('keeps %s as a small public facade', async (file) => {
    expect(await physicalLines(file)).toBeLessThanOrEqual(80);
  });

  it.each([
    'src/games/game04-deepfake/controller.ts',
    'src/games/game04-deepfake/model.ts',
    'src/games/game04-deepfake/styles.ts',
    'src/games/game04-deepfake/view.ts',
    'src/games/game10-responsibility/controller.ts',
    'src/games/game10-responsibility/model.ts',
    'src/games/game10-responsibility/cases.ts',
    'src/games/game10-responsibility/copy.ts',
    'src/games/game10-responsibility/styles.ts',
    'src/games/game10-responsibility/replay.ts',
    'src/games/game10-responsibility/evidence.ts',
    'src/games/game10-responsibility/responsibility.ts',
    'src/games/game10-responsibility/verdict.ts'
  ])('keeps %s reviewable', async (file) => {
    expect(await physicalLines(file)).toBeLessThanOrEqual(250);
  });

  it.each(Array.from({ length: 6 }, (_, index) =>
    `src/games/game04-deepfake/cases/case-${index + 1}.ts`
  ))('keeps %s as one bounded case fixture', async (file) => {
    expect(await physicalLines(file)).toBeLessThanOrEqual(150);
  });
});
