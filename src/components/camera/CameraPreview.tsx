import React, { useState } from 'react';
import {
  AlertCircle,
  Camera,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { TrackingStatusSummary } from '../../hooks/useHandTracking';
import { CameraState, GestureType } from '../../types/hand';
import { CameraControls } from './CameraControls';
import { TrackingStatus } from './TrackingStatus';

export interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraState: CameraState;
  cameraError: string | null;
  trackingStatus: TrackingStatusSummary;
  showLandmarks: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onRestartCamera: () => void;
  onToggleLandmarks: () => void;
  onRetryModel: () => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  overlayCanvasRef,
  cameraState,
  cameraError,
  trackingStatus,
  showLandmarks,
  onStartCamera,
  onStopCamera,
  onRestartCamera,
  onToggleLandmarks,
  onRetryModel,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpandedView, setIsExpandedView] = useState(false);

  const isActive = cameraState === CameraState.ACTIVE;

  return (
    <div className="space-y-3">
      {/* Header Row with Collapse & Expand Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#F0F2F6]">
            Optical Hand Feed
          </span>
          <span className="text-[11px] text-[#718096]">· Mirrored</span>
        </div>

        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsExpandedView((prev) => !prev)}
              aria-label={
                isExpandedView ? 'Standard preview size' : 'Expand preview size'
              }
              className="p-1 rounded text-[#A4B0C1] hover:text-[#F0F2F6] hover:bg-[#243247]/40 transition-colors cursor-pointer"
            >
              {isExpandedView ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={
              isCollapsed ? 'Expand camera panel' : 'Collapse camera panel'
            }
            className="p-1 rounded text-[#A4B0C1] hover:text-[#F0F2F6] hover:bg-[#243247]/40 transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Video element must remain mounted in DOM so tracking continues even if preview is collapsed */}
      <div className={isCollapsed ? 'sr-only' : 'block'}>
        <div
          className={`relative w-full rounded-lg bg-[#0B1220] border border-[#243247] overflow-hidden transition-all ${
            isExpandedView ? 'aspect-[4/3]' : 'aspect-[16/10]'
          }`}
        >
          {/* Mirrored Webcam Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover -scale-x-100 ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Landmark Skeleton Overlay Canvas */}
          <canvas
            ref={overlayCanvasRef}
            width={320}
            height={240}
            className={`pointer-events-none absolute inset-0 w-full h-full object-cover ${
              isActive && showLandmarks ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Active Gesture HUD Tag */}
          {isActive && trackingStatus.hasHand && (
            <div className="absolute top-2.5 left-2.5 rounded bg-[#0B1220]/85 border border-[#243247] px-2 py-0.5 text-[11px] font-mono text-[#F0F2F6] flex items-center gap-1.5">
              <span
                className={
                  trackingStatus.gesture === GestureType.DRAW
                    ? 'text-[#D5B879] font-semibold'
                    : 'text-[#A4B0C1]'
                }
              >
                {trackingStatus.gesture === GestureType.DRAW
                  ? 'DRAWING'
                  : trackingStatus.gesture === GestureType.PINCH
                    ? 'PINCH'
                    : 'HOVER'}
              </span>
            </div>
          )}

          {/* Idle / Stopped State Overlay */}
          {!isActive && cameraState !== CameraState.ERROR && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <Camera className="w-6 h-6 text-[#718096] mb-2" />
              <p className="text-xs font-medium text-[#F0F2F6]">
                {cameraState === CameraState.REQUESTING
                  ? 'Awaiting browser camera permission…'
                  : 'Camera is currently inactive'}
              </p>
              <p className="mt-1 text-[11px] text-[#718096] max-w-[220px]">
                Enable your webcam for touch-free gesture drawing, or draw on
                the canvas with your mouse.
              </p>
            </div>
          )}

          {/* Error State Overlay */}
          {cameraState === CameraState.ERROR && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[#0B1220]/95">
              <AlertCircle className="w-6 h-6 text-[#E53E3E] mb-2 shrink-0" />
              <p className="text-xs font-medium text-[#F0F2F6]">
                Camera Unavailable
              </p>
              <p className="mt-1 text-[11px] text-[#A4B0C1] leading-relaxed">
                {cameraError}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Camera Stream Controls */}
      <CameraControls
        cameraState={cameraState}
        showLandmarks={showLandmarks}
        onStartCamera={onStartCamera}
        onStopCamera={onStopCamera}
        onRestartCamera={onRestartCamera}
        onToggleLandmarks={onToggleLandmarks}
      />

      {/* Tracking Telemetry & Warnings */}
      <TrackingStatus
        cameraState={cameraState}
        trackingStatus={trackingStatus}
        onRetryModel={onRetryModel}
      />
    </div>
  );
};
