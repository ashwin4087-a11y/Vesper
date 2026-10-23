import { Point } from '../types/drawing';
import { NormalizedLandmark } from '../types/hand';

/**
 * Mirrors normalized MediaPipe landmark X coordinate for webcam selfie view
 * and applies a subtle edge comfort margin so users can comfortably reach all 4 canvas corners.
 */
export function mirrorAndNormalizeCoordinate(
  landmark: NormalizedLandmark,
  edgeMargin: number = 0.07
): { x: number; y: number } {
  const rawMirroredX = 1 - landmark.x;
  const rawY = landmark.y;

  const span = 1 - edgeMargin * 2;
  const clampedX = Math.max(0, Math.min(1, (rawMirroredX - edgeMargin) / span));
  const clampedY = Math.max(0, Math.min(1, (rawY - edgeMargin) / span));

  return { x: clampedX, y: clampedY };
}

/**
 * Maps normalized [0..1] coordinates to logical canvas pixel coordinates.
 */
export function normalizedToCanvasPoint(
  norm: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number
): Point {
  return {
    x: norm.x * canvasWidth,
    y: norm.y * canvasHeight,
  };
}

/**
 * Adaptive exponential smoothing filter for hand coordinates.
 * High-speed movements get higher alpha (less lag), while slow/fine movements
 * get stronger smoothing to eliminate camera sensor jitter.
 */
export function smoothPointAdaptive(
  previous: Point | null,
  target: Point,
  smoothingFactor: number = 0.55
): Point {
  if (!previous) return target;

  const dx = target.x - previous.x;
  const dy = target.y - previous.y;
  const velocity = Math.hypot(dx, dy);

  // Base alpha from user smoothing setting (0.15 = very smooth, 0.85 = very responsive)
  const baseAlpha = Math.max(0.18, Math.min(0.88, 1 - smoothingFactor * 0.72));
  // Boost alpha dynamically during fast strokes so the cursor stays locked to the fingertip
  const velocityBoost = Math.min(0.35, velocity / 140);
  const alpha = Math.min(0.92, baseAlpha + velocityBoost);

  return {
    x: previous.x + dx * alpha,
    y: previous.y + dy * alpha,
  };
}

/**
 * Converts a mouse/pointer event into logical canvas coordinates.
 */
export function pointerEventToCanvasPoint(
  event: { clientX: number; clientY: number },
  canvasElement: HTMLCanvasElement
): Point {
  const rect = canvasElement.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
