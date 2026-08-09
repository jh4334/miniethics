// localStorage 기반 진행도 저장

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

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as SaveData;
  } catch {
    /* 손상된 저장 데이터는 무시하고 새로 시작 */
  }
  return { records: {} };
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
    const prev = save.record(lessonId);
    data.records[lessonId] = {
      stars: Math.max(prev.stars, stars),
      bestScore: Math.max(prev.bestScore, score),
      quizBest: Math.max(prev.quizBest, quizCorrect),
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
