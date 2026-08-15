// 간단한 씬 매니저: 씬 = (root, params) => cleanup 함수

export type SceneId = 'title' | 'worldmap' | 'story' | 'game' | 'result' | 'soon';

export type SceneParams = Record<string, unknown>;

export type SceneFactory = (root: HTMLElement, params: SceneParams) => void | (() => void);

export class SceneManager {
  private scenes = new Map<SceneId, SceneFactory>();
  private cleanup: void | (() => void) = undefined;
  private transition = 0;
  /** 현재 표시 중인 씬 (뒤로가기 처리 등에 사용) */
  current: SceneId | null = null;
  /** 씬 전환 직후 호출되는 훅 */
  onNavigate?: (id: SceneId) => void;
  onError?: (id: SceneId, error: unknown) => void;

  constructor(private root: HTMLElement) {}

  register(id: SceneId, factory: SceneFactory) {
    this.scenes.set(id, factory);
  }

  go(id: SceneId, params: SceneParams = {}) {
    const transition = ++this.transition;
    const factory = this.scenes.get(id);
    if (!factory) throw new Error(`unknown scene: ${id}`);
    const focusOnMount = this.current !== null;
    const previousCleanup = this.cleanup;
    this.cleanup = undefined;
    try {
      if (previousCleanup) previousCleanup();
      this.root.replaceChildren();
      const nextCleanup = factory(this.root, params);
      if (transition !== this.transition) {
        nextCleanup?.();
        return;
      }
      this.cleanup = nextCleanup;
      this.current = id;
      if (focusOnMount) focusSceneHeading(this.root);
      this.onNavigate?.(id);
    } catch (error) {
      if (transition !== this.transition) return;
      this.cleanup = undefined;
      this.current = null;
      this.root.replaceChildren();
      if (!this.onError) throw error;
      this.onError(id, error);
    }
  }
}

function focusSceneHeading(root: HTMLElement): void {
  const heading = root.querySelector<HTMLElement>('h1, h2');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}
