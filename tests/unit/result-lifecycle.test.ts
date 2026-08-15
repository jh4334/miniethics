import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { audio } from '../../src/core/audio';
import { SceneManager } from '../../src/core/scene';
import { resultScene } from '../../src/scenes/result';
import { storyScene } from '../../src/scenes/story';

function stageRoot(): HTMLElement {
  const root = document.getElementById('stage');
  if (!root) throw new Error('test stage is missing');
  return root;
}

function finishQuiz(root: HTMLElement): void {
  const summaryNext = root.querySelector<HTMLButtonElement>('button');
  if (!summaryNext) throw new Error('summary action is missing');
  summaryNext.click();

  for (let index = 0; index < 3; index++) {
    const choice = root.querySelector<HTMLButtonElement>('.quiz-choice');
    if (!choice) throw new Error('quiz choice is missing');
    choice.click();
    const buttons = root.querySelectorAll<HTMLButtonElement>('button');
    const next = buttons[buttons.length - 1];
    if (!next) throw new Error('quiz next action is missing');
    next.click();
  }
}

describe('result scene lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="stage"></div>';
    vi.spyOn(audio, 'click').mockImplementation(() => undefined);
    vi.spyOn(audio, 'good').mockImplementation(() => undefined);
    vi.spyOn(audio, 'bad').mockImplementation(() => undefined);
    vi.spyOn(audio, 'fanfare').mockImplementation(() => undefined);
    vi.spyOn(audio, 'star').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('cancels delayed stars when the result scene is left', () => {
    const root = stageRoot();
    const manager = new SceneManager(root);
    const animate = vi.fn(() => ({ cancel: vi.fn() }));
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate });
    manager.register('result', resultScene(manager));
    manager.register('worldmap', (sceneRoot) => {
      sceneRoot.innerHTML = '<div class="map-scene">map</div>';
    });

    expect(vi.getTimerCount()).toBe(0);
    manager.go('result', { lessonId: 1, score: 80 });
    finishQuiz(root);
    vi.advanceTimersByTime(0);
    expect(
      timeoutSpy.mock.calls
        .map((call) => call[1])
        .filter((delay) => typeof delay === 'number' && delay > 0)
    ).toEqual([400, 850, 1300]);
    expect(vi.getTimerCount()).toBe(3);

    manager.go('worldmap');
    expect(vi.getTimerCount()).toBe(0);
    vi.runAllTimers();
    expect(animate).not.toHaveBeenCalled();
    expect(audio.star).not.toHaveBeenCalled();
  });

  it('reveals all result stars in the original delayed order', () => {
    const root = stageRoot();
    const manager = new SceneManager(root);
    const animate = vi.fn(() => ({ cancel: vi.fn() }));
    Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate });
    manager.register('result', resultScene(manager));
    manager.register('worldmap', () => undefined);

    manager.go('result', { lessonId: 1, score: 80 });
    finishQuiz(root);
    vi.advanceTimersByTime(0);
    const stars = root.querySelectorAll<HTMLElement>('[data-star]');

    expect(Array.from(stars, (star) => star.style.opacity)).toEqual(['0', '0', '0']);
    vi.advanceTimersByTime(400);
    expect(Array.from(stars, (star) => star.style.opacity)).toEqual(['1', '0', '0']);
    vi.advanceTimersByTime(450);
    expect(Array.from(stars, (star) => star.style.opacity)).toEqual(['1', '1', '0']);
    vi.advanceTimersByTime(450);
    expect(Array.from(stars, (star) => star.style.opacity)).toEqual(['1', '1', '1']);
    expect(animate).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);

    manager.go('worldmap');
  });

  it('does not accumulate typing intervals across repeated story navigation', () => {
    const manager = new SceneManager(stageRoot());
    vi.spyOn(audio, 'pop').mockImplementation(() => undefined);
    manager.register('story', storyScene(manager));
    manager.register('worldmap', () => undefined);

    for (let index = 0; index < 20; index++) {
      manager.go('story', { lessonId: 1 });
      vi.advanceTimersByTime(0);
      expect(vi.getTimerCount()).toBe(1);
      manager.go('worldmap');
      expect(vi.getTimerCount()).toBe(0);
    }
  });
});
