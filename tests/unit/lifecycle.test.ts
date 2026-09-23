import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLifecycleScope } from '../../src/core/lifecycle';

describe('lifecycle scope', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('runs active timers and removes explicitly cleared intervals', () => {
    const scope = createLifecycleScope();
    const timeoutWork = vi.fn();
    const intervalWork = vi.fn();

    scope.setTimeout(timeoutWork, 100);
    const interval = scope.setInterval(intervalWork, 40);
    vi.advanceTimersByTime(100);
    scope.clearInterval(interval);

    expect(timeoutWork).toHaveBeenCalledTimes(1);
    expect(intervalWork).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels all work exactly once and suppresses late registration', () => {
    const scope = createLifecycleScope();
    const timeoutWork = vi.fn();
    const intervalWork = vi.fn();
    const animation = { cancel: vi.fn() };

    scope.setTimeout(timeoutWork, 100);
    scope.setInterval(intervalWork, 40);
    scope.trackAnimation(animation);
    scope.dispose();
    scope.dispose();
    vi.runAllTimers();

    expect(timeoutWork).not.toHaveBeenCalled();
    expect(intervalWork).not.toHaveBeenCalled();
    expect(animation.cancel).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);

    expect(scope.setTimeout(timeoutWork, 1)).toBeNull();
    expect(scope.setInterval(intervalWork, 1)).toBeNull();
    scope.trackAnimation(animation);
    expect(animation.cancel).toHaveBeenCalledTimes(2);
  });
});
