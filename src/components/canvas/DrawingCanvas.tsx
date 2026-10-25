import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, Hand, MousePointer2, Sparkles } from 'lucide-react';
import {
  normalizedToCanvasPoint,
  pointerEventToCanvasPoint,
  smoothPointAdaptive,
} from '../../lib/coordinateMapping';
import { DrawingEngine } from '../../lib/drawingEngine';
import {
  DrawingSettings,
  Point,
  ToolType,
  VESPER_PALETTE,
} from '../../types/drawing';
import {
  CameraState,
  GestureType,
  HandTrackingFrame,
} from '../../types/hand';
import { GestureDock } from './GestureDock';
import { renderReticle } from './ReticleRenderer';

export interface DrawingCanvasProps {
  engineRef: React.RefObject<DrawingEngine | null>;
  settings: DrawingSettings;
  activeSize: number;
  cameraState: CameraState;
  latestTrackingFrameRef: React.RefObject<HandTrackingFrame>;
  onSelectColor: (hex: string) => void;
  onSelectTool: (tool: ToolType) => void;
}

const DWELL_DURATION_MS = 500;

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  engineRef,
  settings,
  activeSize,
  cameraState,
  latestTrackingFrameRef,
  onSelectColor,
  onSelectTool,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const artworkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const targetElementsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  const isPointerDrawingRef = useRef<boolean>(false);
  const isGestureDrawingRef = useRef<boolean>(false);
  const isGestureErasingRef = useRef<boolean>(false);
  const smoothedGesturePointRef = useRef<Point | null>(null);
  const pointerPositionRef = useRef<Point | null>(null);

  // Dwell & Pinch target tracking for the On-Canvas Gesture Dock
  const hoveredTargetIdRef = useRef<string | null>(null);
  const hoverStartTimeRef = useRef<number>(0);
  const lastTriggeredTargetIdRef = useRef<string | null>(null);
  const [hoveredTargetUI, setHoveredTargetUI] = useState<{
    id: string | null;
    progress: number;
  }>({ id: null, progress: 0 });

  const [selectionToast, setSelectionToast] = useState<{
    label: string;
    hex?: string;
    timestamp: number;
  } | null>(null);

  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const activeSizeRef = useRef(activeSize);
  activeSizeRef.current = activeSize;

  const onSelectColorRef = useRef(onSelectColor);
  onSelectColorRef.current = onSelectColor;

  const onSelectToolRef = useRef(onSelectTool);
  onSelectToolRef.current = onSelectTool;

  const registerTargetRef = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      if (el) {
        targetElementsRef.current.set(id, el);
      } else {
        targetElementsRef.current.delete(id);
      }
    },
    []
  );

  const triggerDockTarget = useCallback((targetId: string) => {
    if (targetId === 'tool:brush') {
      onSelectToolRef.current(ToolType.BRUSH);
      setSelectionToast({ label: 'Studio Brush', timestamp: Date.now() });
    } else if (targetId === 'tool:eraser') {
      onSelectToolRef.current(ToolType.ERASER);
      setSelectionToast({ label: 'Precision Eraser', timestamp: Date.now() });
    } else if (targetId.startsWith('color:')) {
      const hex = targetId.replace('color:', '');
      const found = VESPER_PALETTE.find(
        (c) => c.hex.toLowerCase() === hex.toLowerCase()
      );
      onSelectColorRef.current(hex);
      setSelectionToast({
        label: found ? found.name : hex,
        hex,
        timestamp: Date.now(),
      });
    }
  }, []);

  // Attach and resize DrawingEngine when container geometry changes
  useEffect(() => {
    const container = containerRef.current;
    const artworkCanvas = artworkCanvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    if (!container || !artworkCanvas || !cursorCanvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(100, Math.floor(rect.width));
      const height = Math.max(100, Math.floor(rect.height));

      setCanvasDimensions({ width, height });

      if (engineRef.current) {
        engineRef.current.attachCanvas(artworkCanvas, width, height);
      }

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      cursorCanvas.width = Math.floor(width * dpr);
      cursorCanvas.height = Math.floor(height * dpr);
      const cursorCtx = cursorCanvas.getContext('2d');
      cursorCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', updateSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [engineRef]);

  // High-performance 60fps RAF loop: processes hand coordinates, state machine strokes, and reticle overlay
  useEffect(() => {
    let rafId: number;

    const renderLoop = () => {
      const cursorCanvas = cursorCanvasRef.current;
      const engine = engineRef.current;
      const container = containerRef.current;

      if (cursorCanvas && engine && container) {
        const containerRect = container.getBoundingClientRect();
        const width = container.clientWidth;
        const height = container.clientHeight;
        const ctx = cursorCanvas.getContext('2d');

        if (ctx && width > 0 && height > 0) {
          ctx.clearRect(0, 0, width, height);

          const frame = latestTrackingFrameRef.current;
          const currentSettings = settingsRef.current;
          const currentSize = activeSizeRef.current;

          if (
            cameraState === CameraState.ACTIVE &&
            frame.hasHand &&
            frame.gestureResult.indexTipMirrored
          ) {
            const targetPoint = normalizedToCanvasPoint(
              frame.gestureResult.indexTipMirrored,
              width,
              height
            );

            const smoothed = smoothPointAdaptive(
              smoothedGesturePointRef.current,
              targetPoint,
              currentSettings.smoothing
            );
            smoothedGesturePointRef.current = smoothed;

            // Viewport client coordinates for Dock hit-testing
            const clientX = containerRect.left + smoothed.x;
            const clientY = containerRect.top + smoothed.y;

            let isInsideDockZone = false;
            let hitTargetId: string | null = null;

            if (dockRef.current && currentSettings.enablePinchColorCycle) {
              const dockRect = dockRef.current.getBoundingClientRect();
              if (
                clientX >= dockRect.left - 12 &&
                clientX <= dockRect.right + 12 &&
                clientY >= dockRect.top - 12 &&
                clientY <= dockRect.bottom + 14
              ) {
                isInsideDockZone = true;

                targetElementsRef.current.forEach((btnEl, id) => {
                  const r = btnEl.getBoundingClientRect();
                  if (
                    clientX >= r.left - 4 &&
                    clientX <= r.right + 4 &&
                    clientY >= r.top - 4 &&
                    clientY <= r.bottom + 4
                  ) {
                    hitTargetId = id;
                  }
                });
              }
            }

            if (isInsideDockZone) {
              // Immediately terminate any active stroke when hand enters the top dock
              if (isGestureDrawingRef.current || isGestureErasingRef.current) {
                isGestureDrawingRef.current = false;
                isGestureErasingRef.current = false;
                engine.endStroke();
              }

              const now = performance.now();
              if (hitTargetId) {
                if (hoveredTargetIdRef.current !== hitTargetId) {
                  hoveredTargetIdRef.current = hitTargetId;
                  hoverStartTimeRef.current = now;
                  lastTriggeredTargetIdRef.current = null;
                  setHoveredTargetUI({ id: hitTargetId, progress: 0.05 });
                } else {
                  const elapsed = now - hoverStartTimeRef.current;
                  const progress = Math.min(1, elapsed / DWELL_DURATION_MS);
                  setHoveredTargetUI({ id: hitTargetId, progress });

                  // Confirm selection on dwell completion or deliberate pinch
                  if (
                    (progress >= 1 || frame.gestureResult.isPinching) &&
                    lastTriggeredTargetIdRef.current !== hitTargetId
                  ) {
                    lastTriggeredTargetIdRef.current = hitTargetId;
                    triggerDockTarget(hitTargetId);
                  }
                }
              } else if (hoveredTargetIdRef.current !== null) {
                hoveredTargetIdRef.current = null;
                lastTriggeredTargetIdRef.current = null;
                setHoveredTargetUI({ id: null, progress: 0 });
              }
            } else {
              // Hand is over canvas drawing area
              if (hoveredTargetIdRef.current !== null) {
                hoveredTargetIdRef.current = null;
                lastTriggeredTargetIdRef.current = null;
                setHoveredTargetUI({ id: null, progress: 0 });
              }

              const isGesturePaused = frame.gestureResult.isPaused;
              const isGestureErasing = frame.gestureResult.isErasing && !isGesturePaused;
              const isGestureDrawing = frame.gestureResult.isDrawing && !isGestureErasing && !isGesturePaused;

              if (!isPointerDrawingRef.current) {
                if (isGesturePaused) {
                  // Palm Pause active: terminate current stroke immediately
                  if (isGestureDrawingRef.current || isGestureErasingRef.current) {
                    isGestureDrawingRef.current = false;
                    isGestureErasingRef.current = false;
                    engine.endStroke();
                  }
                } else if (isGestureErasing) {
                  // V-sign Eraser active
                  if (!isGestureErasingRef.current) {
                    if (isGestureDrawingRef.current) {
                      isGestureDrawingRef.current = false;
                      engine.endStroke();
                    }
                    isGestureErasingRef.current = true;
                    engine.startStroke(smoothed, {
                      color: '#000000',
                      size: currentSettings.eraserSize,
                      opacity: 1,
                      smoothing: currentSettings.smoothing,
                      tool: ToolType.ERASER,
                      presetId: 'eraser',
                    });
                  } else {
                    engine.addPointToStroke(smoothed);
                  }
                } else if (isGestureDrawing) {
                  // Normal brush drawing active
                  if (!isGestureDrawingRef.current) {
                    if (isGestureErasingRef.current) {
                      isGestureErasingRef.current = false;
                      engine.endStroke();
                    }
                    isGestureDrawingRef.current = true;
                    engine.startStroke(smoothed, {
                      color: currentSettings.color,
                      size: currentSize,
                      opacity: currentSettings.opacity,
                      smoothing: currentSettings.smoothing,
                      tool: currentSettings.tool,
                      presetId: currentSettings.activePresetId,
                    });
                  } else {
                    engine.addPointToStroke(smoothed);
                  }
                } else {
                  // Not drawing or erasing
                  if (isGestureDrawingRef.current || isGestureErasingRef.current) {
                    isGestureDrawingRef.current = false;
                    isGestureErasingRef.current = false;
                    engine.endStroke();
                  }
                }
              }
            }

            // Render live spatial hand reticle
            renderReticle({
              ctx,
              x: smoothed.x,
              y: smoothed.y,
              size: frame.gestureResult.isErasing
                ? currentSettings.eraserSize
                : currentSize,
              color: currentSettings.color,
              tool: currentSettings.tool,
              gesture: isInsideDockZone
                ? GestureType.HOVER
                : frame.gestureResult.gesture,
              isGestureErasing: frame.gestureResult.isErasing,
              isPaused: frame.gestureResult.isPaused,
            });
          } else {
            // Hand out of frame
            if (isGestureDrawingRef.current || isGestureErasingRef.current) {
              isGestureDrawingRef.current = false;
              isGestureErasingRef.current = false;
              smoothedGesturePointRef.current = null;
              engine.endStroke();
            }
            if (hoveredTargetIdRef.current !== null) {
              hoveredTargetIdRef.current = null;
              lastTriggeredTargetIdRef.current = null;
              setHoveredTargetUI({ id: null, progress: 0 });
            }

            // Mouse pointer fallback reticle
            if (pointerPositionRef.current) {
              renderReticle({
                ctx,
                x: pointerPositionRef.current.x,
                y: pointerPositionRef.current.y,
                size: currentSize,
                color: currentSettings.color,
                tool: currentSettings.tool,
                gesture: isPointerDrawingRef.current
                  ? GestureType.DRAW
                  : GestureType.HOVER,
              });
            }
          }
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [cameraState, engineRef, latestTrackingFrameRef, triggerDockTarget]);

  // Pointer / Mouse events fallback
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0 || !artworkCanvasRef.current || !engineRef.current)
        return;

      e.currentTarget.setPointerCapture(e.pointerId);
      const pt = pointerEventToCanvasPoint(e, artworkCanvasRef.current);
      pointerPositionRef.current = pt;

      if (isGestureDrawingRef.current || isGestureErasingRef.current) {
        isGestureDrawingRef.current = false;
        isGestureErasingRef.current = false;
        engineRef.current.endStroke();
      }

      isPointerDrawingRef.current = true;
      engineRef.current.startStroke(pt, {
        color: settings.color,
        size: activeSize,
        opacity: settings.opacity,
        smoothing: settings.smoothing,
        tool: settings.tool,
        presetId: settings.activePresetId,
      });
    },
    [engineRef, settings, activeSize]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!artworkCanvasRef.current) return;
      const pt = pointerEventToCanvasPoint(e, artworkCanvasRef.current);
      pointerPositionRef.current = pt;

      if (isPointerDrawingRef.current && engineRef.current) {
        engineRef.current.addPointToStroke(pt);
      }
    },
    [engineRef]
  );

  const handlePointerUpOrCancel = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (isPointerDrawingRef.current && engineRef.current) {
        isPointerDrawingRef.current = false;
        engineRef.current.endStroke();
      }
    },
    [engineRef]
  );

  const handlePointerLeave = useCallback(() => {
    pointerPositionRef.current = null;
    if (isPointerDrawingRef.current && engineRef.current) {
      isPointerDrawingRef.current = false;
      engineRef.current.endStroke();
    }
  }, [engineRef]);

  const activeBg = settings.background;

  return (
    <div className="flex-1 h-full bg-[#0B1220] p-3 sm:p-5 flex flex-col overflow-hidden select-none">
      {/* Dynamic Paper Frame */}
      <div
        ref={containerRef}
        style={{ backgroundColor: activeBg.hex }}
        className="relative flex-1 w-full h-full rounded-xl border border-[#243247] shadow-2xl overflow-hidden cursor-none transition-colors duration-200"
      >
        {/* Subtle Drafting Grid (Optional paper style) */}
        {activeBg.grid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `linear-gradient(to right, #243247 1px, transparent 1px), linear-gradient(to bottom, #243247 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        )}

        {/* Artwork Layer */}
        <canvas
          ref={artworkCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          onPointerLeave={handlePointerLeave}
          aria-label="VESPER Drawing Canvas"
          className="absolute inset-0 w-full h-full touch-none"
        />

        {/* Top Gesture Palette & Tool Dock */}
        <GestureDock
          dockRef={dockRef}
          activeTool={settings.tool}
          activeColor={settings.color}
          hoveredTargetUI={hoveredTargetUI}
          registerTargetRef={registerTargetRef}
          onSelectTarget={triggerDockTarget}
        />

        {/* Real-Time Cursor Layer */}
        <canvas
          ref={cursorCanvasRef}
          className="pointer-events-none absolute inset-0 w-full h-full z-20"
        />

        {/* Eraser Active Pill */}
        {settings.tool === ToolType.ERASER && (
          <div className="pointer-events-none absolute bottom-10 left-4 z-10 flex items-center gap-2 rounded-md bg-[#0B1220]/90 border border-[#D5B879] px-3 py-1.5 text-xs font-medium text-[#F0F2F6] shadow-md">
            <Eraser className="w-3.5 h-3.5 text-[#D5B879]" />
            <span>Eraser Active · {activeSize}px</span>
          </div>
        )}

        {/* Color/Tool Selection Confirmation Toast */}
        {selectionToast && Date.now() - selectionToast.timestamp < 1300 && (
          <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-md bg-[#0B1220]/95 border border-[#D5B879] px-3 py-1.5 text-xs font-medium text-[#F0F2F6] shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-[#D5B879]" />
            <span>Selected: {selectionToast.label}</span>
            {selectionToast.hex && (
              <span
                className="w-3 h-3 rounded-full border border-[#F0F2F6]/40"
                style={{ backgroundColor: selectionToast.hex }}
              />
            )}
          </div>
        )}

        {/* Subtle Canvas Corner Information */}
        <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 text-[11px] font-mono text-[#718096] tabular-nums">
          {cameraState === CameraState.ACTIVE ? (
            <span className="inline-flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-[#D5B879]" />
              <span>Spatial Gesture Studio Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <MousePointer2 className="w-3.5 h-3.5" />
              <span>Mouse Mode</span>
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>
            {canvasDimensions.width}×{canvasDimensions.height} px
          </span>
          <span aria-hidden="true">·</span>
          <span>{activeBg.name}</span>
        </div>
      </div>
    </div>
  );
};
