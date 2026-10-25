import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Hand,
  Loader2,
  XCircle,
} from 'lucide-react';
import { TrackingStatusSummary } from '../../hooks/useHandTracking';
import {
  CameraState,
  GestureType,
  TrackingModelState,
} from '../../types/hand';

export interface TrackingStatusProps {
  cameraState: CameraState;
  trackingStatus: TrackingStatusSummary;
  onRetryModel?: () => void;
}

export const TrackingStatus: React.FC<TrackingStatusProps> = ({
  cameraState,
  trackingStatus,
  onRetryModel,
}) => {
  const {
    modelState,
    modelError,
    hasHand,
    handCount,
    confidence,
    gesture,
    isErasing,
    isDrawing,
  } = trackingStatus;

  const confidencePct = hasHand ? Math.round(confidence * 100) : 0;

  let gestureLabel = 'Idle';
  if (trackingStatus.isPaused || gesture === GestureType.OPEN_PALM || gesture === GestureType.PAUSE) {
    gestureLabel = 'Paused (Open Palm)';
  } else if (isErasing || gesture === GestureType.ERASE) {
    gestureLabel = 'V-Sign Eraser';
  } else if (isDrawing || gesture === GestureType.DRAW) {
    gestureLabel = 'Drawing (Index Raised)';
  } else if (gesture === GestureType.PINCH) {
    gestureLabel = 'Pinch (Selection)';
  } else if (gesture === GestureType.CLUTCH) {
    gestureLabel = 'Clutched (Fist)';
  } else if (hasHand) {
    gestureLabel = 'Hover (Cursor Active)';
  }

  return (
    <div className="space-y-3 text-xs">
      {/* Model Loading or Error Notice */}
      {cameraState === CameraState.ACTIVE &&
        modelState === TrackingModelState.LOADING && (
          <div className="flex items-center gap-2 rounded-md bg-[#0B1220] border border-[#243247] px-3 py-2 text-[#A4B0C1]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D5B879] shrink-0" />
            <span>Loading MediaPipe Hand Landmarker…</span>
          </div>
        )}

      {modelState === TrackingModelState.ERROR && (
        <div className="rounded-md bg-[#E53E3E]/10 border border-[#E53E3E]/40 p-3 text-[#F0F2F6] space-y-2">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-[#E53E3E] shrink-0 mt-0.5" />
            <p className="text-xs text-[#A4B0C1] leading-relaxed">
              {modelError || 'Hand tracking model failed to load.'}
            </p>
          </div>
          {onRetryModel && (
            <button
              type="button"
              onClick={onRetryModel}
              className="text-xs font-medium text-[#D5B879] hover:underline cursor-pointer"
            >
              Retry Model Initialization
            </button>
          )}
        </div>
      )}

      {/* Multiple Hands Warning */}
      {cameraState === CameraState.ACTIVE && handCount > 1 && (
        <div className="flex items-center gap-2 rounded-md bg-[#D97706]/15 border border-[#D97706]/40 px-3 py-2 text-[#F0F2F6]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span>
            Multiple hands detected ({handCount}). Tracking primary hand only.
          </span>
        </div>
      )}

      {/* No Hand Detected Warning when Camera is Active */}
      {cameraState === CameraState.ACTIVE &&
        modelState === TrackingModelState.READY &&
        !hasHand && (
          <div className="flex items-center gap-2 rounded-md bg-[#0B1220] border border-[#243247] px-3 py-2 text-[#A4B0C1]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            <span>No hand in frame. Raise your hand before the camera.</span>
          </div>
        )}

      {/* Telemetry Readouts */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="rounded-md bg-[#0B1220] border border-[#243247] px-3 py-2">
          <div className="text-[11px] text-[#718096]">Optical Tracking</div>
          <div className="mt-1 flex items-center gap-1.5 font-medium text-[#F0F2F6]">
            {cameraState !== CameraState.ACTIVE ? (
              <span className="text-[#718096]">Camera Off</span>
            ) : hasHand ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#38A169] shrink-0" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <Hand className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                <span className="text-[#A4B0C1]">Searching</span>
              </>
            )}
          </div>
        </div>

        <div className="rounded-md bg-[#0B1220] border border-[#243247] px-3 py-2">
          <div className="text-[11px] text-[#718096]">Tracking Stability</div>
          <div className="mt-1 flex items-center justify-between font-mono text-xs text-[#F0F2F6] tabular-nums">
            <span>{hasHand ? `${confidencePct}%` : '—'}</span>
            <div className="w-12 h-1.5 bg-[#151E2D] rounded-full overflow-hidden border border-[#243247]">
              <div
                className="h-full bg-[#D5B879] transition-all duration-150"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Gesture State Row */}
      <div className="flex items-center justify-between rounded-md bg-[#0B1220] border border-[#243247] px-3 py-2">
        <span className="text-[11px] text-[#718096]">Current Posture</span>
        <span
          className={`font-medium ${
            isDrawing
              ? 'text-[#D5B879]'
              : isErasing
                ? 'text-[#F87171]'
                : gesture === GestureType.PINCH
                  ? 'text-[#D5B879]'
                  : 'text-[#F0F2F6]'
          }`}
        >
          {cameraState === CameraState.ACTIVE ? gestureLabel : 'Mouse Mode'}
        </span>
      </div>
    </div>
  );
};
