import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHARACTER_ASSETS } from '../../src/assets-manifest';
import { LESSONS } from '../../src/data/curriculum';
import { GAME_IDS } from '../../src/games/registry';

const root = path.resolve('.');
const publicRoot = path.join(root, 'public');

interface PngInfo {
  width: number;
  height: number;
  colorType: number;
}

async function pngInfo(relativePath: string): Promise<PngInfo> {
  const data = await readFile(path.join(publicRoot, relativePath));
  expect(data.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(data.subarray(12, 16).toString('ascii')).toBe('IHDR');
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20), colorType: data[25] };
}

async function pngFiles(directory: string): Promise<string[]> {
  const absolute = path.join(publicRoot, directory);
  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relative = path.posix.join(directory, entry.name);
      return entry.isDirectory() ? pngFiles(relative) : entry.name.endsWith('.png') ? [relative] : [];
    })
  );
  return nested.flat().sort();
}

describe('curriculum and game registry contract', () => {
  it('keeps twelve complete playable lessons paired with twelve games', () => {
    expect(LESSONS.map((lesson) => lesson.id)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
    expect(GAME_IDS).toEqual(Array.from({ length: 12 }, (_, index) => index + 1));
    for (const lesson of LESSONS) {
      expect(lesson.playable).toBe(true);
      expect(lesson.intro.length).toBeGreaterThan(0);
      expect(lesson.summary.length).toBeGreaterThan(0);
      expect(lesson.quiz.length).toBeGreaterThan(0);
      expect(lesson.quiz.every((question) => question.answer >= 0 && question.answer < question.choices.length)).toBe(true);
      expect(lesson.x).toBeGreaterThanOrEqual(0);
      expect(lesson.x).toBeLessThanOrEqual(100);
      expect(lesson.y).toBeGreaterThanOrEqual(0);
      expect(lesson.y).toBeLessThanOrEqual(100);
    }
  });
});

describe('production asset contract', () => {
  const characterPngs = Object.values(CHARACTER_ASSETS).map((asset) => asset.replace(/^\.\/assets\//, 'assets/') + '.png');
  const backgroundPngs = [
    'assets/bg/title.png',
    'assets/bg/worldmap.png',
    ...Array.from({ length: 12 }, (_, index) => `assets/game${String(index + 1).padStart(2, '0')}/bg.png`)
  ];

  it('contains exactly the 14 characters and 14 backgrounds used by the app', async () => {
    const expected = [...characterPngs, ...backgroundPngs].sort();
    expect(await pngFiles('assets')).toEqual(expected);
  });

  it('keeps transparent 1024px characters and opaque 1280x800 backgrounds', async () => {
    for (const file of characterPngs) {
      expect(await pngInfo(file)).toEqual({ width: 1024, height: 1024, colorType: 6 });
    }
    for (const file of backgroundPngs) {
      expect(await pngInfo(file)).toEqual({ width: 1280, height: 800, colorType: 2 });
    }
  });

  it('keeps opaque install icons and the self-hosted Korean font', async () => {
    expect(await pngInfo('icons/icon-192.png')).toEqual({ width: 192, height: 192, colorType: 2 });
    expect(await pngInfo('icons/icon-512.png')).toEqual({ width: 512, height: 512, colorType: 2 });

    const font = await readFile(path.join(publicRoot, 'fonts/SUIT-Variable.woff2'));
    expect(font.subarray(0, 4).toString('ascii')).toBe('wOF2');
    expect(font.byteLength).toBeGreaterThan(100_000);
    expect(await readFile(path.join(publicRoot, 'fonts/SUIT-LICENSE.txt'), 'utf8')).toContain('SIL OPEN FONT LICENSE');
  });
});

describe('continuous integration contract', () => {
  it('runs the complete quality gate before Pages deployment', async () => {
    const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.['test:contracts']).toBe('vitest run tests/contracts');
    expect(pkg.scripts?.['check:ci']).toContain('test:e2e');
    expect(await readFile(path.join(root, '.github/workflows/quality.yml'), 'utf8')).toContain('npm run check:ci');
    expect(await readFile(path.join(root, '.github/workflows/deploy.yml'), 'utf8')).toContain('npm run check:ci');
  });
});

describe('large game module boundaries', () => {
  it('keeps entry modules reduced and extracted responsibilities reviewable', async () => {
    const lineCount = async (relativePath: string) =>
      (await readFile(path.join(root, relativePath), 'utf8')).split(/\r?\n/).length;

    expect(await lineCount('src/games/game04-deepfake.ts')).toBeLessThanOrEqual(400);
    expect(await lineCount('src/games/game10-responsibility.ts')).toBeLessThanOrEqual(650);

    for (const directory of ['src/games/game04', 'src/games/game10']) {
      const files = (await readdir(path.join(root, directory))).filter((file) => file.endsWith('.ts'));
      for (const file of files) {
        expect(await lineCount(path.posix.join(directory, file))).toBeLessThanOrEqual(250);
      }
    }
  });
});
