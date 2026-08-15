import { beforeEach, describe, expect, it, vi } from 'vitest';

type SaveModule = typeof import('../../src/core/save');

function parseWith(module: SaveModule, raw: string | null): unknown {
  const candidate: unknown = Reflect.get(module, 'parseSaveData');
  if (typeof candidate !== 'function') throw new Error('parseSaveData boundary is missing');
  return candidate(raw);
}

async function freshSave(): Promise<SaveModule> {
  vi.resetModules();
  return import('../../src/core/save');
}

describe('progress save boundary', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns an empty save for missing, corrupt, array, or null payloads', async () => {
    const module = await freshSave();

    expect(parseWith(module, null)).toEqual({ records: {} });
    expect(parseWith(module, '{not-json')).toEqual({ records: {} });
    expect(parseWith(module, 'null')).toEqual({ records: {} });
    expect(parseWith(module, '[]')).toEqual({ records: {} });
  });

  it('salvages valid lessons while dropping malformed and unknown records', async () => {
    const module = await freshSave();
    const raw = `{"records":{"1":{"stars":2,"bestScore":81,"quizBest":2,"cleared":true},"2":{"stars":"x","bestScore":40,"quizBest":1,"cleared":true},"0":{"stars":3,"bestScore":100,"quizBest":3,"cleared":true},"13":{"stars":3,"bestScore":100,"quizBest":3,"cleared":true},"__proto__":{"polluted":true}}}`;

    expect(parseWith(module, raw)).toEqual({
      records: {
        1: { stars: 2, bestScore: 81, quizBest: 2, cleared: true }
      }
    });
    expect(Reflect.get(Object.prototype, 'polluted')).toBeUndefined();
  });

  it('clamps finite record values at the storage boundary', async () => {
    const module = await freshSave();
    const raw = JSON.stringify({
      records: {
        1: { stars: 8, bestScore: -20, quizBest: 2.8, cleared: false }
      }
    });

    expect(parseWith(module, raw)).toEqual({
      records: {
        1: { stars: 3, bestScore: 0, quizBest: 3, cleared: false }
      }
    });
  });

  it('bounds non-finite and out-of-range report values before persistence', async () => {
    const { save } = await freshSave();

    save.report(1, 99, Number.POSITIVE_INFINITY, -4);

    expect(save.record(1)).toEqual({
      stars: 3,
      bestScore: 0,
      quizBest: 0,
      cleared: true
    });
    expect(localStorage.getItem('miniethics-save-v1')).not.toContain('null');
  });

  it('keeps storage failures non-fatal', async () => {
    const { save } = await freshSave();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage denied');
    });

    expect(() => save.report(1, 2, 75, 2)).not.toThrow();
    expect(save.record(1)).toEqual({
      stars: 2,
      bestScore: 75,
      quizBest: 2,
      cleared: true
    });
  });
});
