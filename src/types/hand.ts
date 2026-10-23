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
  DRAW = 'DRAW',
  PAUSE = 'PAUSE',
  PINCH = 'PINCH',
  OPEN_PALM = 'OPEN_PALM',
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
  isDrawing: boolean;
  isPinching: boolean;
  pinchDistance: number;
  indexTipMirrored: { x: number; y: number } | null;
  thumbTipMirrored: { x: number; y: number } | null;
  pinchMidpointMirrored: { x: number; y: number } | null;
  confidence: number;
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
