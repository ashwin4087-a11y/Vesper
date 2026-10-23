import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Keyboard } from 'lucide-react';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { DrawingCanvas } from './components/canvas/DrawingCanvas';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { TopBar } from './components/layout/TopBar';
import { GestureGuide } from './components/onboarding/GestureGuide';
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { Button } from './components/ui/Button';
import { Dialog } from './components/ui/Dialog';
import { useCamera } from './hooks/useCamera';
import { useDrawing } from './hooks/useDrawing';
import { useHandTracking } from './hooks/useHandTracking';
import { ToolType, VESPER_PALETTE } from './types/drawing';

export default function App() {
  const [inStudio, setInStudio] = useState<boolean>(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState<boolean>(false);
  const [guideDialogOpen, setGuideDialogOpen] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<boolean>(false);

  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    videoRef,
    cameraState,
    errorMessage: cameraError,
    startCamera,
    stopCamera,
    restartCamera,
  } = useCamera();

  const {
    engineRef,
    settings,
    activeSize,
    artworkTitle,
    setArtworkTitle,
    canUndo,
    canRedo,
    strokeCount,
    setTool,
    setColor,
    setBrushSize,
    setOpacity,
    setSmoothing,
    setPinchThreshold,
    toggleShowLandmarks,
    togglePinchColorCycle,
    undo,
    redo,
    clearCanvas,
    exportArtwork,
  } = useDrawing();

  const {
    latestFrameRef,
    status: trackingStatus,
    disposeTracking,
    retryModelLoad,
  } = useHandTracking({
    videoRef,
    overlayCanvasRef,
    cameraState,
    pinchThreshold: settings.pinchThreshold,
    showLandmarks: settings.showLandmarks,
  });

  // Automatically collapse right panel on narrow tablet/mobile screens on initial studio entry
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsRightPanelOpen(false);
    }
  }, []);

  const handleEnterStudio = useCallback(
    (autoStartCamera: boolean = false) => {
      setInStudio(true);
      if (autoStartCamera) {
        startCamera();
      }
    },
    [startCamera]
  );

  // When exiting the studio: stop video stream, release media tracks, dispose tracking resources, preserve artwork
  const handleExitStudio = useCallback(() => {
    stopCamera();
    disposeTracking();
    setInStudio(false);
  }, [stopCamera, disposeTracking]);

  const handleSaveArtwork = useCallback(() => {
    const ok = exportArtwork();
    if (ok) {
      setExportNotice(true);
      window.setTimeout(() => setExportNotice(false), 2200);
    }
  }, [exportArtwork]);

  // Studio Keyboard Shortcuts
  useEffect(() => {
    if (!inStudio) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();
      if (key === 'b') {
        setTool(ToolType.BRUSH);
      } else if (key === 'e') {
        setTool(ToolType.ERASER);
      } else if (key === 'l') {
        toggleShowLandmarks();
      } else if (e.key === '[') {
        setBrushSize(activeSize - 3);
      } else if (e.key === ']') {
        setBrushSize(activeSize + 3);
      } else if (e.key === '?') {
        setGuideDialogOpen((prev) => !prev);
      } else if (/^[1-8]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (VESPER_PALETTE[idx]) {
          setColor(VESPER_PALETTE[idx].hex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    inStudio,
    activeSize,
    undo,
    redo,
    setTool,
    setColor,
    setBrushSize,
    toggleShowLandmarks,
  ]);

  if (!inStudio) {
    return <WelcomeScreen onEnterStudio={handleEnterStudio} />;
  }

  return (
    <div className="h-screen w-screen bg-[#0B1220] text-[#F0F2F6] flex flex-col overflow-hidden select-none">
      {/* Top Studio Navigation */}
      <TopBar
        artworkTitle={artworkTitle}
        cameraState={cameraState}
        isRightPanelOpen={isRightPanelOpen}
        onChangeArtworkTitle={setArtworkTitle}
        onSaveArtwork={handleSaveArtwork}
        onOpenSettings={() => setSettingsDialogOpen(true)}
        onOpenGuide={() => setGuideDialogOpen(true)}
        onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
        onExitStudio={handleExitStudio}
      />

      {/* Export Confirmation Toast */}
      {exportNotice && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#151E2D] border border-[#D5B879] px-3.5 py-2 text-xs font-medium text-[#F0F2F6] shadow-xl">
          <Check className="w-4 h-4 text-[#D5B879]" />
          <span>Artwork exported as high-resolution PNG</span>
        </div>
      )}

      {/* Main Studio Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Toolbar */}
        <CanvasToolbar
          activeTool={settings.tool}
          activeSize={activeSize}
          activeColor={settings.color}
          canUndo={canUndo}
          canRedo={canRedo}
          strokeCount={strokeCount}
          onSelectTool={setTool}
          onChangeSize={setBrushSize}
          onUndo={undo}
          onRedo={redo}
          onRequestClear={() => setClearDialogOpen(true)}
        />

        {/* Center Warm Ivory Drawing Canvas with Top Gesture Palette Dock */}
        <DrawingCanvas
          engineRef={engineRef}
          settings={settings}
          activeSize={activeSize}
          cameraState={cameraState}
          latestTrackingFrameRef={latestFrameRef}
          onSelectColor={setColor}
          onSelectTool={setTool}
        />

        {/* Right Panel: Camera Preview, Palette, Brush Settings & Gesture Guide */}
        <Sidebar
          isOpen={isRightPanelOpen}
          videoRef={videoRef}
          overlayCanvasRef={overlayCanvasRef}
          cameraState={cameraState}
          cameraError={cameraError}
          trackingStatus={trackingStatus}
          settings={settings}
          activeSize={activeSize}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onRestartCamera={restartCamera}
          onToggleLandmarks={toggleShowLandmarks}
          onRetryModel={retryModelLoad}
          onSelectColor={setColor}
          onChangeSize={setBrushSize}
          onChangeOpacity={setOpacity}
          onChangeSmoothing={setSmoothing}
        />
      </div>

      {/* Bottom Status Bar */}
      <StatusBar
        cameraState={cameraState}
        trackingStatus={trackingStatus}
        activeTool={settings.tool}
        activeSize={activeSize}
        activeColor={settings.color}
        strokeCount={strokeCount}
      />

      {/* Clear Canvas Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        title="Clear Canvas Artwork?"
        description="This action will permanently remove all current strokes from your warm ivory canvas. This cannot be undone."
      >
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg bg-[#0B1220] border border-[#243247] p-3.5 text-xs text-[#A4B0C1]">
            <AlertTriangle className="w-4 h-4 text-[#E53E3E] shrink-0 mt-0.5" />
            <span>
              You currently have{' '}
              <strong className="text-[#F0F2F6] font-mono tabular-nums">
                {strokeCount}
              </strong>{' '}
              recorded stroke{strokeCount === 1 ? '' : 's'} on "{artworkTitle}".
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setClearDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={() => {
                clearCanvas();
                setClearDialogOpen(false);
              }}
            >
              Clear Canvas
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Studio Settings & Calibration Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        title="Studio & Tracking Settings"
        description="Calibrate gesture thresholds, landmark overlays, and keyboard controls."
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-5 text-xs">
          {/* Pinch Distance Threshold */}
          <div className="space-y-2 rounded-lg bg-[#0B1220] border border-[#243247] p-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="vesper-pinch-slider"
                className="font-semibold text-[#F0F2F6]"
              >
                Pinch Sensitivity Threshold
              </label>
              <span className="font-mono text-[#D5B879] tabular-nums">
                {settings.pinchThreshold.toFixed(3)}
              </span>
            </div>
            <p className="text-[#A4B0C1] leading-relaxed">
              Normalized 3D distance between Thumb Tip (4) and Index Fingertip
              (8) for instant pinch selection on the top palette bar.
            </p>
            <input
              id="vesper-pinch-slider"
              type="range"
              min={28}
              max={80}
              value={Math.round(settings.pinchThreshold * 1000)}
              onChange={(e) => setPinchThreshold(Number(e.target.value) / 1000)}
              className="w-full vesper-slider mt-1"
            />
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2.5 rounded-lg bg-[#0B1220] border border-[#243247] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-[#F0F2F6]">
                  Top Palette Bar Hand Selection
                </div>
                <div className="text-[#A4B0C1] mt-0.5">
                  Hover or pinch with your hand cursor over the top palette bar
                  to choose colors and tools without mid-drawing changes.
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                active={settings.enablePinchColorCycle}
                onClick={togglePinchColorCycle}
              >
                {settings.enablePinchColorCycle ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="h-px bg-[#243247] my-2" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-[#F0F2F6]">
                  Render Hand Landmarks Overlay
                </div>
                <div className="text-[#A4B0C1] mt-0.5">
                  Display the 21-point MediaPipe skeleton over the mirrored
                  webcam preview.
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                active={settings.showLandmarks}
                onClick={toggleShowLandmarks}
              >
                {settings.showLandmarks ? 'Visible' : 'Hidden'}
              </Button>
            </div>
          </div>

          {/* Keyboard Shortcuts Summary */}
          <div className="rounded-lg bg-[#0B1220] border border-[#243247] p-4 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-[#F0F2F6]">
              <Keyboard className="w-4 h-4 text-[#D5B879]" />
              <span>Keyboard Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[#A4B0C1]">
              <div className="flex justify-between">
                <span>Brush / Eraser</span>
                <kbd className="font-mono text-[#D5B879]">B / E</kbd>
              </div>
              <div className="flex justify-between">
                <span>Brush Caliber</span>
                <kbd className="font-mono text-[#D5B879]">[ / ]</kbd>
              </div>
              <div className="flex justify-between">
                <span>Select Pigment</span>
                <kbd className="font-mono text-[#D5B879]">1 – 8</kbd>
              </div>
              <div className="flex justify-between">
                <span>Landmark Overlay</span>
                <kbd className="font-mono text-[#D5B879]">L</kbd>
              </div>
              <div className="flex justify-between">
                <span>Undo Stroke</span>
                <kbd className="font-mono text-[#D5B879]">⌘Z / Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span>Redo Stroke</span>
                <kbd className="font-mono text-[#D5B879]">⇧⌘Z / Ctrl+Y</kbd>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              size="md"
              onClick={() => setSettingsDialogOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Studio Onboarding & Gesture Guide Dialog */}
      <Dialog
        open={guideDialogOpen}
        onClose={() => setGuideDialogOpen(false)}
        title="Studio Gesture Guide"
        description="Follow these five steps to draw effortlessly in the air."
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-5">
          <ol className="space-y-2 text-xs text-[#A4B0C1] list-decimal list-inside bg-[#0B1220] border border-[#243247] rounded-lg p-4">
            <li>
              <strong className="text-[#F0F2F6]">Allow camera access</strong>{' '}
              using the Enable Camera button in the right panel.
            </li>
            <li>
              <strong className="text-[#F0F2F6]">
                Raise your index finger
              </strong>{' '}
              while keeping your middle, ring, and pinky fingers folded.
            </li>
            <li>
              <strong className="text-[#F0F2F6]">
                Move your finger to draw
              </strong>{' '}
              smooth continuous strokes across the warm ivory canvas.
            </li>
            <li>
              <strong className="text-[#F0F2F6]">
                Lower your finger or open your palm
              </strong>{' '}
              to pause cleanly between separate strokes.
            </li>
            <li>
              <strong className="text-[#F0F2F6]">
                Pick colors from the top palette bar
              </strong>{' '}
              by moving your hand cursor to the top of the canvas and holding
              over any color swatch (or clicking with your mouse).
            </li>
          </ol>

          <GestureGuide activeGesture={trackingStatus.gesture} />

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              size="md"
              onClick={() => setGuideDialogOpen(false)}
            >
              Back to Canvas
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
