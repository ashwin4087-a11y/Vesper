import React from 'react';
import {
  Brush,
  Camera,
  CameraOff,
  Eraser,
  Hand,
  Layers,
} from 'lucide-react';
import { TrackingStatusSummary } from '../../hooks/useHandTracking';
import { ToolType, VESPER_PALETTE } from '../../types/drawing';
import { CameraState, GestureType } from '../../types/hand';

export interface StatusBarProps {
  cameraState: CameraState;
  trackingStatus: TrackingStatusSummary;
  activeTool: ToolType;
  activeSize: number;
  activeColor: string;
  strokeCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cameraState,
  trackingStatus,
  activeTool,
  activeSize,
  activeColor,
  strokeCount,
}) => {
  const isCameraActive = cameraState === CameraState.ACTIVE;
  const confidencePct = trackingStatus.hasHand
    ? `${Math.round(trackingStatus.confidence * 100)}%`
    : '—';

  const colorInfo =
    VESPER_PALETTE.find(
      (c) => c.hex.toLowerCase() === activeColor.toLowerCase()
    ) || VESPER_PALETTE[0];

  return (
    <footer
      aria-label="Studio Status Bar"
      className="h-8 w-full bg-[#151E2D] border-t border-[#243247] px-4 flex items-center justify-between gap-4 text-[11px] text-[#A4B0C1] select-none shrink-0 z-30 overflow-x-auto"
    >
      {/* Left: Camera & Hand Detection Status */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="flex items-center gap-1.5">
          {isCameraActive ? (
            <>
              <Camera className="w-3 h-3 text-[#38A169]" />
              <span className="text-[#F0F2F6]">Camera: Active</span>
            </>
          ) : (
            <>
              <CameraOff className="w-3 h-3 text-[#718096]" />
              <span className="text-[#718096]">Camera: Off</span>
            </>
          )}
        </div>

        <span aria-hidden="true" className="text-[#243247]">
          ·
        </span>

        <div className="flex items-center gap-1.5">
          <Hand
            className={`w-3 h-3 ${
              trackingStatus.hasHand ? 'text-[#D5B879]' : 'text-[#718096]'
            }`}
          />
          <span>
            Hand:{' '}
            {!isCameraActive
              ? 'Standby'
              : trackingStatus.hasHand
                ? trackingStatus.gesture === GestureType.DRAW
                  ? 'Drawing'
                  : trackingStatus.gesture === GestureType.PINCH
                    ? 'Pinching'
                    : 'Detected (Paused)'
                : 'Not Detected'}
          </span>
        </div>

        <span aria-hidden="true" className="text-[#243247]">
          ·
        </span>

        <div className="font-mono tabular-nums">
          <span>Confidence: {confidencePct}</span>
        </div>
      </div>

      {/* Right: Selected Tool, Brush Size, Selected Color & Stroke Count */}
      <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
        <div className="flex items-center gap-1.5">
          {activeTool === ToolType.ERASER ? (
            <Eraser className="w-3 h-3 text-[#D5B879]" />
          ) : (
            <Brush className="w-3 h-3 text-[#D5B879]" />
          )}
          <span className="text-[#F0F2F6] font-medium">
            {activeTool === ToolType.ERASER ? 'Eraser' : 'Brush'}
          </span>
          <span className="font-mono tabular-nums text-[#A4B0C1]">
            ({activeSize}px)
          </span>
        </div>

        <span aria-hidden="true" className="text-[#243247]">
          ·
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-xs border border-[#F0F2F6]/40"
            style={{ backgroundColor: colorInfo.hex }}
          />
          <span className="text-[#F0F2F6]">{colorInfo.name}</span>
        </div>

        <span aria-hidden="true" className="text-[#243247]">
          ·
        </span>

        <div className="flex items-center gap-1 font-mono tabular-nums">
          <Layers className="w-3 h-3 text-[#718096]" />
          <span>{strokeCount} strokes</span>
        </div>
      </div>
    </footer>
  );
};
