import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import {
  GestureState,
  GestureType,
  HandTrackingFrame,
  LandmarkIndex,
  NormalizedLandmark,
} from '../types/hand';
import {
  classifyHandPosture,
  createEmptyGestureResult,
} from './gestureRecognition';
import { GestureStateMachine } from './gestureStateMachine';

const VISION_WASM_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';
const HAND_LANDMARKER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20], // Pinky & Palm
];

export class HandTrackingController {
  private landmarker: HandLandmarker | null = null;
  private isInitializing: boolean = false;
  private lastVideoTime: number = -1;
  private stateMachine: GestureStateMachine = new GestureStateMachine();

  public async initialize(): Promise<void> {
    if (this.landmarker || this.isInitializing) return;
    this.isInitializing = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(VISION_WASM_CDN);

      try {
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: HAND_LANDMARKER_MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
      } catch {
        // Fallback to CPU delegate if WebGL / GPU delegate is unavailable
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: HAND_LANDMARKER_MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }
    } finally {
      this.isInitializing = false;
    }
  }

  public isReady(): boolean {
    return this.landmarker !== null;
  }

  public detectFrame(
    video: HTMLVideoElement,
    timestampMs: number,
    pinchThreshold: number = 0.048,
    enableGestureEraser: boolean = true
  ): HandTrackingFrame {
    if (
      !this.landmarker ||
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      const empty = createEmptyGestureResult();
      return {
        hasHand: false,
        handCount: 0,
        landmarks: null,
        handedness: null,
        confidence: 0,
        gestureResult: empty,
        timestamp: timestampMs,
      };
    }

    if (video.currentTime === this.lastVideoTime) {
      // Frame has not advanced
    }
    this.lastVideoTime = video.currentTime;

    const result = this.landmarker.detectForVideo(video, timestampMs);
    const handCount = result.landmarks ? result.landmarks.length : 0;

    if (handCount === 0 || !result.landmarks[0]) {
      const processed = this.stateMachine.process(
        GestureType.NONE,
        null,
        false,
        0,
        timestampMs
      );

      return {
        hasHand: false,
        handCount: 0,
        landmarks: null,
        handedness: null,
        confidence: 0,
        gestureResult: {
          gesture: processed.activeGesture,
          state: processed.state,
          isDrawing: processed.isDrawing,
          isErasing: processed.isErasing,
          isPinching: false,
          pinchDistance: 1,
          indexTipMirrored: processed.validPoint,
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
        },
        timestamp: timestampMs,
      };
    }

    const primaryLandmarks = result.landmarks[0] as NormalizedLandmark[];
    const primaryHandedness =
      result.handednesses?.[0]?.[0]?.categoryName ?? 'Hand';
    const primaryScore = result.handednesses?.[0]?.[0]?.score ?? 0.9;

    const wasDrawingPreviously =
      this.stateMachine.getCurrentState() === GestureState.DRAWING;

    // 1. Geometric posture classification
    const posture = classifyHandPosture(
      primaryLandmarks,
      primaryScore,
      pinchThreshold,
      wasDrawingPreviously,
      enableGestureEraser
    );

    // 2. Feed into temporal state machine
    const smResult = this.stateMachine.process(
      posture.rawGesture,
      posture.indexTipMirrored,
      posture.isPinching,
      primaryScore,
      timestampMs
    );

    return {
      hasHand: true,
      handCount,
      landmarks: primaryLandmarks,
      handedness: primaryHandedness,
      confidence: primaryScore,
      gestureResult: {
        gesture: smResult.activeGesture,
        state: smResult.state,
        isDrawing: smResult.isDrawing,
        isErasing: smResult.isErasing,
        isPinching: smResult.isPinching,
        pinchDistance: posture.pinchDistance,
        indexTipMirrored: smResult.validPoint,
        thumbTipMirrored: posture.thumbTipMirrored,
        pinchMidpointMirrored: posture.pinchMidpointMirrored,
        confidence: primaryScore,
        stabilityScore: posture.stabilityScore,
        fingersExtended: posture.fingersExtended,
      },
      timestamp: timestampMs,
    };
  }

  public resetStateMachine(): void {
    this.stateMachine.reset();
  }

  public dispose(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // Ignore close errors
      }
      this.landmarker = null;
    }
    this.lastVideoTime = -1;
    this.stateMachine.reset();
  }
}

/**
 * Renders detected hand skeleton onto the webcam preview overlay canvas.
 */
export function drawHandLandmarksOverlay(
  canvas: HTMLCanvasElement,
  landmarks: NormalizedLandmark[] | null,
  gesture: GestureType,
  showLandmarks: boolean
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  if (!landmarks || !showLandmarks || landmarks.length < 21) return;

  ctx.save();

  // Draw skeletal connections
  ctx.strokeStyle =
    gesture === GestureType.DRAW
      ? 'rgba(213, 184, 121, 0.85)'
      : gesture === GestureType.ERASE
        ? 'rgba(248, 113, 113, 0.85)'
        : 'rgba(164, 176, 193, 0.45)';
  ctx.lineWidth = 1.5;

  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (!start || !end) continue;

    ctx.beginPath();
    ctx.moveTo((1 - start.x) * width, start.y * height);
    ctx.lineTo((1 - end.x) * width, end.y * height);
    ctx.stroke();
  }

  // Draw joint nodes
  const keyTips = new Set<number>([
    LandmarkIndex.THUMB_TIP,
    LandmarkIndex.INDEX_MCP,
    LandmarkIndex.INDEX_TIP,
    LandmarkIndex.MIDDLE_TIP,
    LandmarkIndex.RING_TIP,
    LandmarkIndex.PINKY_TIP,
  ]);

  landmarks.forEach((lm, idx) => {
    const x = (1 - lm.x) * width;
    const y = lm.y * height;

    const isIndexTip = idx === LandmarkIndex.INDEX_TIP;
    const isMiddleTip = idx === LandmarkIndex.MIDDLE_TIP;
    const isThumbTip = idx === LandmarkIndex.THUMB_TIP;
    const isKey = keyTips.has(idx);

    ctx.beginPath();
    const radius = isIndexTip ? 5.5 : isThumbTip || isMiddleTip ? 4.5 : isKey ? 3 : 2;
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (isIndexTip) {
      ctx.fillStyle = gesture === GestureType.ERASE ? '#F87171' : '#D5B879';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#0B1220';
      ctx.stroke();

      if (gesture === GestureType.DRAW) {
        ctx.beginPath();
        ctx.arc(x, y, 9.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(213, 184, 121, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    } else if (isMiddleTip && gesture === GestureType.ERASE) {
      ctx.fillStyle = '#F87171';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 9.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (isThumbTip && gesture === GestureType.PINCH) {
      ctx.fillStyle = '#D5B879';
      ctx.fill();
    } else {
      ctx.fillStyle = isKey ? '#F0F2F6' : 'rgba(240, 242, 246, 0.55)';
      ctx.fill();
    }
  });

  // If pinching, draw connection ring between thumb tip and index tip
  if (gesture === GestureType.PINCH) {
    const indexTip = landmarks[LandmarkIndex.INDEX_TIP];
    const thumbTip = landmarks[LandmarkIndex.THUMB_TIP];
    const midX = ((1 - indexTip.x) + (1 - thumbTip.x)) * 0.5 * width;
    const midY = (indexTip.y + thumbTip.y) * 0.5 * height;

    ctx.beginPath();
    ctx.arc(midX, midY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#D5B879';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
}
