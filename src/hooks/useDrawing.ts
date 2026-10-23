import { useCallback, useRef, useState } from 'react';
import { DrawingEngine } from '../lib/drawingEngine';
import {
  DrawingSettings,
  ToolType,
  VESPER_PALETTE,
} from '../types/drawing';

export function useDrawing() {
  const [settings, setSettings] = useState<DrawingSettings>({
    tool: ToolType.BRUSH,
    color: VESPER_PALETTE[1].hex, // Midnight Blue (#0B1220) ink on warm Ivory (#F7F5F0) canvas
    brushSize: 8,
    eraserSize: 24,
    opacity: 1,
    smoothing: 0.55,
    pinchThreshold: 0.048,
    showLandmarks: true,
    enablePinchColorCycle: true,
  });

  // Let's initialize default drawing color to Midnight Blue (#0B1220) so drawing on Ivory (#F7F5F0) is immediately crisp and visible, or Champagne Gold (#D5B879)
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
    setSettings((prev) => ({ ...prev, tool }));
  }, []);

  const setColor = useCallback((color: string) => {
    setSettings((prev) => ({
      ...prev,
      color,
      tool: ToolType.BRUSH, // Automatically switch to brush when picking a color
    }));
  }, []);

  const cycleNextColor = useCallback(() => {
    setSettings((prev) => {
      const idx = VESPER_PALETTE.findIndex(
        (c) => c.hex.toLowerCase() === prev.color.toLowerCase()
      );
      const nextIdx = (idx + 1) % VESPER_PALETTE.length;
      return {
        ...prev,
        color: VESPER_PALETTE[nextIdx].hex,
        tool: ToolType.BRUSH,
      };
    });
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
      smoothing: Math.max(0, Math.min(0.95, smoothing)),
    }));
  }, []);

  const setPinchThreshold = useCallback((pinchThreshold: number) => {
    setSettings((prev) => ({
      ...prev,
      pinchThreshold: Math.max(0.025, Math.min(0.085, pinchThreshold)),
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

  const undo = useCallback(() => {
    engineRef.current?.undo();
  }, []);

  const redo = useCallback(() => {
    engineRef.current?.redo();
  }, []);

  const clearCanvas = useCallback(() => {
    engineRef.current?.clear();
  }, []);

  const exportArtwork = useCallback(() => {
    return engineRef.current?.exportPNG(artworkTitle) ?? false;
  }, [artworkTitle]);

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
    cycleNextColor,
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
  };
}
