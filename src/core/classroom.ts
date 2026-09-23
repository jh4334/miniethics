// 교실 운영 설정 (기기별 localStorage)
// - 교사 해금: 결석 등으로 앞 차시를 못 한 학생도 N차시까지 열어 줄 수 있다. 진도(cleared)는 건드리지 않는다.
// - 하루 한 차시: 오늘 처음 클리어한 차시의 다음 차시는 다음 날부터 열린다 (수업 진도 앞지르기 방지).
// - 교사 PIN: 위 설정과 진행 초기화는 4자리 PIN을 거친다.

import { z } from 'zod';

const KEY = 'miniethics-class-v1';

export interface ClassroomSettings {
  pin: string | null;
  /** 0이면 교사 해금 없음. n이면 1~n차시가 진도와 무관하게 열림 */
  unlockThrough: number;
  dailyLimit: boolean;
}

const DEFAULTS: ClassroomSettings = { pin: null, unlockThrough: 0, dailyLimit: true };

const SettingsSchema = z.object({
  pin: z.string().regex(/^\d{4}$/).nullable().catch(null),
  unlockThrough: z.number().int().min(0).max(12).catch(0),
  dailyLimit: z.boolean().catch(true)
});

export function parseClassroom(raw: string | null): ClassroomSettings {
  if (!raw) return { ...DEFAULTS };
  try {
    const parsed = SettingsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function load(): ClassroomSettings {
  try {
    return parseClassroom(localStorage.getItem(KEY));
  } catch {
    return { ...DEFAULTS };
  }
}

let settings = load();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* 저장 불가 기기: 이번 실행 동안만 유지 */
  }
}

export const classroom = {
  get(): Readonly<ClassroomSettings> {
    return settings;
  },
  hasPin(): boolean {
    return settings.pin !== null;
  },
  checkPin(pin: string): boolean {
    return settings.pin !== null && settings.pin === pin;
  },
  setPin(pin: string): boolean {
    if (!/^\d{4}$/.test(pin)) return false;
    settings = { ...settings, pin };
    persist();
    return true;
  },
  setUnlockThrough(n: number) {
    settings = { ...settings, unlockThrough: Math.min(12, Math.max(0, Math.round(n))) };
    persist();
  },
  setDailyLimit(on: boolean) {
    settings = { ...settings, dailyLimit: on };
    persist();
  }
};

/** 기기 현지 날짜 YYYY-MM-DD */
export function localDay(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}
