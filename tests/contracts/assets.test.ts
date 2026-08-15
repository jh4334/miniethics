import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHARACTER_ASSETS } from '../../src/assets-manifest';

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
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    colorType: data[25]
  };
}

async function pngFiles(directory: string): Promise<string[]> {
  const entries = await readdir(path.join(publicRoot, directory), { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const relative = path.posix.join(directory, entry.name);
      if (entry.isDirectory()) return pngFiles(relative);
      return entry.name.endsWith('.png') ? [relative] : [];
    })
  );
  return nested.flat().sort();
}

describe('production asset contract', () => {
  const characterBases = Object.values(CHARACTER_ASSETS).map((asset) =>
    asset.replace(/^\.\/assets\//, 'assets/')
  );
  const characterPngs = characterBases.map((asset) => `${asset}.png`);
  const backgroundPngs = [
    'assets/bg/title.png',
    'assets/bg/worldmap.png',
    ...Array.from(
      { length: 12 },
      (_, index) => `assets/game${String(index + 1).padStart(2, '0')}/bg.png`
    )
  ];

  it('contains exactly the fourteen characters and fourteen backgrounds', async () => {
    expect(await pngFiles('assets')).toEqual([...characterPngs, ...backgroundPngs].sort());
  });

  it('keeps every character PNG and SVG fallback plus every background', async () => {
    for (const base of characterBases) {
      expect(await pngInfo(`${base}.png`)).toEqual({ width: 1024, height: 1024, colorType: 6 });
      expect((await readFile(path.join(publicRoot, `${base}.svg`), 'utf8')).trimStart()).toMatch(/^<svg/);
    }
    for (const file of backgroundPngs) {
      expect(await pngInfo(file)).toEqual({ width: 1280, height: 800, colorType: 2 });
    }
  });

  it('matches manifest icon declarations and keeps the self-hosted Korean font', async () => {
    const manifest = JSON.parse(
      await readFile(path.join(publicRoot, 'manifest.webmanifest'), 'utf8')
    );
    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    expect(icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: './icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }),
        expect.objectContaining({ src: './icons/icon-192.png', sizes: '192x192', type: 'image/png' }),
        expect.objectContaining({ src: './icons/icon-512.png', sizes: '512x512', type: 'image/png' })
      ])
    );
    expect(await pngInfo('icons/icon-192.png')).toEqual({ width: 192, height: 192, colorType: 2 });
    expect(await pngInfo('icons/icon-512.png')).toEqual({ width: 512, height: 512, colorType: 2 });
    expect((await readFile(path.join(publicRoot, 'icons/icon.svg'), 'utf8')).trimStart()).toMatch(/^<svg/);

    const font = await readFile(path.join(publicRoot, 'fonts/SUIT-Variable.woff2'));
    expect(font.subarray(0, 4).toString('ascii')).toBe('wOF2');
    expect(font.byteLength).toBeGreaterThan(100_000);
    expect(await readFile(path.join(publicRoot, 'fonts/SUIT-LICENSE.txt'), 'utf8')).toContain(
      'SIL OPEN FONT LICENSE'
    );
  });
});
