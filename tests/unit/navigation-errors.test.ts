import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SceneManager, type SceneFactory, type SceneId } from '../../src/core/scene';
import * as curriculum from '../../src/data/curriculum';
import { gameScene } from '../../src/scenes/game';
import { resultScene } from '../../src/scenes/result';
import { soonScene } from '../../src/scenes/soon';
import { storyScene } from '../../src/scenes/story';
import { renderSceneError } from '../../src/ui/scene-error';

function stageRoot(): HTMLElement {
  const root = document.getElementById('stage');
  if (!root) throw new Error('test stage is missing');
  return root;
}

function installErrorHandler(
  manager: SceneManager,
  handler: (id: SceneId, error: unknown) => void
): void {
  manager.onError = handler;
}

const parameterizedScenes: Array<{
  id: SceneId;
  create: (manager: SceneManager) => SceneFactory;
}> = [
  { id: 'story', create: storyScene },
  { id: 'game', create: gameScene },
  { id: 'result', create: resultScene },
  { id: 'soon', create: soonScene }
];

describe('navigation error containment', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="stage"></div>';
  });

  it('accepts only numeric integer lesson parameters represented in the curriculum', () => {
    const candidate: unknown = Reflect.get(curriculum, 'getLessonFromParam');
    expect(candidate).toBeTypeOf('function');
    if (typeof candidate !== 'function') return;

    expect(candidate(1)).toMatchObject({ id: 1 });
    for (const value of [undefined, '1', Number.NaN, Number.POSITIVE_INFINITY, 1.5, 0, 13]) {
      expect(() => candidate(value)).toThrow();
    }
  });

  it('contains one unexpected factory error and remains reusable', () => {
    const root = stageRoot();
    const manager = new SceneManager(root);
    const onError = vi.fn((id: SceneId) => {
      root.innerHTML = `<div role="alert">${id}</div>`;
    });
    installErrorHandler(manager, onError);
    manager.register('title', (sceneRoot) => {
      sceneRoot.innerHTML = '<div class="partial">partial</div>';
      throw new Error('synthetic mount failure');
    });
    manager.register('worldmap', (sceneRoot) => {
      sceneRoot.innerHTML = '<div class="map-scene">map</div>';
    });

    expect(() => manager.go('title')).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(root.querySelector('[role="alert"]')).not.toBeNull();
    expect(root.querySelector('.partial')).toBeNull();

    manager.go('worldmap');
    expect(root.querySelector('.map-scene')).not.toBeNull();
  });

  it('recovers every parameterized scene from invalid lesson inputs', () => {
    const invalidValues: unknown[] = [undefined, '1', Number.NaN, Number.POSITIVE_INFINITY, 1.5, 0, 13];

    for (const entry of parameterizedScenes) {
      for (const value of invalidValues) {
        document.body.innerHTML = '<div id="stage"></div>';
        const root = stageRoot();
        const manager = new SceneManager(root);
        const onError = vi.fn((id: SceneId) => {
          renderSceneError(root, 'worldmap', () => manager.go('worldmap'));
          expect(id).toBe(entry.id);
        });
        installErrorHandler(manager, onError);
        manager.register(entry.id, entry.create(manager));
        manager.register('worldmap', (sceneRoot) => {
          sceneRoot.innerHTML = '<div class="map-scene">map</div>';
        });

        manager.go(entry.id, { lessonId: value });

        expect(onError).toHaveBeenCalledTimes(1);
        expect(root.querySelectorAll('[role="alert"]')).toHaveLength(1);
        const recovery = root.querySelector<HTMLButtonElement>('button');
        expect(recovery?.textContent).toContain('월드맵으로 돌아가기');
        recovery?.click();
        expect(root.querySelector('.map-scene')).not.toBeNull();
      }
    }
  });
});
