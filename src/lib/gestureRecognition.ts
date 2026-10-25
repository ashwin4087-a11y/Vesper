import {
  GestureResult,
  GestureState,
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
  tipIdx: number,
  hysteresisFactor: number = 1.0
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
    wristToTip > wristToPip * (1.10 * hysteresisFactor) &&
    wristToTip > wristToDip * (1.02 * hysteresisFactor) &&
    mcpToTip > mcpToPip * (1.20 * hysteresisFactor)
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
    state: GestureState.IDLE,
    isDrawing: false,
    isErasing: false,
    isPinching: false,
    pinchDistance: 1,
    indexTipMirrored: null,
    thumbTipMirrored: null,
    pinchMidpointMirrored: null,
    confidence: 0,
    stabilityScore: 0,
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
 * Evaluates 21 MediaPipe hand landmarks to classify VESPER studio postures:
 * - DRAW: Index finger raised; Middle, Ring, and Pinky folded.
 * - ERASE: V-Sign / Peace posture (Index and Middle extended; Ring and Pinky folded).
 * - PINCH: Thumb tip (4) and Index tip (8) intentionally brought together.
 * - OPEN_PALM: All 5 fingers extended (clean pause / hover).
 * - CLUTCH: Fist / closed fingers (safe hand repositioning).
 * - HOVER: Hand in frame, moving cursor without depositing ink.
 */
export function classifyHandPosture(
  landmarks: NormalizedLandmark[] | null,
  confidence: number = 1,
  pinchThreshold: number = 0.048,
  wasDrawingPreviously: boolean = false,
  enableGestureEraser: boolean = true
): {
  rawGesture: GestureType;
  isPinching: boolean;
  pinchDistance: number;
  indexTipMirrored: { x: number; y: number } | null;
  thumbTipMirrored: { x: number; y: number } | null;
  pinchMidpointMirrored: { x: number; y: number } | null;
  stabilityScore: number;
  fingersExtended: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
} {
  if (!landmarks || landmarks.length < 21) {
    const empty = createEmptyGestureResult();
    return {
      rawGesture: empty.gesture,
      isPinching: false,
      pinchDistance: 1,
      indexTipMirrored: null,
      thumbTipMirrored: null,
      pinchMidpointMirrored: null,
      stabilityScore: 0,
      fingersExtended: empty.fingersExtended,
    };
  }

  const indexTip = landmarks[LandmarkIndex.INDEX_TIP];
  const thumbTip = landmarks[LandmarkIndex.THUMB_TIP];
  const indexExtendedHysteresis = wasDrawingPreviously ? 0.90 : 1.0;

  const indexExtended = isFingerExtended(
    landmarks,
    LandmarkIndex.INDEX_MCP,
    LandmarkIndex.INDEX_PIP,
    LandmarkIndex.INDEX_DIP,
    LandmarkIndex.INDEX_TIP,
    indexExtendedHysteresis
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

  // 3D-weighted pinch distance
  const pinchDistance = distance3DWeighted(thumbTip, indexTip);
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

  let rawGesture: GestureType = GestureType.HOVER;

  const otherFingersFolded = !middleExtended && !ringExtended && !pinkyExtended;
  const allFingersExtended =
    indexExtended && middleExtended && ringExtended && pinkyExtended;
  const allFingersFolded =
    !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;

  if (isPinching) {
    rawGesture = GestureType.PINCH;
  } else if (
    enableGestureEraser &&
    indexExtended &&
    middleExtended &&
    !ringExtended &&
    !pinkyExtended
  ) {
    // V-Sign / Peace sign is natural intuitive Eraser posture
    rawGesture = GestureType.ERASE;
  } else if (indexExtended && otherFingersFolded) {
    rawGesture = GestureType.DRAW;
  } else if (allFingersExtended) {
    rawGesture = GestureType.OPEN_PALM;
  } else if (allFingersFolded) {
    rawGesture = GestureType.CLUTCH;
  } else {
    rawGesture = GestureType.HOVER;
  }

  // Calculate hand landmark stability score
  const wrist = landmarks[LandmarkIndex.WRIST];
  const palmSpan = distance2D(wrist, indexTip);
  const stabilityScore = Math.max(0.4, Math.min(1.0, confidence * (palmSpan > 0.15 ? 1 : 0.8)));

  return {
    rawGesture,
    isPinching,
    pinchDistance,
    indexTipMirrored,
    thumbTipMirrored,
    pinchMidpointMirrored,
    stabilityScore,
    fingersExtended: {
      thumb: thumbExtended,
      index: indexExtended,
      middle: middleExtended,
      ring: ringExtended,
      pinky: pinkyExtended,
    },
  };
}
