import { useCallback, useEffect, useRef, useState } from 'react';
import {
  drawHandLandmarksOverlay,
  HandTrackingController,
} from '../lib/handTracking';
import { createEmptyGestureResult } from '../lib/gestureRecognition';
import {
  CameraState,
  GestureType,
  HandTrackingFrame,
  TrackingModelState,
} from '../types/hand';

export interface TrackingStatusSummary {
  modelState: TrackingModelState;
  modelError: string | null;
  hasHand: boolean;
  handCount: number;
  handedness: string | null;
  confidence: number;
  gesture: GestureType;
  isDrawing: boolean;
  isPinching: boolean;
}

export interface UseHandTrackingOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraState: CameraState;
  pinchThreshold: number;
  showLandmarks: boolean;
  onFrame?: (frame: HandTrackingFrame) => void;
  onPinchTrigger?: (midpoint: { x: number; y: number }) => void;
}

export function useHandTracking({
  videoRef,
  overlayCanvasRef,
  cameraState,
  pinchThreshold,
  showLandmarks,
  onFrame,
  onPinchTrigger,
}: UseHandTrackingOptions) {
  const controllerRef = useRef<HandTrackingController | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const latestFrameRef = useRef<HandTrackingFrame>({
    hasHand: false,
    handCount: 0,
    landmarks: null,
    handedness: null,
    confidence: 0,
    gestureResult: createEmptyGestureResult(),
    timestamp: 0,
  });

  // Refs for latest callback & settings to avoid recreating the RAF loop
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const onPinchTriggerRef = useRef(onPinchTrigger);
  onPinchTriggerRef.current = onPinchTrigger;

  const pinchThresholdRef = useRef(pinchThreshold);
  pinchThresholdRef.current = pinchThreshold;

  const showLandmarksRef = useRef(showLandmarks);
  showLandmarksRef.current = showLandmarks;

  const lastPinchTimeRef = useRef<number>(0);
  const wasPinchingRef = useRef<boolean>(false);
  const lastUiSyncRef = useRef<number>(0);

  const [status, setStatus] = useState<TrackingStatusSummary>({
    modelState: TrackingModelState.UNINITIALIZED,
    modelError: null,
    hasHand: false,
    handCount: 0,
    handedness: null,
    confidence: 0,
    gesture: GestureType.NONE,
    isDrawing: false,
    isPinching: false,
  });

  const ensureModelLoaded = useCallback(async (): Promise<boolean> => {
    if (controllerRef.current?.isReady()) {
      setStatus((prev) => ({
        ...prev,
        modelState: TrackingModelState.READY,
        modelError: null,
      }));
      return true;
    }

    setStatus((prev) => ({
      ...prev,
      modelState: TrackingModelState.LOADING,
      modelError: null,
    }));

    try {
      if (!controllerRef.current) {
        controllerRef.current = new HandTrackingController();
      }
      await controllerRef.current.initialize();
      setStatus((prev) => ({
        ...prev,
        modelState: TrackingModelState.READY,
        modelError: null,
      }));
      return true;
    } catch (err) {
      console.error('MediaPipe initialization error:', err);
      setStatus((prev) => ({
        ...prev,
        modelState: TrackingModelState.ERROR,
        modelError:
          'Failed to initialize MediaPipe Hand Landmarker model. Check your network connection or use mouse drawing.',
      }));
      return false;
    }
  }, []);

  const stopTrackingLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      ctx?.clearRect(
        0,
        0,
        overlayCanvasRef.current.width,
        overlayCanvasRef.current.height
      );
    }
    setStatus((prev) => ({
      ...prev,
      hasHand: false,
      handCount: 0,
      confidence: 0,
      gesture: GestureType.NONE,
      isDrawing: false,
      isPinching: false,
    }));
  }, [overlayCanvasRef]);

  const disposeTracking = useCallback(() => {
    stopTrackingLoop();
    if (controllerRef.current) {
      controllerRef.current.dispose();
      controllerRef.current = null;
    }
    setStatus({
      modelState: TrackingModelState.UNINITIALIZED,
      modelError: null,
      hasHand: false,
      handCount: 0,
      handedness: null,
      confidence: 0,
      gesture: GestureType.NONE,
      isDrawing: false,
      isPinching: false,
    });
  }, [stopTrackingLoop]);

  useEffect(() => {
    let cancelled = false;

    if (cameraState !== CameraState.ACTIVE) {
      stopTrackingLoop();
      return;
    }

    const startLoop = async () => {
      const ready = await ensureModelLoaded();
      if (!ready || cancelled) return;

      const tick = (now: number) => {
        if (cancelled) return;

        const video = videoRef.current;
        const controller = controllerRef.current;

        if (video && controller && controller.isReady()) {
          try {
            const frame = controller.detectFrame(
              video,
              now,
              pinchThresholdRef.current
            );
            latestFrameRef.current = frame;

            // Render landmarks onto the camera preview overlay canvas
            if (overlayCanvasRef.current) {
              drawHandLandmarksOverlay(
                overlayCanvasRef.current,
                frame.landmarks,
                frame.gestureResult.gesture,
                showLandmarksRef.current
              );
            }

            // Detect discrete pinch onset with 650ms cooldown
            if (frame.gestureResult.isPinching && !wasPinchingRef.current) {
              if (
                now - lastPinchTimeRef.current > 650 &&
                frame.gestureResult.pinchMidpointMirrored
              ) {
                lastPinchTimeRef.current = now;
                onPinchTriggerRef.current?.(
                  frame.gestureResult.pinchMidpointMirrored
                );
              }
            }
            wasPinchingRef.current = frame.gestureResult.isPinching;

            // Invoke high-frequency canvas drawing callback
            onFrameRef.current?.(frame);

            // Throttle React UI state updates to ~140ms or immediate discrete state transition
            setStatus((prev) => {
              const discreteChanged =
                prev.hasHand !== frame.hasHand ||
                prev.handCount !== frame.handCount ||
                prev.gesture !== frame.gestureResult.gesture ||
                prev.isDrawing !== frame.gestureResult.isDrawing ||
                prev.isPinching !== frame.gestureResult.isPinching;

              if (!discreteChanged && now - lastUiSyncRef.current < 140) {
                return prev;
              }

              lastUiSyncRef.current = now;
              return {
                ...prev,
                hasHand: frame.hasHand,
                handCount: frame.handCount,
                handedness: frame.handedness,
                confidence: frame.confidence,
                gesture: frame.gestureResult.gesture,
                isDrawing: frame.gestureResult.isDrawing,
                isPinching: frame.gestureResult.isPinching,
              };
            });
          } catch (err) {
            console.warn('Frame tracking interruption:', err);
          }
        }

        rafIdRef.current = requestAnimationFrame(tick);
      };

      rafIdRef.current = requestAnimationFrame(tick);
    };

    startLoop();

    return () => {
      cancelled = true;
      stopTrackingLoop();
    };
  }, [cameraState, ensureModelLoaded, stopTrackingLoop, videoRef, overlayCanvasRef]);

  useEffect(() => {
    return () => {
      disposeTracking();
    };
  }, [disposeTracking]);

  return {
    latestFrameRef,
    status,
    disposeTracking,
    retryModelLoad: ensureModelLoaded,
  };
}
