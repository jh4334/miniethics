// localStorage 기반 진행도 저장

import { z } from 'zod';

const KEY = 'miniethics-save-v1';

export interface LessonRecord {
  stars: number; // 0~3
  bestScore: number; // 게임 점수 0~100
  quizBest: number; // 퀴즈 정답 수 0~3
  cleared: boolean;
}

export interface SaveData {
  records: Record<number, LessonRecord>;
}

const LessonRecordSchema = z.object({
  stars: z.number().finite(),
  bestScore: z.number().finite(),
  quizBest: z.number().finite(),
  cleared: z.boolean()
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
      cleared: record.data.cleared
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
      cleared: true
    };
    persist();
  },

  /** n차시가 열려 있는가? (1차시는 항상, 이후는 직전 차시 클리어 시) */
  isUnlocked(lessonId: number): boolean {
    if (lessonId <= 1) return true;
    return save.record(lessonId - 1).cleared;
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
