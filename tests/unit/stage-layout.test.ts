import { describe, expect, it } from 'vitest';
import { calculateStageLayout } from '../../src/core/stage-layout';

describe('adaptive stage layout', () => {
  it.each([
    [1280, 800, 1, 44],
    [768, 1024, 0.6, 73.333333],
    [375, 812, 0.29296875, 150]
  ])('fits %sx%s without cropping and preserves coarse targets', (width, height, scale, target) => {
    const layout = calculateStageLayout(width, height);

    expect(layout.scale).toBeCloseTo(scale, 6);
    expect(layout.minimumTargetSize).toBeCloseTo(target, 2);
    expect(1280 * layout.scale).toBeLessThanOrEqual(width);
    expect(800 * layout.scale).toBeLessThanOrEqual(height);
  });

  it('uses a safe fallback for unusable viewport measurements', () => {
    expect(calculateStageLayout(0, Number.NaN)).toEqual({ scale: 1, minimumTargetSize: 44 });
  });
});
