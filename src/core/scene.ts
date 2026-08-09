// 간단한 씬 매니저: 씬 = (root, params) => cleanup 함수

export type SceneId = 'title' | 'worldmap' | 'story' | 'game' | 'result' | 'soon';

export type SceneParams = Record<string, unknown>;

export type SceneFactory = (root: HTMLElement, params: SceneParams) => void | (() => void);

export class SceneManager {
  private scenes = new Map<SceneId, SceneFactory>();
  private cleanup: void | (() => void) = undefined;

  constructor(private root: HTMLElement) {}

  register(id: SceneId, factory: SceneFactory) {
    this.scenes.set(id, factory);
  }

  go(id: SceneId, params: SceneParams = {}) {
    const factory = this.scenes.get(id);
    if (!factory) throw new Error(`unknown scene: ${id}`);
    if (this.cleanup) this.cleanup();
    this.cleanup = undefined;
    this.root.innerHTML = '';
    this.cleanup = factory(this.root, params);
  }
}
