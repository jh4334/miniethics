import { beforeEach, describe, expect, it, vi } from 'vitest';

async function fresh() {
  vi.resetModules();
  const classroomModule = await import('../../src/core/classroom');
  const saveModule = await import('../../src/core/save');
  return { ...classroomModule, ...saveModule };
}

function seed(records: Record<string, unknown>, classroom?: unknown) {
  localStorage.setItem('miniethics-save-v1', JSON.stringify({ records }));
  if (classroom !== undefined) localStorage.setItem('miniethics-class-v1', JSON.stringify(classroom));
}

const cleared = (clearedAt?: string) => ({
  stars: 2,
  bestScore: 70,
  quizBest: 2,
  cleared: true,
  ...(clearedAt ? { clearedAt } : {})
});

describe('classroom lock rules', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps legacy records without a clear date open (existing tablets are not re-locked)', async () => {
    seed({ 1: cleared(), 2: cleared() });
    const { save } = await fresh();

    expect(save.lockState(2, '2027-03-10')).toBe('open');
    expect(save.lockState(3, '2027-03-10')).toBe('open');
    expect(save.lockState(4, '2027-03-10')).toBe('prev');
  });

  it('locks the next lesson until tomorrow when the previous one was first cleared today', async () => {
    seed({ 1: cleared('2027-03-10') });
    const { save } = await fresh();

    expect(save.lockState(2, '2027-03-10')).toBe('today');
    expect(save.isUnlocked(2)).toBe(save.lockState(2) === 'open');
    expect(save.lockState(2, '2027-03-11')).toBe('open');
  });

  it('records only the first clear date so replaying does not re-lock the next lesson', async () => {
    seed({ 1: cleared('2027-03-03') });
    const { save } = await fresh();

    save.report(1, 3, 100, 3);

    expect(save.record(1).clearedAt).toBe('2027-03-03');
    expect(save.record(1).stars).toBe(3);
  });

  it('stamps the local day on a first clear', async () => {
    const { save, localDay } = await fresh();

    save.report(1, 1, 40, 0);

    expect(save.record(1).clearedAt).toBe(localDay());
    expect(save.lockState(2)).toBe('today');
  });

  it('lets the teacher open lessons without marking them cleared', async () => {
    seed({}, { pin: '1234', unlockThrough: 5, dailyLimit: true });
    const { save } = await fresh();

    expect(save.lockState(5)).toBe('open');
    expect(save.lockState(6)).toBe('prev');
    expect(save.clearedCount()).toBe(0);
    expect(save.totalStars()).toBe(0);
  });

  it('turns the daily rule off when the teacher disables it', async () => {
    seed({ 1: cleared('2027-03-10') }, { pin: '1234', unlockThrough: 0, dailyLimit: false });
    const { save } = await fresh();

    expect(save.lockState(2, '2027-03-10')).toBe('open');
  });
});

describe('classroom settings boundary', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('falls back field by field for malformed settings', async () => {
    const { parseClassroom } = await fresh();

    expect(parseClassroom(null)).toEqual({ pin: null, unlockThrough: 0, dailyLimit: true });
    expect(parseClassroom('{bad')).toEqual({ pin: null, unlockThrough: 0, dailyLimit: true });
    expect(parseClassroom(JSON.stringify({ pin: '12a4', unlockThrough: 40, dailyLimit: 'yes' }))).toEqual({
      pin: null,
      unlockThrough: 0,
      dailyLimit: true
    });
  });

  it('accepts only four-digit PINs and checks them exactly', async () => {
    const { classroom } = await fresh();

    expect(classroom.hasPin()).toBe(false);
    expect(classroom.checkPin('')).toBe(false);
    expect(classroom.setPin('12345')).toBe(false);
    expect(classroom.setPin('0420')).toBe(true);
    expect(classroom.checkPin('0420')).toBe(true);
    expect(classroom.checkPin('420')).toBe(false);
  });

  it('clamps the teacher unlock range to 0..12', async () => {
    const { classroom } = await fresh();

    classroom.setUnlockThrough(99);
    expect(classroom.get().unlockThrough).toBe(12);
    classroom.setUnlockThrough(-3);
    expect(classroom.get().unlockThrough).toBe(0);
  });

  it('drops a malformed clear date instead of the whole record', async () => {
    const { parseSaveData } = await fresh();
    const parsed = parseSaveData(
      JSON.stringify({ records: { 1: { ...cleared(), clearedAt: 'yesterday' } } })
    );

    expect(parsed.records[1]).toEqual({ stars: 2, bestScore: 70, quizBest: 2, cleared: true });
  });
});
