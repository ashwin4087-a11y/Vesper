import {
  GestureState,
  GestureType,
} from '../types/hand';

interface StateMachineConfig {
  drawOnsetFrames: number;       // Frames required to transition from HOVER -> DRAW
  eraseOnsetFrames: number;      // Frames required to transition from HOVER -> ERASE
  pauseOnsetFrames: number;      // Frames required to transition -> PAUSED
  pinchHoldFrames: number;       // Frames required to confirm PINCH
  trackingLossGraceMs: number;   // Milliseconds to wait before concluding a stroke on lost tracking
  maxTeleportDistance: number;   // Max normalized distance jump per frame to filter sensor glitches
}

const DEFAULT_CONFIG: StateMachineConfig = {
  drawOnsetFrames: 2,
  eraseOnsetFrames: 2,
  pauseOnsetFrames: 2,
  pinchHoldFrames: 2,
  trackingLossGraceMs: 130,
  maxTeleportDistance: 0.28,
};

export interface ProcessedGestureResult {
  state: GestureState;
  activeGesture: GestureType;
  isDrawing: boolean;
  isErasing: boolean;
  isPinching: boolean;
  isPaused: boolean;
  validPoint: { x: number; y: number } | null;
}

/**
 * Intelligent Gesture State Machine for VESPER.
 * Maintains temporal history across frames to eliminate jitter, accidental strokes,
 * micro-disconnects, and false tool triggers.
 * Distinguishes IDLE, HOVER, DRAWING, ERASING, PAUSED, and TRACKING_LOST.
 */
export class GestureStateMachine {
  private currentState: GestureState = GestureState.IDLE;
  private pendingDrawFrames: number = 0;
  private pendingEraseFrames: number = 0;
  private pendingPauseFrames: number = 0;
  private pendingPinchFrames: number = 0;

  private lastTrackingLossTimestamp: number = 0;
  private lastKnownValidPoint: { x: number; y: number } | null = null;
  private wasDrawingPriorToLoss: boolean = false;
  private wasErasingPriorToLoss: boolean = false;

  private config: StateMachineConfig;

  constructor(config: Partial<StateMachineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public reset(): void {
    this.currentState = GestureState.IDLE;
    this.pendingDrawFrames = 0;
    this.pendingEraseFrames = 0;
    this.pendingPauseFrames = 0;
    this.pendingPinchFrames = 0;
    this.lastTrackingLossTimestamp = 0;
    this.lastKnownValidPoint = null;
    this.wasDrawingPriorToLoss = false;
    this.wasErasingPriorToLoss = false;
  }

  public process(
    rawGesture: GestureType,
    indexTipMirrored: { x: number; y: number } | null,
    isRawPinching: boolean,
    confidence: number,
    timestamp: number
  ): ProcessedGestureResult {
    // 1. Hand not detected in this frame or confidence too low
    if (!indexTipMirrored || confidence < 0.4) {
      if (
        (this.currentState === GestureState.DRAWING ||
          this.currentState === GestureState.ERASING) &&
        this.lastTrackingLossTimestamp === 0
      ) {
        // Enter grace period to bridge transient webcam sensor dropouts
        this.lastTrackingLossTimestamp = timestamp;
        this.wasDrawingPriorToLoss = this.currentState === GestureState.DRAWING;
        this.wasErasingPriorToLoss = this.currentState === GestureState.ERASING;
        this.currentState = GestureState.TRACKING_LOST_GRACE;

        return {
          state: GestureState.TRACKING_LOST_GRACE,
          activeGesture: this.wasDrawingPriorToLoss ? GestureType.DRAW : GestureType.ERASE,
          isDrawing: this.wasDrawingPriorToLoss,
          isErasing: this.wasErasingPriorToLoss,
          isPinching: false,
          isPaused: false,
          validPoint: this.lastKnownValidPoint,
        };
      }

      if (this.currentState === GestureState.TRACKING_LOST_GRACE) {
        // Check if grace period has expired
        if (timestamp - this.lastTrackingLossTimestamp > this.config.trackingLossGraceMs) {
          // Conclude stroke permanently and transition to TRACKING_LOST
          this.currentState = GestureState.TRACKING_LOST;
          this.lastKnownValidPoint = null;
          this.wasDrawingPriorToLoss = false;
          this.wasErasingPriorToLoss = false;
        } else {
          // Still within grace window
          return {
            state: GestureState.TRACKING_LOST_GRACE,
            activeGesture: this.wasDrawingPriorToLoss ? GestureType.DRAW : GestureType.ERASE,
            isDrawing: this.wasDrawingPriorToLoss,
            isErasing: this.wasErasingPriorToLoss,
            isPinching: false,
            isPaused: false,
            validPoint: this.lastKnownValidPoint,
          };
        }
      } else {
        this.currentState = GestureState.TRACKING_LOST;
        this.lastKnownValidPoint = null;
      }

      this.pendingDrawFrames = 0;
      this.pendingEraseFrames = 0;
      this.pendingPauseFrames = 0;
      this.pendingPinchFrames = 0;

      return {
        state: this.currentState,
        activeGesture: GestureType.NONE,
        isDrawing: false,
        isErasing: false,
        isPinching: false,
        isPaused: false,
        validPoint: null,
      };
    }

    // 2. Teleportation / Outlier Glitch Detection
    // Prevent sudden landmark jumps from creating unwanted slashes across the artwork
    if (this.lastKnownValidPoint) {
      const dist = Math.hypot(
        indexTipMirrored.x - this.lastKnownValidPoint.x,
        indexTipMirrored.y - this.lastKnownValidPoint.y
      );

      // If coordinate jumped abnormally fast across the canvas, clamp or reject
      if (dist > this.config.maxTeleportDistance && this.currentState === GestureState.DRAWING) {
        // Discard extreme outlier jump to preserve stroke integrity
        return {
          state: this.currentState,
          activeGesture: GestureType.DRAW,
          isDrawing: true,
          isErasing: false,
          isPinching: false,
          isPaused: false,
          validPoint: this.lastKnownValidPoint,
        };
      }
    }

    // Recovering from tracking loss grace or returning after tracking lost
    if (this.currentState === GestureState.TRACKING_LOST_GRACE) {
      this.lastTrackingLossTimestamp = 0;
      if (this.wasDrawingPriorToLoss && rawGesture === GestureType.DRAW) {
        this.currentState = GestureState.DRAWING;
      } else if (this.wasErasingPriorToLoss && rawGesture === GestureType.ERASE) {
        this.currentState = GestureState.ERASING;
      } else {
        this.currentState = GestureState.HOVER;
      }
    } else if (this.currentState === GestureState.TRACKING_LOST || this.currentState === GestureState.IDLE) {
      // Hand newly re-entered frame: ensure it starts in HOVER without joining old stroke
      this.currentState = GestureState.HOVER;
      this.pendingDrawFrames = 0;
      this.pendingEraseFrames = 0;
      this.pendingPauseFrames = 0;
    }

    this.lastKnownValidPoint = indexTipMirrored;

    // 3. Pinch gesture transitions
    if (isRawPinching) {
      this.pendingPinchFrames++;
      if (this.pendingPinchFrames >= this.config.pinchHoldFrames) {
        this.currentState = GestureState.PINCH_ACTIVE;
      } else {
        this.currentState = GestureState.PINCH_PENDING;
      }
      this.pendingDrawFrames = 0;
      this.pendingEraseFrames = 0;
      this.pendingPauseFrames = 0;

      return {
        state: this.currentState,
        activeGesture: GestureType.PINCH,
        isDrawing: false,
        isErasing: false,
        isPinching: this.currentState === GestureState.PINCH_ACTIVE,
        isPaused: false,
        validPoint: indexTipMirrored,
      };
    } else {
      this.pendingPinchFrames = 0;
    }

    // 4. Intentional Pause Gesture (Open Palm / All fingers spread)
    if (rawGesture === GestureType.OPEN_PALM || rawGesture === GestureType.PAUSE) {
      this.pendingPauseFrames++;
      this.pendingDrawFrames = 0;
      this.pendingEraseFrames = 0;

      if (this.pendingPauseFrames >= this.config.pauseOnsetFrames) {
        this.currentState = GestureState.PAUSED;
      }

      return {
        state: this.currentState === GestureState.PAUSED ? GestureState.PAUSED : GestureState.HOVER,
        activeGesture: GestureType.OPEN_PALM,
        isDrawing: false,
        isErasing: false,
        isPinching: false,
        isPaused: this.currentState === GestureState.PAUSED,
        validPoint: indexTipMirrored,
      };
    } else {
      this.pendingPauseFrames = 0;
    }

    // 5. Drawing gesture transitions
    if (rawGesture === GestureType.DRAW) {
      this.pendingEraseFrames = 0;

      if (this.currentState === GestureState.DRAWING) {
        // Sustained drawing
        return {
          state: GestureState.DRAWING,
          activeGesture: GestureType.DRAW,
          isDrawing: true,
          isErasing: false,
          isPinching: false,
          isPaused: false,
          validPoint: indexTipMirrored,
        };
      }

      // Check onset debounce frames to prevent accidental single-frame touches
      this.pendingDrawFrames++;
      if (this.pendingDrawFrames >= this.config.drawOnsetFrames) {
        this.currentState = GestureState.DRAWING;
      } else {
        this.currentState = GestureState.DRAW_PENDING;
      }

      const isConfirmedDrawing = this.currentState === GestureState.DRAWING;
      return {
        state: this.currentState,
        activeGesture: isConfirmedDrawing ? GestureType.DRAW : GestureType.HOVER,
        isDrawing: isConfirmedDrawing,
        isErasing: false,
        isPinching: false,
        isPaused: false,
        validPoint: indexTipMirrored,
      };
    }

    // 6. Erase gesture transitions (V-sign / two fingers)
    if (rawGesture === GestureType.ERASE) {
      this.pendingDrawFrames = 0;

      if (this.currentState === GestureState.ERASING) {
        return {
          state: GestureState.ERASING,
          activeGesture: GestureType.ERASE,
          isDrawing: false,
          isErasing: true,
          isPinching: false,
          isPaused: false,
          validPoint: indexTipMirrored,
        };
      }

      this.pendingEraseFrames++;
      if (this.pendingEraseFrames >= this.config.eraseOnsetFrames) {
        this.currentState = GestureState.ERASING;
      } else {
        this.currentState = GestureState.ERASE_PENDING;
      }

      const isConfirmedErasing = this.currentState === GestureState.ERASING;
      return {
        state: this.currentState,
        activeGesture: isConfirmedErasing ? GestureType.ERASE : GestureType.HOVER,
        isDrawing: false,
        isErasing: isConfirmedErasing,
        isPinching: false,
        isPaused: false,
        validPoint: indexTipMirrored,
      };
    }

    // 7. Hover / Resting state
    this.pendingDrawFrames = 0;
    this.pendingEraseFrames = 0;
    this.currentState = GestureState.HOVER;

    return {
      state: GestureState.HOVER,
      activeGesture: GestureType.HOVER,
      isDrawing: false,
      isErasing: false,
      isPinching: false,
      isPaused: false,
      validPoint: indexTipMirrored,
    };
  }

  public getCurrentState(): GestureState {
    return this.currentState;
  }
}
