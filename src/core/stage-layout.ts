const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 800;
const MINIMUM_PHYSICAL_TARGET = 44;
const MAXIMUM_LOGICAL_TARGET = 150;

export interface StageLayout {
  scale: number;
  minimumTargetSize: number;
}

export function calculateStageLayout(viewportWidth: number, viewportHeight: number): StageLayout {
  if (!Number.isFinite(viewportWidth) || !Number.isFinite(viewportHeight) || viewportWidth <= 0 || viewportHeight <= 0) {
    return { scale: 1, minimumTargetSize: MINIMUM_PHYSICAL_TARGET };
  }

  const scale = Math.min(viewportWidth / STAGE_WIDTH, viewportHeight / STAGE_HEIGHT);
  const minimumTargetSize = Math.min(
    MAXIMUM_LOGICAL_TARGET,
    Math.max(MINIMUM_PHYSICAL_TARGET, MINIMUM_PHYSICAL_TARGET / scale)
  );
  return { scale, minimumTargetSize };
}
