import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Brush, Check, Eraser, Hand, MousePointer2, Sparkles } from 'lucide-react';
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

export interface DrawingCanvasProps {
  engineRef: React.RefObject<DrawingEngine | null>;
  settings: DrawingSettings;
  activeSize: number;
  cameraState: CameraState;
  latestTrackingFrameRef: React.RefObject<HandTrackingFrame>;
  onSelectColor: (hex: string) => void;
  onSelectTool: (tool: ToolType) => void;
}

const DWELL_DURATION_MS = 520;

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
  const smoothedGesturePointRef = useRef<Point | null>(null);
  const pointerPositionRef = useRef<Point | null>(null);

  // Dwell & Pinch target tracking for the On-Canvas Gesture Palette Dock
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

  // Keep latest callbacks and settings in refs for the 60fps loop
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

  // Trigger a color or tool selection from the On-Canvas Gesture Dock
  const triggerDockTarget = useCallback((targetId: string) => {
    if (targetId === 'tool:brush') {
      onSelectToolRef.current(ToolType.BRUSH);
      setSelectionToast({ label: 'Brush Tool', timestamp: Date.now() });
    } else if (targetId === 'tool:eraser') {
      onSelectToolRef.current(ToolType.ERASER);
      setSelectionToast({ label: 'Eraser Tool', timestamp: Date.now() });
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

  // Attach and resize the DrawingEngine when container size changes
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

  // Render live cursor reticle & process gesture strokes + top palette dock hover on every animation frame
  useEffect(() => {
    let rafId: number;

    const renderCursorAndGestureLoop = () => {
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

            // Convert canvas-local smoothed point to viewport clientX / clientY to check Dock hit targets
            const clientX = containerRect.left + smoothed.x;
            const clientY = containerRect.top + smoothed.y;

            let isInsideDockZone = false;
            let hitTargetId: string | null = null;

            if (dockRef.current && currentSettings.enablePinchColorCycle) {
              const dockRect = dockRef.current.getBoundingClientRect();
              // Add a 10px comfort buffer around the top Gesture Palette Dock
              if (
                clientX >= dockRect.left - 10 &&
                clientX <= dockRect.right + 10 &&
                clientY >= dockRect.top - 10 &&
                clientY <= dockRect.bottom + 12
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
              // Immediately stop any active canvas stroke when hand enters the top Palette Dock
              if (isGestureDrawingRef.current) {
                isGestureDrawingRef.current = false;
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

                  // Select if user either completes dwell (520ms) OR pinches while over the swatch
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
              // Hand is in the main drawing canvas area (outside the top Palette Dock)
              if (hoveredTargetIdRef.current !== null) {
                hoveredTargetIdRef.current = null;
                lastTriggeredTargetIdRef.current = null;
                setHoveredTargetUI({ id: null, progress: 0 });
              }

              // Connect gesture state to DrawingEngine (never changes color mid-drawing!)
              if (
                frame.gestureResult.isDrawing &&
                !isPointerDrawingRef.current
              ) {
                if (!isGestureDrawingRef.current) {
                  isGestureDrawingRef.current = true;
                  engine.startStroke(smoothed, {
                    color: currentSettings.color,
                    size: currentSize,
                    opacity: currentSettings.opacity,
                    smoothing: currentSettings.smoothing,
                    tool: currentSettings.tool,
                  });
                } else {
                  engine.addPointToStroke(smoothed);
                }
              } else if (isGestureDrawingRef.current) {
                isGestureDrawingRef.current = false;
                engine.endStroke();
              }
            }

            // Draw precision hand cursor reticle on cursor overlay canvas
            drawReticle(
              ctx,
              smoothed.x,
              smoothed.y,
              currentSize,
              currentSettings.color,
              currentSettings.tool,
              isInsideDockZone
                ? GestureType.PAUSE
                : frame.gestureResult.gesture
            );
          } else {
            // Hand left frame
            if (isGestureDrawingRef.current) {
              isGestureDrawingRef.current = false;
              smoothedGesturePointRef.current = null;
              engine.endStroke();
            }
            if (hoveredTargetIdRef.current !== null) {
              hoveredTargetIdRef.current = null;
              lastTriggeredTargetIdRef.current = null;
              setHoveredTargetUI({ id: null, progress: 0 });
            }

            // Fallback: draw pointer cursor reticle if mouse is hovering over canvas
            if (pointerPositionRef.current) {
              drawReticle(
                ctx,
                pointerPositionRef.current.x,
                pointerPositionRef.current.y,
                currentSize,
                currentSettings.color,
                currentSettings.tool,
                isPointerDrawingRef.current
                  ? GestureType.DRAW
                  : GestureType.PAUSE
              );
            }
          }
        }
      }

      rafId = requestAnimationFrame(renderCursorAndGestureLoop);
    };

    rafId = requestAnimationFrame(renderCursorAndGestureLoop);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [cameraState, engineRef, latestTrackingFrameRef, triggerDockTarget]);

  // Mouse / Pointer fallback handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0 || !artworkCanvasRef.current || !engineRef.current)
        return;

      e.currentTarget.setPointerCapture(e.pointerId);
      const pt = pointerEventToCanvasPoint(e, artworkCanvasRef.current);
      pointerPositionRef.current = pt;

      if (isGestureDrawingRef.current) {
        isGestureDrawingRef.current = false;
        engineRef.current.endStroke();
      }

      isPointerDrawingRef.current = true;
      engineRef.current.startStroke(pt, {
        color: settings.color,
        size: activeSize,
        opacity: settings.opacity,
        smoothing: settings.smoothing,
        tool: settings.tool,
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

  return (
    <div className="flex-1 h-full bg-[#0B1220] p-3 sm:p-5 flex flex-col overflow-hidden select-none">
      {/* Warm Ivory (#F7F5F0) Studio Canvas Frame */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full rounded-xl bg-[#F7F5F0] border border-[#243247] shadow-xl overflow-hidden cursor-none"
      >
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

        {/* On-Canvas Top Gesture Palette & Tool Dock (Hover or Pinch with hand cursor to select without mid-drawing accidents) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 max-w-[95%]">
          <div
            ref={dockRef}
            aria-label="Gesture Color and Tool Bar"
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#151E2D]/95 border border-[#243247] px-2.5 py-1.5 shadow-lg backdrop-blur-xs"
          >
            <span className="hidden md:inline text-[11px] font-medium text-[#A4B0C1] pr-1 whitespace-nowrap">
              Hover to Pick:
            </span>

            {/* 8 VESPER Swatches */}
            <div className="flex items-center gap-1.5">
              {VESPER_PALETTE.map((swatch) => {
                const targetId = `color:${swatch.hex}`;
                const isSelected =
                  swatch.hex.toLowerCase() === settings.color.toLowerCase() &&
                  settings.tool === ToolType.BRUSH;
                const isHoveredByHand = hoveredTargetUI.id === targetId;
                const isLight =
                  swatch.id === 'ivory' || swatch.id === 'champagne-gold';

                return (
                  <button
                    key={swatch.id}
                    ref={(el) => registerTargetRef(targetId, el)}
                    type="button"
                    onClick={() => triggerDockTarget(targetId)}
                    title={`${swatch.name} (Hover with hand or click)`}
                    aria-label={`Select ${swatch.name}`}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-transform duration-150 cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#D5B879] ring-offset-2 ring-offset-[#151E2D] scale-105'
                        : isHoveredByHand
                          ? 'scale-110 ring-2 ring-[#D5B879]/80'
                          : 'border border-[#243247] hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 stroke-[2.5] ${
                          isLight ? 'text-[#0B1220]' : 'text-[#F0F2F6]'
                        }`}
                      />
                    )}

                    {/* Circular Dwell Progress Indicator when hand hovers over swatch */}
                    {isHoveredByHand && (
                      <svg
                        viewBox="0 0 36 36"
                        className="pointer-events-none absolute -inset-1 w-9 h-9 sm:w-10 sm:h-10 -rotate-90"
                      >
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#D5B879"
                          strokeWidth="2.5"
                          strokeDasharray={94.2}
                          strokeDashoffset={
                            94.2 * (1 - hoveredTargetUI.progress)
                          }
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="w-px h-5 bg-[#243247] mx-0.5" />

            {/* Quick Gesture Brush & Eraser Targets */}
            <div className="flex items-center gap-1">
              <button
                ref={(el) => registerTargetRef('tool:brush', el)}
                type="button"
                onClick={() => triggerDockTarget('tool:brush')}
                title="Brush Tool (Hover with hand or click)"
                className={`relative h-7 sm:h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  settings.tool === ToolType.BRUSH
                    ? 'bg-[#D5B879] text-[#0B1220] font-semibold'
                    : hoveredTargetUI.id === 'tool:brush'
                      ? 'bg-[#243247] text-[#D5B879]'
                      : 'bg-[#0B1220] text-[#A4B0C1] border border-[#243247]'
                }`}
              >
                <Brush className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Brush</span>
              </button>

              <button
                ref={(el) => registerTargetRef('tool:eraser', el)}
                type="button"
                onClick={() => triggerDockTarget('tool:eraser')}
                title="Eraser Tool (Hover with hand or click)"
                className={`relative h-7 sm:h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  settings.tool === ToolType.ERASER
                    ? 'bg-[#D5B879] text-[#0B1220] font-semibold'
                    : hoveredTargetUI.id === 'tool:eraser'
                      ? 'bg-[#243247] text-[#D5B879]'
                      : 'bg-[#0B1220] text-[#A4B0C1] border border-[#243247]'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eraser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Hand & Pointer Reticle Layer (above dock so you see your fingertip over swatches) */}
        <canvas
          ref={cursorCanvasRef}
          className="pointer-events-none absolute inset-0 w-full h-full z-20"
        />

        {/* Eraser Active Banner */}
        {settings.tool === ToolType.ERASER && (
          <div className="pointer-events-none absolute bottom-10 left-4 z-10 flex items-center gap-2 rounded-md bg-[#0B1220]/90 border border-[#D5B879] px-3 py-1.5 text-xs font-medium text-[#F0F2F6] shadow-md">
            <Eraser className="w-3.5 h-3.5 text-[#D5B879]" />
            <span>Eraser Active · {activeSize}px</span>
          </div>
        )}

        {/* Color/Tool Selection Confirmation Toast */}
        {selectionToast && Date.now() - selectionToast.timestamp < 1400 && (
          <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-md bg-[#0B1220]/95 border border-[#D5B879] px-3 py-1.5 text-xs font-medium text-[#F0F2F6] shadow-md">
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

        {/* Subtle Bottom-Left Input Mode & Resolution Watermark */}
        <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 text-[11px] font-mono text-[#475569]/80 tabular-nums">
          {cameraState === CameraState.ACTIVE ? (
            <span className="inline-flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5" />
              <span>Gesture + Mouse Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <MousePointer2 className="w-3.5 h-3.5" />
              <span>Mouse Mode (Enable Camera for Gestures)</span>
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>
            {canvasDimensions.width}×{canvasDimensions.height}
          </span>
        </div>
      </div>
    </div>
  );
};

function drawReticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  tool: ToolType,
  gesture: GestureType
) {
  ctx.save();

  const radius = Math.max(4, size / 2);
  const isDrawing = gesture === GestureType.DRAW;

  if (tool === ToolType.ERASER) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(247, 245, 240, 0.65)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#0B1220';
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = isDrawing ? 0.85 : 0.42;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.lineWidth = isDrawing ? 2 : 1.25;
    ctx.strokeStyle =
      color.toLowerCase() === '#f7f5f0' ? '#0B1220' : '#D5B879';
    ctx.stroke();
  }

  if (isDrawing) {
    ctx.beginPath();
    ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#D5B879';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#D5B879';
    ctx.fill();
  }

  ctx.restore();
}
