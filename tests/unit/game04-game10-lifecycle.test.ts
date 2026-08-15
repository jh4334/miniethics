import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AudioApi } from '../../src/core/audio';
import { game04 } from '../../src/games/game04-deepfake';
import { game10 } from '../../src/games/game10-responsibility';
import type { GameCtx, MiniGame } from '../../src/games/registry';

function audioStub(): AudioApi {
  return {
    unlock: vi.fn(),
    setMuted: vi.fn(),
    isMuted: vi.fn(() => false),
    click: vi.fn(),
    good: vi.fn(),
    bad: vi.fn(),
    pop: vi.fn(),
    fanfare: vi.fn(),
    star: vi.fn()
  };
}

function mount(game: MiniGame) {
  const finish = vi.fn();
  const quit = vi.fn();
  const context: GameCtx = { audio: audioStub(), finish, quit };
  const root = document.getElementById('stage');
  if (!root) throw new Error('test stage is missing');
  const cleanup = game.mount(root, context);
  return { cleanup, finish, quit };
}

function clickButton(label: string) {
  const target = [...document.querySelectorAll<HTMLButtonElement>('button')]
    .find((item) => item.textContent?.includes(label));
  if (!target) throw new Error(`button not found: ${label}`);
  target.click();
}

describe('game04 and game10 lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-16T00:00:00+09:00'));
    document.body.innerHTML = '<div id="stage"></div>';
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    document.head.querySelectorAll('#g04-style, #g10-style').forEach((node) => node.remove());
  });

  it.each([game04, game10])('calls lesson $lessonId quit once and disposes owned timers', (game) => {
    const { cleanup, quit } = mount(game);
    clickButton('🗺️');
    clickButton('🗺️');
    expect(quit).toHaveBeenCalledTimes(1);
    cleanup?.();
    expect(vi.getTimerCount()).toBe(0);
    expect(document.getElementById(`g${String(game.lessonId).padStart(2, '0')}-style`)).toBeNull();
  });

  it('finishes game04 once with the characterized six-case score', () => {
    const { cleanup, finish } = mount(game04);
    const real = [false, true, false, true, false, false];
    for (let caseIndex = 0; caseIndex < real.length; caseIndex++) {
      vi.advanceTimersByTime(451);
      clickButton(real[caseIndex] ? '진짜야' : '가짜야');
      vi.advanceTimersByTime(1100);
      clickButton(caseIndex === real.length - 1 ? '수사 결과 보기' : '다음 사건');
    }
    const resultButton = document.querySelector<HTMLButtonElement>('.game-over-overlay button');
    if (!resultButton) throw new Error('game04 result button is missing');
    resultButton.click();
    resultButton.click();
    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledWith(60);
    cleanup?.();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('finishes game10 once after all three characterized judgments', () => {
    const { cleanup, finish } = mount(game10);
    const placements: Array<Array<[string, number]>> = [
      [['만든 회사', 3], ['차 주인', 3]],
      [['차 주인', 6]],
      [['도로관리소', 3], ['만든 회사', 3]]
    ];
    for (let caseIndex = 0; caseIndex < placements.length; caseIndex++) {
      clickButton('증거를 살펴보자');
      document.querySelectorAll<HTMLButtonElement>('.g10-ev').forEach((card) => card.click());
      clickButton('판결 준비');
      for (const [name, count] of placements[caseIndex]) {
        for (let index = 0; index < count; index++) {
          clickButton(name);
          vi.advanceTimersByTime(400);
        }
      }
      clickButton('판결!');
      clickButton(caseIndex === 2 ? '최종 판결 보기' : '다음 사건');
    }
    clickButton('결과 보기');
    clickButton('결과 보기');
    expect(finish).toHaveBeenCalledTimes(1);
    expect(finish).toHaveBeenCalledWith(100);
    cleanup?.();
    expect(vi.getTimerCount()).toBe(0);
  });
});
