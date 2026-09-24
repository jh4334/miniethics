// localStorage 기반 진행도 저장

import { z } from 'zod';
import { classroom, localDay } from './classroom';

const KEY = 'miniethics-save-v1';

export interface LessonRecord {
  stars: number; // 0~3
  bestScore: number; // 게임 점수 0~100
  quizBest: number; // 퀴즈 정답 수 0~3
  cleared: boolean;
  /** 처음 클리어한 날(기기 현지 YYYY-MM-DD). 하루 한 차시 규칙에 사용. 예전 기록에는 없음 */
  clearedAt?: string;
}

/** open: 도전 가능 · prev: 앞 차시 미완료 · today: 하루 한 차시 규칙으로 내일 열림 */
export type LockState = 'open' | 'prev' | 'today';

export interface SaveData {
  records: Record<number, LessonRecord>;
}

const LessonRecordSchema = z.object({
  stars: z.number().finite(),
  bestScore: z.number().finite(),
  quizBest: z.number().finite(),
  cleared: z.boolean(),
  clearedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined)
});

const StoredSaveSchema = z.object({
  records: z.record(z.string(), z.unknown())
});

function load(): SaveData {
  try {
    return parseSaveData(localStorage.getItem(KEY));
  } catch {
    /* 손상된 저장 데이터는 무시하고 새로 시작 */
  }
  return { records: {} };
}

/** 외부 저장소에서 온 데이터를 신뢰하지 않고 형태·범위를 검증한다 */
export function parseSaveData(raw: string | null): SaveData {
  const out: SaveData = { records: {} };
  if (!raw) return out;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return out;
  }

  const stored = StoredSaveSchema.safeParse(parsed);
  if (!stored.success) return out;
  for (const [key, value] of Object.entries(stored.data.records)) {
    if (!/^(?:[1-9]|1[0-2])$/.test(key)) continue;
    const record = LessonRecordSchema.safeParse(value);
    if (!record.success) continue;
    out.records[Number(key)] = {
      stars: clampInt(record.data.stars, 0, 3),
      bestScore: clampInt(record.data.bestScore, 0, 100),
      quizBest: clampInt(record.data.quizBest, 0, 3),
      cleared: record.data.cleared,
      ...(record.data.clearedAt ? { clearedAt: record.data.clearedAt } : {})
    };
  }
  return out;
}

function clampInt(v: unknown, min: number, max: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : min;
  return Math.min(max, Math.max(min, n));
}

let data: SaveData = load();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* 사생활 보호 모드 등으로 저장 불가 시 게임은 계속 진행 */
  }
}

/** 부팅 시 쓰기→읽기 자가 검사. iOS 프라이빗 모드·쿠키 차단·MDM에서 기록이 조용히 사라지는 것을 알리기 위함 */
function probeStorage(): boolean {
  try {
    const probe = 'miniethics-probe';
    const value = String(Date.now());
    localStorage.setItem(probe, value);
    const ok = localStorage.getItem(probe) === value;
    localStorage.removeItem(probe);
    return ok;
  } catch {
    return false;
  }
}

const storageOk = probeStorage();

export const save = {
  record(lessonId: number): LessonRecord {
    return (
      data.records[lessonId] ?? { stars: 0, bestScore: 0, quizBest: 0, cleared: false }
    );
  },

  /** 차시 결과 반영 (기존 기록보다 좋을 때만 갱신) */
  report(lessonId: number, stars: number, score: number, quizCorrect: number) {
    if (!Number.isInteger(lessonId) || lessonId < 1 || lessonId > 12) return;
    const prev = save.record(lessonId);
    data.records[lessonId] = {
      stars: Math.max(prev.stars, clampInt(stars, 0, 3)),
      bestScore: Math.max(prev.bestScore, clampInt(score, 0, 100)),
      quizBest: Math.max(prev.quizBest, clampInt(quizCorrect, 0, 3)),
      cleared: true,
      // 다시 하기로 날짜가 갱신되면 이미 열린 다음 차시가 다시 잠기므로 첫 클리어 날만 남긴다
      clearedAt: prev.cleared ? prev.clearedAt : localDay()
    };
    if (!data.records[lessonId].clearedAt) delete data.records[lessonId].clearedAt;
    persist();
  },

  /** n차시가 열려 있는가? (1차시는 항상, 이후는 직전 차시 클리어 시) */
  isUnlocked(lessonId: number): boolean {
    return save.lockState(lessonId) === 'open';
  },

  /**
   * 잠금 상태. 교사 해금 범위면 항상 open.
   * 하루 한 차시 규칙이 켜져 있으면 직전 차시를 "오늘" 처음 깬 경우 다음 차시는 내일 열린다.
   */
  lockState(lessonId: number, today = localDay()): LockState {
    if (lessonId <= 1) return 'open';
    const settings = classroom.get();
    if (lessonId <= settings.unlockThrough) return 'open';
    const prev = save.record(lessonId - 1);
    if (!prev.cleared) return 'prev';
    if (settings.dailyLimit && prev.clearedAt === today) return 'today';
    return 'open';
  },

  /** 이 기기에서 진행 기록이 실제로 저장되는가 */
  storageOk(): boolean {
    return storageOk;
  },

  totalStars(): number {
    return Object.values(data.records).reduce((s, r) => s + r.stars, 0);
  },

  clearedCount(): number {
    return Object.values(data.records).filter((r) => r.cleared).length;
  },

  reset() {
    data = { records: {} };
    persist();
  }
};
