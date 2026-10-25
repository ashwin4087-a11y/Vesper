import { useCallback, useRef, useState } from 'react';
import { DrawingEngine } from '../lib/drawingEngine';
import {
  BRUSH_PRESETS,
  CANVAS_BACKGROUNDS,
  CanvasBackground,
  DrawingSettings,
  ExportSettings,
  ToolType,
  VESPER_PALETTE,
} from '../types/drawing';

export function useDrawing() {
  const [settings, setSettings] = useState<DrawingSettings>({
    tool: ToolType.BRUSH,
    color: VESPER_PALETTE[1].hex, // Midnight Blue (#0B1220) default ink
    brushSize: 8,
    eraserSize: 28,
    opacity: 1,
    smoothing: 0.55,
    pinchThreshold: 0.048,
    showLandmarks: true,
    enablePinchColorCycle: true,
    enableGestureEraser: true,
    activePresetId: 'studio-brush',
    background: CANVAS_BACKGROUNDS[0], // Warm Ivory Paper
  });

  const [artworkTitle, setArtworkTitle] = useState<string>('Untitled Study 01');
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [strokeCount, setStrokeCount] = useState<number>(0);

  const engineRef = useRef<DrawingEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new DrawingEngine({
      onHistoryChange: (u, r, count) => {
        setCanUndo(u);
        setCanRedo(r);
        setStrokeCount(count);
      },
    });
  }

  const setTool = useCallback((tool: ToolType) => {
    setSettings((prev) => ({
      ...prev,
      tool,
      activePresetId: tool === ToolType.ERASER ? 'eraser' : prev.activePresetId,
    }));
  }, []);

  const setColor = useCallback((color: string) => {
    setSettings((prev) => ({
      ...prev,
      color,
      tool: ToolType.BRUSH,
    }));
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    const preset = BRUSH_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSettings((prev) => ({
      ...prev,
      activePresetId: preset.id,
      tool: preset.tool,
      brushSize: preset.tool === ToolType.BRUSH ? preset.size : prev.brushSize,
      eraserSize: preset.tool === ToolType.ERASER ? preset.size : prev.eraserSize,
      opacity: preset.opacity,
      smoothing: preset.smoothing,
    }));
  }, []);

  const setBrushSize = useCallback((size: number) => {
    const clamped = Math.max(1, Math.min(64, size));
    setSettings((prev) =>
      prev.tool === ToolType.ERASER
        ? { ...prev, eraserSize: clamped }
        : { ...prev, brushSize: clamped }
    );
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    setSettings((prev) => ({
      ...prev,
      opacity: Math.max(0.1, Math.min(1, opacity)),
    }));
  }, []);

  const setSmoothing = useCallback((smoothing: number) => {
    setSettings((prev) => ({
      ...prev,
      smoothing: Math.max(0.1, Math.min(0.95, smoothing)),
    }));
  }, []);

  const setPinchThreshold = useCallback((pinchThreshold: number) => {
    setSettings((prev) => ({
      ...prev,
      pinchThreshold: Math.max(0.025, Math.min(0.085, pinchThreshold)),
    }));
  }, []);

  const setBackground = useCallback((background: CanvasBackground) => {
    setSettings((prev) => ({
      ...prev,
      background,
    }));
  }, []);

  const toggleShowLandmarks = useCallback(() => {
    setSettings((prev) => ({ ...prev, showLandmarks: !prev.showLandmarks }));
  }, []);

  const togglePinchColorCycle = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      enablePinchColorCycle: !prev.enablePinchColorCycle,
    }));
  }, []);

  const toggleGestureEraser = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      enableGestureEraser: !prev.enableGestureEraser,
    }));
  }, []);

  const undo = useCallback(() => {
    engineRef.current?.undo();
  }, []);

  const redo = useCallback(() => {
    engineRef.current?.redo();
  }, []);

  const clearCanvas = useCallback(() => {
    engineRef.current?.clear();
  }, []);

  const exportArtwork = useCallback(
    (exportSettings: ExportSettings) => {
      return (
        engineRef.current?.exportPNG(exportSettings, settings.background) ??
        false
      );
    },
    [settings.background]
  );

  const activeSize =
    settings.tool === ToolType.ERASER
      ? settings.eraserSize
      : settings.brushSize;

  return {
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
  };
}
