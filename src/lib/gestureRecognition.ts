import {
  GestureResult,
  GestureType,
  LandmarkIndex,
  NormalizedLandmark,
} from '../types/hand';
import { mirrorAndNormalizeCoordinate } from './coordinateMapping';

function distance2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distance3DWeighted(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dz = (a.z - b.z) * 0.65;
  return Math.hypot(a.x - b.x, a.y - b.y, dz);
}

/**
 * Determines whether a finger is extended by comparing tip-to-wrist distance
 * against PIP-to-wrist and MCP-to-wrist distances.
 */
function isFingerExtended(
  landmarks: NormalizedLandmark[],
  mcpIdx: number,
  pipIdx: number,
  dipIdx: number,
  tipIdx: number
): boolean {
  const wrist = landmarks[LandmarkIndex.WRIST];
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const dip = landmarks[dipIdx];
  const tip = landmarks[tipIdx];

  if (!wrist || !mcp || !pip || !dip || !tip) return false;

  const wristToTip = distance2D(wrist, tip);
  const wristToPip = distance2D(wrist, pip);
  const wristToDip = distance2D(wrist, dip);
  const mcpToTip = distance2D(mcp, tip);
  const mcpToPip = distance2D(mcp, pip);

  return (
    wristToTip > wristToPip * 1.12 &&
    wristToTip > wristToDip * 1.03 &&
    mcpToTip > mcpToPip * 1.25
  );
}

function isThumbExtended(landmarks: NormalizedLandmark[]): boolean {
  const thumbTip = landmarks[LandmarkIndex.THUMB_TIP];
  const thumbIp = landmarks[LandmarkIndex.THUMB_IP];
  const indexMcp = landmarks[LandmarkIndex.INDEX_MCP];
  const pinkyMcp = landmarks[LandmarkIndex.PINKY_MCP];

  if (!thumbTip || !thumbIp || !indexMcp || !pinkyMcp) return false;

  const palmWidth = Math.max(0.05, distance2D(indexMcp, pinkyMcp));
  const tipToPinky = distance2D(thumbTip, pinkyMcp);
  const ipToPinky = distance2D(thumbIp, pinkyMcp);

  return (
    tipToPinky > ipToPinky * 1.08 &&
    distance2D(thumbTip, indexMcp) > palmWidth * 0.55
  );
}

export function createEmptyGestureResult(): GestureResult {
  return {
    gesture: GestureType.NONE,
    isDrawing: false,
    isPinching: false,
    pinchDistance: 1,
    indexTipMirrored: null,
    thumbTipMirrored: null,
    pinchMidpointMirrored: null,
    confidence: 0,
    fingersExtended: {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    },
  };
}

/**
 * Evaluates 21 MediaPipe hand landmarks to classify VESPER studio gestures:
 * - DRAW: Index finger raised/extended; Middle, Ring, and Pinky folded.
 *   Protected with hysteresis so hand angle changes mid-stroke do not falsely trigger pinch.
 * - PINCH: Thumb tip (4) and Index tip (8) intentionally brought together.
 * - OPEN_PALM / PAUSE: Multiple fingers raised or fist closed (stops drawing cleanly).
 */
export function recognizeHandGesture(
  landmarks: NormalizedLandmark[] | null,
  confidence: number = 1,
  pinchThreshold: number = 0.045,
  wasDrawingPreviously: boolean = false
): GestureResult {
  if (!landmarks || landmarks.length < 21) {
    return createEmptyGestureResult();
  }

  const indexTip = landmarks[LandmarkIndex.INDEX_TIP];
  const thumbTip = landmarks[LandmarkIndex.THUMB_TIP];
  const wrist = landmarks[LandmarkIndex.WRIST];
  const indexPip = landmarks[LandmarkIndex.INDEX_PIP];

  const indexExtended = isFingerExtended(
    landmarks,
    LandmarkIndex.INDEX_MCP,
    LandmarkIndex.INDEX_PIP,
    LandmarkIndex.INDEX_DIP,
    LandmarkIndex.INDEX_TIP
  );
  const middleExtended = isFingerExtended(
    landmarks,
    LandmarkIndex.MIDDLE_MCP,
    LandmarkIndex.MIDDLE_PIP,
    LandmarkIndex.MIDDLE_DIP,
    LandmarkIndex.MIDDLE_TIP
  );
  const ringExtended = isFingerExtended(
    landmarks,
    LandmarkIndex.RING_MCP,
    LandmarkIndex.RING_PIP,
    LandmarkIndex.RING_DIP,
    LandmarkIndex.RING_TIP
  );
  const pinkyExtended = isFingerExtended(
    landmarks,
    LandmarkIndex.PINKY_MCP,
    LandmarkIndex.PINKY_PIP,
    LandmarkIndex.PINKY_DIP,
    LandmarkIndex.PINKY_TIP
  );
  const thumbExtended = isThumbExtended(landmarks);

  // Use 3D-weighted distance so thumb passing behind index finger at an angle isn't a false pinch
  const pinchDistance = distance3DWeighted(thumbTip, indexTip);

  // Require a tighter threshold if already actively drawing so mid-stroke hand rotation never interrupts drawing
  const effectivePinchThreshold = wasDrawingPreviously
    ? pinchThreshold * 0.65
    : pinchThreshold;

  const isPinching = pinchDistance < effectivePinchThreshold;

  const indexTipMirrored = mirrorAndNormalizeCoordinate(indexTip);
  const thumbTipMirrored = mirrorAndNormalizeCoordinate(thumbTip);
  const pinchMidpointMirrored = {
    x: (indexTipMirrored.x + thumbTipMirrored.x) / 2,
    y: (indexTipMirrored.y + thumbTipMirrored.y) / 2,
  };

  const indexStillUpHysteresis =
    wasDrawingPreviously &&
    distance2D(wrist, indexTip) > distance2D(wrist, indexPip) * 1.04;

  const otherFingersFolded = !middleExtended && !ringExtended && !pinkyExtended;

  let gesture: GestureType = GestureType.PAUSE;
  let isDrawing = false;

  if ((indexExtended || indexStillUpHysteresis) && otherFingersFolded && !isPinching) {
    gesture = GestureType.DRAW;
    isDrawing = true;
  } else if (isPinching) {
    gesture = GestureType.PINCH;
    isDrawing = false;
  } else if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    gesture = GestureType.OPEN_PALM;
    isDrawing = false;
  } else {
    gesture = GestureType.PAUSE;
    isDrawing = false;
  }

  return {
    gesture,
    isDrawing,
    isPinching,
    pinchDistance,
    indexTipMirrored,
    thumbTipMirrored,
    pinchMidpointMirrored,
    confidence,
    fingersExtended: {
      thumb: thumbExtended,
      index: indexExtended,
      middle: middleExtended,
      ring: ringExtended,
      pinky: pinkyExtended,
    },
  };
}
