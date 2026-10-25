export enum LandmarkIndex {
  WRIST = 0,
  THUMB_CMC = 1,
  THUMB_MCP = 2,
  THUMB_IP = 3,
  THUMB_TIP = 4,
  INDEX_MCP = 5,
  INDEX_PIP = 6,
  INDEX_DIP = 7,
  INDEX_TIP = 8,
  MIDDLE_MCP = 9,
  MIDDLE_PIP = 10,
  MIDDLE_DIP = 11,
  MIDDLE_TIP = 12,
  RING_MCP = 13,
  RING_PIP = 14,
  RING_DIP = 15,
  RING_TIP = 16,
  PINKY_MCP = 17,
  PINKY_PIP = 18,
  PINKY_DIP = 19,
  PINKY_TIP = 20,
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export enum GestureType {
  NONE = 'NONE',
  HOVER = 'HOVER',
  DRAW = 'DRAW',
  ERASE = 'ERASE',
  PINCH = 'PINCH',
  OPEN_PALM = 'OPEN_PALM',
  CLUTCH = 'CLUTCH',
  PAUSE = 'PAUSE', // Retained for backwards compatibility
}

export enum GestureState {
  IDLE = 'IDLE',
  HOVER = 'HOVER',
  DRAW_PENDING = 'DRAW_PENDING',
  DRAWING = 'DRAWING',
  ERASE_PENDING = 'ERASE_PENDING',
  ERASING = 'ERASING',
  PAUSED = 'PAUSED',
  PINCH_PENDING = 'PINCH_PENDING',
  PINCH_ACTIVE = 'PINCH_ACTIVE',
  TRACKING_LOST_GRACE = 'TRACKING_LOST_GRACE',
  TRACKING_LOST = 'TRACKING_LOST',
}

export enum CameraState {
  IDLE = 'IDLE',
  REQUESTING = 'REQUESTING',
  ACTIVE = 'ACTIVE',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR',
}

export enum TrackingModelState {
  UNINITIALIZED = 'UNINITIALIZED',
  LOADING = 'LOADING',
  READY = 'READY',
  ERROR = 'ERROR',
}

export interface GestureResult {
  gesture: GestureType;
  state: GestureState;
  isDrawing: boolean;
  isErasing: boolean;
  isPinching: boolean;
  isPaused: boolean;
  pinchDistance: number;
  indexTipMirrored: { x: number; y: number } | null;
  thumbTipMirrored: { x: number; y: number } | null;
  pinchMidpointMirrored: { x: number; y: number } | null;
  confidence: number;
  stabilityScore: number;
  fingersExtended: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}

export interface HandTrackingFrame {
  hasHand: boolean;
  handCount: number;
  landmarks: NormalizedLandmark[] | null;
  handedness: string | null;
  confidence: number;
  gestureResult: GestureResult;
  timestamp: number;
}
