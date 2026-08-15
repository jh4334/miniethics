import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SceneManager } from '../../src/core/scene';

function stageRoot(): HTMLElement {
  const root = document.getElementById('stage');
  if (!root) throw new Error('test stage is missing');
  return root;
}

describe('SceneManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="stage"></div>';
  });

  it('cleans the current scene before clearing and mounting the next scene', () => {
    const root = stageRoot();
    const order: string[] = [];
    const manager = new SceneManager(root);

    manager.register('title', (sceneRoot) => {
      order.push('first-mount');
      const marker = document.createElement('div');
      marker.className = 'first';
      sceneRoot.appendChild(marker);
      return () => {
        order.push(sceneRoot.querySelector('.first') ? 'first-cleanup' : 'cleanup-after-clear');
      };
    });
    manager.register('worldmap', (sceneRoot) => {
      order.push(sceneRoot.childElementCount === 0 ? 'second-mount' : 'mount-before-clear');
    });

    manager.go('title');
    manager.go('worldmap');

    expect(order).toEqual(['first-mount', 'first-cleanup', 'second-mount']);
  });

  it('calls each mounted scene cleanup at most once per transition', () => {
    const manager = new SceneManager(stageRoot());
    const titleCleanup = vi.fn();
    const mapCleanup = vi.fn();

    manager.register('title', () => titleCleanup);
    manager.register('worldmap', () => mapCleanup);

    manager.go('title');
    manager.go('worldmap');
    manager.go('title');

    expect(titleCleanup).toHaveBeenCalledTimes(1);
    expect(mapCleanup).toHaveBeenCalledTimes(1);
  });

  it('keeps the nested destination current when a scene redirects during mount', () => {
    const manager = new SceneManager(stageRoot());
    manager.register('soon', (root) => {
      root.textContent = '준비 중';
    });
    manager.register('game', () => {
      manager.go('soon');
    });

    manager.go('game');

    expect(manager.current).toBe('soon');
    expect(stageRoot().textContent).toBe('준비 중');
  });
});
