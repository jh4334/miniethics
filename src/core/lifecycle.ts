export interface CancellableAnimation {
  cancel(): void;
}

export interface LifecycleScope {
  setTimeout(callback: () => void, delay: number): number | null;
  clearTimeout(id: number | null): void;
  setInterval(callback: () => void, delay: number): number | null;
  clearInterval(id: number | null): void;
  trackAnimation<T extends CancellableAnimation>(animation: T): T;
  dispose(): void;
}

export function createLifecycleScope(): LifecycleScope {
  const timeouts = new Set<number>();
  const intervals = new Set<number>();
  const animations = new Set<CancellableAnimation>();
  let disposed = false;

  return {
    setTimeout(callback, delay) {
      if (disposed) return null;
      let id = 0;
      id = window.setTimeout(() => {
        timeouts.delete(id);
        if (!disposed) callback();
      }, delay);
      timeouts.add(id);
      return id;
    },
    clearTimeout(id) {
      if (id === null) return;
      window.clearTimeout(id);
      timeouts.delete(id);
    },
    setInterval(callback, delay) {
      if (disposed) return null;
      const id = window.setInterval(() => {
        if (!disposed) callback();
      }, delay);
      intervals.add(id);
      return id;
    },
    clearInterval(id) {
      if (id === null) return;
      window.clearInterval(id);
      intervals.delete(id);
    },
    trackAnimation(animation) {
      if (disposed) animation.cancel();
      else animations.add(animation);
      return animation;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      timeouts.forEach((id) => window.clearTimeout(id));
      intervals.forEach((id) => window.clearInterval(id));
      animations.forEach((animation) => animation.cancel());
      timeouts.clear();
      intervals.clear();
      animations.clear();
    }
  };
}
