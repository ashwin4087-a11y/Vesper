import React from 'react';
import { TrackingStatusSummary } from '../../hooks/useHandTracking';
import { DrawingSettings, ToolType } from '../../types/drawing';
import { CameraState } from '../../types/hand';
import { CameraPreview } from '../camera/CameraPreview';
import { BrushSettings } from '../canvas/BrushSettings';
import { ColorPalette } from '../canvas/ColorPalette';
import { GestureGuide } from '../onboarding/GestureGuide';

export interface SidebarProps {
  isOpen: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraState: CameraState;
  cameraError: string | null;
  trackingStatus: TrackingStatusSummary;
  settings: DrawingSettings;
  activeSize: number;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onRestartCamera: () => void;
  onToggleLandmarks: () => void;
  onRetryModel: () => void;
  onSelectColor: (hex: string) => void;
  onChangeSize: (size: number) => void;
  onChangeOpacity: (opacity: number) => void;
  onChangeSmoothing: (smoothing: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  videoRef,
  overlayCanvasRef,
  cameraState,
  cameraError,
  trackingStatus,
  settings,
  activeSize,
  onStartCamera,
  onStopCamera,
  onRestartCamera,
  onToggleLandmarks,
  onRetryModel,
  onSelectColor,
  onChangeSize,
  onChangeOpacity,
  onChangeSmoothing,
}) => {
  return (
    <aside
      aria-label="Studio Inspector & Camera Panel"
      className={`bg-[#151E2D] border-l border-[#243247] transition-all duration-200 overflow-y-auto shrink-0 z-20 ${
        isOpen
          ? 'w-72 sm:w-80 p-4 space-y-6 block'
          : 'w-0 p-0 overflow-hidden border-l-0'
      }`}
    >
      {/* Keep CameraPreview mounted so the <video> ref stays active even if sidebar is collapsed */}
      <div className={isOpen ? 'space-y-6' : 'sr-only'}>
        {/* 1. Webcam Preview & Tracking Status */}
        <section aria-label="Webcam & Hand Tracking">
          <CameraPreview
            videoRef={videoRef}
            overlayCanvasRef={overlayCanvasRef}
            cameraState={cameraState}
            cameraError={cameraError}
            trackingStatus={trackingStatus}
            showLandmarks={settings.showLandmarks}
            onStartCamera={onStartCamera}
            onStopCamera={onStopCamera}
            onRestartCamera={onRestartCamera}
            onToggleLandmarks={onToggleLandmarks}
            onRetryModel={onRetryModel}
          />
        </section>

        <div className="h-px bg-[#243247]" />

        {/* 2. Curated VESPER Color Palette */}
        <section aria-label="Color Palette">
          <ColorPalette
            selectedColor={settings.color}
            activeTool={settings.tool}
            onSelectColor={onSelectColor}
          />
        </section>

        <div className="h-px bg-[#243247]" />

        {/* 3. Brush & Eraser Settings */}
        <section aria-label="Brush Settings">
          <BrushSettings
            tool={settings.tool}
            color={settings.color}
            size={activeSize}
            opacity={settings.opacity}
            smoothing={settings.smoothing}
            onChangeSize={onChangeSize}
            onChangeOpacity={onChangeOpacity}
            onChangeSmoothing={onChangeSmoothing}
          />
        </section>

        <div className="h-px bg-[#243247]" />

        {/* 4. Compact Gesture Reference Guide */}
        <section aria-label="Gesture Guide">
          <GestureGuide
            activeGesture={trackingStatus.gesture}
            compact={true}
          />
        </section>
      </div>
    </aside>
  );
};
