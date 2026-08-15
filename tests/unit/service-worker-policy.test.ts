import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('public/sw.js', 'utf8');

describe('service worker policy contract', () => {
  it('uses separate versioned shell and runtime caches', () => {
    expect(source).toContain("'miniethics-shell-v2'");
    expect(source).toContain("'miniethics-runtime-v2'");
  });

  it('preserves unrelated caches and avoids forced activation', () => {
    expect(source).toMatch(/startsWith\(['"]miniethics-['"]\)/);
    expect(source).not.toContain('skipWaiting');
  });

  it('limits fallback and runtime writes to safe request classes', () => {
    expect(source).toContain("request.mode === 'navigate'");
    expect(source).toContain("response.ok && response.type === 'basic'");
    expect(source).toContain("request.destination === 'image'");
  });
});
