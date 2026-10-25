import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Download, LogOut } from 'lucide-react';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { DrawingCanvas } from './components/canvas/DrawingCanvas';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { TopBar } from './components/layout/TopBar';
import { GestureGuide } from './components/onboarding/GestureGuide';
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { Button } from './components/ui/Button';
import { Dialog } from './components/ui/Dialog';
import { ExportDialog } from './components/ui/ExportDialog';
import { useCamera } from './hooks/useCamera';
import { useDrawing } from './hooks/useDrawing';
import { useHandTracking } from './hooks/useHandTracking';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ExportSettings, ToolType } from './types/drawing';
import { CameraState } from './types/hand';

export default function App() {
  const [inStudio, setInStudio] = useState<boolean>(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState<boolean>(false);
  const [guideDialogOpen, setGuideDialogOpen] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [confirmExitDialogOpen, setConfirmExitDialogOpen] = useState<boolean>(false);
  const [exportSuccessNotice, setExportSuccessNotice] = useState<string | null>(null);

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
    isDirty,
    setTool,
    setColor,
    applyPreset,
    setBrushSize,
    setOpacity,
    setSmoothing,
    setPinchThreshold,
    setBackground,
    toggleShowLandmarks,
    togglePinchColorCycle,
    toggleGestureEraser,
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
    enableGestureEraser: settings.enableGestureEraser,
  });

  // Automatically collapse right panel on narrow tablet/mobile screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsRightPanelOpen(false);
    }
  }, []);

  // Unsaved artwork protection: prompt before tab close if artwork is modified
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && strokeCount > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, strokeCount]);

  const handleEnterStudio = useCallback(
    (autoStartCamera: boolean = false) => {
      setInStudio(true);
      if (autoStartCamera) {
        startCamera();
      }
    },
    [startCamera]
  );

  const confirmExitStudio = useCallback(() => {
    stopCamera();
    disposeTracking();
    setConfirmExitDialogOpen(false);
    setInStudio(false);
  }, [stopCamera, disposeTracking]);

  // When exiting studio: verify if unsaved artwork exists before navigating
  const handleExitStudio = useCallback(() => {
    if (isDirty && strokeCount > 0) {
      setConfirmExitDialogOpen(true);
    } else {
      confirmExitStudio();
    }
  }, [isDirty, strokeCount, confirmExitStudio]);

  const handleExportConfirm = useCallback(
    (exportSettings: ExportSettings) => {
      const ok = exportArtwork(exportSettings);
      if (ok) {
        setExportSuccessNotice(
          `Exported "${exportSettings.title}.png" (${exportSettings.scale}x ${
            exportSettings.transparentBackground ? 'Transparent' : settings.background.name
          })`
        );
        window.setTimeout(() => setExportSuccessNotice(null), 3000);
      }
    },
    [exportArtwork, settings.background]
  );

  const handleToggleCamera = useCallback(() => {
    if (cameraState === CameraState.ACTIVE) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [cameraState, startCamera, stopCamera]);

  const handleCloseAllDialogs = useCallback(() => {
    setClearDialogOpen(false);
    setSettingsDialogOpen(false);
    setGuideDialogOpen(false);
    setExportDialogOpen(false);
    setConfirmExitDialogOpen(false);
  }, []);

  // Dedicated Keyboard Shortcuts Hook (B, E, [, ], Ctrl+Z, Ctrl+Shift+Z, Space, Esc, 1-8, ?)
  useKeyboardShortcuts({
    enabled: inStudio,
    activeSize,
    cameraState,
    onSelectTool: setTool,
    onSelectColor: setColor,
    onChangeSize: setBrushSize,
    onUndo: undo,
    onRedo: redo,
    onToggleCamera: handleToggleCamera,
    onOpenExportDialog: () => setExportDialogOpen(true),
    onToggleGuide: () => setGuideDialogOpen((prev) => !prev),
    onToggleLandmarks: toggleShowLandmarks,
    onEscape: handleCloseAllDialogs,
  });

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
        background={settings.background}
        onChangeArtworkTitle={setArtworkTitle}
        onSelectBackground={setBackground}
        onOpenExportDialog={() => setExportDialogOpen(true)}
        onOpenSettings={() => setSettingsDialogOpen(true)}
        onOpenGuide={() => setGuideDialogOpen(true)}
        onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
        onExitStudio={handleExitStudio}
      />

      {/* Export Confirmation Notification */}
      {exportSuccessNotice && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#151E2D] border border-[#D5B879] px-4 py-2.5 text-xs font-medium text-[#F0F2F6] shadow-2xl">
          <Check className="w-4 h-4 text-[#D5B879]" />
          <span>{exportSuccessNotice}</span>
        </div>
      )}

      {/* Main Studio Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Vertical Instrument Toolbar */}
        <CanvasToolbar
          activeTool={settings.tool}
          activeSize={activeSize}
          activeColor={settings.color}
          activePresetId={settings.activePresetId}
          canUndo={canUndo}
          canRedo={canRedo}
          strokeCount={strokeCount}
          onSelectTool={setTool}
          onApplyPreset={applyPreset}
          onChangeSize={setBrushSize}
          onUndo={undo}
          onRedo={redo}
          onRequestClear={() => setClearDialogOpen(true)}
        />

        {/* Center Spatial Drawing Canvas */}
        <DrawingCanvas
          engineRef={engineRef}
          settings={settings}
          activeSize={activeSize}
          cameraState={cameraState}
          latestTrackingFrameRef={latestFrameRef}
          onSelectColor={setColor}
          onSelectTool={setTool}
        />

        {/* Right Panel: Optical Feed, Color Pigments, Instrument Settings */}
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
          onApplyPreset={applyPreset}
          onChangeSize={setBrushSize}
          onChangeOpacity={setOpacity}
          onChangeSmoothing={setSmoothing}
          onToggleGestureEraser={toggleGestureEraser}
        />
      </div>

      {/* Bottom Status Telemetry Bar */}
      <StatusBar
        cameraState={cameraState}
        trackingStatus={trackingStatus}
        activeTool={settings.tool}
        activeSize={activeSize}
        activeColor={settings.color}
        strokeCount={strokeCount}
      />

      {/* Export Artwork Modal */}
      <ExportDialog
        open={exportDialogOpen}
        artworkTitle={artworkTitle}
        background={settings.background}
        strokeCount={strokeCount}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExportConfirm}
      />

      {/* Clear Canvas Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        title="Clear Canvas Artwork?"
        description="This will permanently delete all strokes on the active canvas. This cannot be undone."
      >
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg bg-[#0B1220] border border-[#243247] p-3.5 text-xs text-[#A4B0C1]">
            <AlertTriangle className="w-4 h-4 text-[#E53E3E] shrink-0 mt-0.5" />
            <span>
              You currently have{' '}
              <strong className="text-[#F0F2F6] font-mono tabular-nums">
                {strokeCount}
              </strong>{' '}
              stroke{strokeCount === 1 ? '' : 's'} on "{artworkTitle}".
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

      {/* Unsaved Work Exit Protection Dialog */}
      <Dialog
        open={confirmExitDialogOpen}
        onClose={() => setConfirmExitDialogOpen(false)}
        title="Unsaved Artwork in Progress"
        description="You have created strokes that haven't been exported yet. Exiting to the welcome screen will release your session."
      >
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg bg-[#0B1220] border border-[#D5B879]/40 p-3.5 text-xs text-[#A4B0C1]">
            <AlertTriangle className="w-4 h-4 text-[#D5B879] shrink-0 mt-0.5" />
            <span>
              Your artwork <strong className="text-[#F0F2F6]">"{artworkTitle}"</strong> contains{' '}
              <strong className="text-[#F0F2F6] font-mono tabular-nums">{strokeCount}</strong> unsaved stroke{strokeCount === 1 ? '' : 's'}.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setConfirmExitDialogOpen(false)}
            >
              Keep Drawing
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setConfirmExitDialogOpen(false);
                setExportDialogOpen(true);
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export First</span>
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={confirmExitStudio}
              className="text-[#E53E3E] hover:text-[#E53E3E] hover:bg-[#E53E3E]/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Anyway</span>
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Studio Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        title="Studio & Gesture Settings"
        description="Calibrate optical tracking thresholds and input behavior."
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4 text-xs">
          {/* Pinch Sensitivity Threshold */}
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
              3D distance between Thumb (Landmark 4) and Index Fingertip (Landmark 8)
              for triggering instant dock selection.
            </p>
            <input
              id="vesper-pinch-slider"
              type="range"
              min={25}
              max={80}
              value={Math.round(settings.pinchThreshold * 1000)}
              onChange={(e) => setPinchThreshold(Number(e.target.value) / 1000)}
              className="w-full vesper-slider mt-1"
            />
          </div>

          {/* Feature Toggles */}
          <div className="space-y-2.5 rounded-lg bg-[#0B1220] border border-[#243247] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-[#F0F2F6]">
                  Top Gesture Dock Selection
                </div>
                <div className="text-[#A4B0C1] mt-0.5">
                  Hover or pinch over the top palette bar to select pigments and tools
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
                  V-Sign Gesture Eraser
                </div>
                <div className="text-[#A4B0C1] mt-0.5">
                  Hold 2 fingers raised (Peace sign) to erase strokes without clicking
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                active={settings.enableGestureEraser}
                onClick={toggleGestureEraser}
              >
                {settings.enableGestureEraser ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="h-px bg-[#243247] my-2" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-[#F0F2F6]">
                  Optical Skeleton Overlay
                </div>
                <div className="text-[#A4B0C1] mt-0.5">
                  Display the 21-point MediaPipe mesh over webcam preview
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

      {/* Gesture Guide Dialog */}
      <Dialog
        open={guideDialogOpen}
        onClose={() => setGuideDialogOpen(false)}
        title="Studio Gesture Guide"
        description="Master the spatial postures to create digital art effortlessly."
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          <GestureGuide activeGesture={trackingStatus.gesture} />
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setGuideDialogOpen(false)}
            >
              Back to Studio
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
