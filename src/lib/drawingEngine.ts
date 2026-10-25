import {
  CANVAS_BACKGROUNDS,
  CanvasBackground,
  ExportSettings,
  Point,
  Stroke,
  ToolType,
} from '../types/drawing';
import { configureHighDPICanvas, drawStudioGrid } from './canvasUtils';

export interface EngineStateListener {
  onHistoryChange?: (canUndo: boolean, canRedo: boolean, strokeCount: number) => void;
}

/**
 * Independent HTML5 Canvas Drawing Engine for VESPER.
 * Features 60fps+ decoupled execution, distinct brush preset rendering dynamics,
 * quadratic spline smoothing, distortion-free responsive resizing, and true
 * vector high-resolution export.
 */
export class DrawingEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private logicalWidth: number = 0;
  private logicalHeight: number = 0;

  private strokes: Stroke[] = [];
  private redoStack: Stroke[] = [];
  private activeStroke: Stroke | null = null;
  private listener: EngineStateListener = {};

  constructor(listener?: EngineStateListener) {
    if (listener) {
      this.listener = listener;
    }
  }

  public setListener(listener: EngineStateListener): void {
    this.listener = listener;
    this.notifyHistoryChange();
  }

  public attachCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ): void {
    this.canvas = canvas;
    this.resize(width, height);
  }

  public detachCanvas(): void {
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Resizes the backing store for high-DPI displays while preserving
   * exact vector stroke geometry without aspect-ratio warping or coordinate drift.
   */
  public resize(width: number, height: number): void {
    if (!this.canvas || width <= 0 || height <= 0) return;

    this.logicalWidth = width;
    this.logicalHeight = height;
    this.ctx = configureHighDPICanvas(this.canvas, width, height);
    this.renderAll();
  }

  public startStroke(
    point: Point,
    options: {
      color: string;
      size: number;
      opacity?: number;
      smoothing?: number;
      tool: ToolType;
      presetId?: string;
    }
  ): void {
    this.activeStroke = {
      id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      points: [{ ...point, velocity: 0 }],
      color: options.color,
      size: options.size,
      opacity: options.opacity ?? 1,
      smoothing: options.smoothing ?? 0.55,
      tool: options.tool,
      presetId: options.presetId ?? 'fine-ink',
      timestamp: Date.now(),
    };

    this.renderAll();
  }

  public addPointToStroke(point: Point): void {
    if (!this.activeStroke) return;

    const pts = this.activeStroke.points;
    const lastPt = pts[pts.length - 1];

    if (lastPt) {
      const dx = point.x - lastPt.x;
      const dy = point.y - lastPt.y;
      const dist = Math.hypot(dx, dy);

      // Filter micro sub-pixel sensor jitter
      if (dist < 0.5) return;

      // Estimate velocity for dynamic brush tapering and calligraphic dynamics
      const velocity = Math.min(2.0, dist / 14);
      pts.push({ ...point, velocity });
    } else {
      pts.push({ ...point, velocity: 0 });
    }

    this.renderAll();
  }

  public endStroke(): Stroke | null {
    if (!this.activeStroke) return null;

    const completed = this.activeStroke;
    this.activeStroke = null;

    if (completed.points.length > 0) {
      this.strokes.push(completed);
      this.redoStack = [];
      this.notifyHistoryChange();
    }

    this.renderAll();
    return completed;
  }

  public cancelActiveStroke(): void {
    if (!this.activeStroke) return;
    this.activeStroke = null;
    this.renderAll();
  }

  public isDrawingStroke(): boolean {
    return this.activeStroke !== null;
  }

  public undo(): boolean {
    if (this.strokes.length === 0) return false;
    const popped = this.strokes.pop()!;
    this.redoStack.push(popped);
    this.renderAll();
    this.notifyHistoryChange();
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const restored = this.redoStack.pop()!;
    this.strokes.push(restored);
    this.renderAll();
    this.notifyHistoryChange();
    return true;
  }

  public clear(): void {
    this.activeStroke = null;
    if (this.strokes.length === 0) return;
    this.strokes = [];
    this.redoStack = [];
    this.renderAll();
    this.notifyHistoryChange();
  }

  public getStrokes(): Stroke[] {
    return this.strokes;
  }

  public setStrokes(strokes: Stroke[]): void {
    this.strokes = [...strokes];
    this.redoStack = [];
    this.renderAll();
    this.notifyHistoryChange();
  }

  public canUndo(): boolean {
    return this.strokes.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getStrokeCount(): number {
    return this.strokes.length;
  }

  public getLogicalDimensions(): { width: number; height: number } {
    return { width: this.logicalWidth, height: this.logicalHeight };
  }

  /**
   * Renders the complete artwork directly to a new high-resolution canvas at requested scale
   * without stretching or raster artifacts.
   */
  public exportPNG(
    exportSettings: ExportSettings,
    activeBackground: CanvasBackground
  ): boolean {
    if (this.logicalWidth <= 0 || this.logicalHeight <= 0) return false;

    try {
      const scale = exportSettings.scale || 1;
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = Math.round(this.logicalWidth * scale);
      exportCanvas.height = Math.round(this.logicalHeight * scale);

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return false;

      // Determine background: transparent, or requested background surface
      let bg = activeBackground;
      if (exportSettings.backgroundId) {
        const found = CANVAS_BACKGROUNDS.find((b) => b.id === exportSettings.backgroundId);
        if (found) bg = found;
      }

      if (!exportSettings.transparentBackground) {
        ctx.fillStyle = bg.hex;
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        if (bg.grid) {
          ctx.save();
          ctx.scale(scale, scale);
          drawStudioGrid(ctx, this.logicalWidth, this.logicalHeight);
          ctx.restore();
        }
      }

      // Re-render all strokes at true vector scale
      ctx.save();
      ctx.scale(scale, scale);

      for (let i = 0; i < this.strokes.length; i++) {
        this.drawSingleStroke(ctx, this.strokes[i]);
      }

      ctx.restore();

      // Download PNG
      const sanitizedName =
        exportSettings.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'vesper-artwork';

      const suffix = exportSettings.transparentBackground ? '-transparent' : '';
      const resolutionSuffix = scale > 1 ? `@${scale}x` : '';
      const filename = `${sanitizedName}${suffix}${resolutionSuffix}.png`;

      const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (err) {
      console.error('Failed to export artwork at high resolution:', err);
      return false;
    }
  }

  public renderAll(): void {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

    for (let i = 0; i < this.strokes.length; i++) {
      this.drawSingleStroke(ctx, this.strokes[i]);
    }

    if (this.activeStroke) {
      this.drawSingleStroke(ctx, this.activeStroke);
    }

    ctx.restore();
  }

  /**
   * Renders an individual stroke with distinct preset-specific dynamics:
   * - Fine Ink: crisp technical line with velocity taper
   * - Calligraphy: broad-edge nib with directional caliber variation
   * - Chisel Marker: flat angled ribbon footprint with rich pigment overlap
   * - Soft Graphite: velvety layered shading with soft pencil texture
   * - Eraser: clean destination-out subtraction
   */
  public drawSingleStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke
  ): void {
    const { points, color, size, opacity, tool, presetId } = stroke;
    if (points.length === 0) return;

    ctx.save();

    if (tool === ToolType.ERASER) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.globalAlpha = 1;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      this.drawSmoothPath(ctx, points);
      ctx.restore();
      return;
    }

    ctx.globalCompositeOperation = 'source-over';

    // 1. Single dot/touch
    if (points.length === 1) {
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, Math.max(1, size / 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // 2. Calligraphy Preset: Broad-edge angled nib (45° angle)
    if (presetId === 'calligraphy') {
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity;
      this.drawCalligraphyStroke(ctx, points, size);
      ctx.restore();
      return;
    }

    // 3. Chisel Marker Preset: Flat angled rectangular ribbon
    if (presetId === 'chisel-marker') {
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.globalAlpha = opacity * 0.88;
      this.drawChiselMarkerStroke(ctx, points, size);
      ctx.restore();
      return;
    }

    // 4. Soft Graphite Preset: Layered velvety pencil shading
    if (presetId === 'soft-graphite') {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Soft feather pass
      ctx.globalAlpha = opacity * 0.45;
      ctx.lineWidth = size * 1.35;
      this.drawSmoothPath(ctx, points);

      // Core graphite pass
      ctx.globalAlpha = opacity * 0.75;
      ctx.lineWidth = size * 0.85;
      this.drawSmoothPath(ctx, points);

      ctx.restore();
      return;
    }

    // 5. Fine Ink (and default): Crisp technical stroke with velocity taper
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Dynamic velocity taper across segments
    if (points.length > 2 && size > 2) {
      this.drawVariableWidthStroke(ctx, points, size);
    } else {
      ctx.lineWidth = size;
      this.drawSmoothPath(ctx, points);
    }

    ctx.restore();
  }

  /**
   * Smooth quadratic spline path interpolation through consecutive midpoints.
   */
  private drawSmoothPath(ctx: CanvasRenderingContext2D, points: Point[]): void {
    if (points.length < 2) return;

    if (points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }

  /**
   * Variable-width ink stroke with velocity taper for authentic fluid ink tension.
   */
  private drawVariableWidthStroke(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    baseSize: number
  ): void {
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const v = (p1.velocity ?? 0) + (p2.velocity ?? 0);
      // Velocity taper: faster motion creates slightly leaner, tighter stroke
      const taperFactor = Math.max(0.65, Math.min(1.2, 1.05 - v * 0.22));
      const width = Math.max(1, baseSize * taperFactor);

      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  /**
   * Broad-edge Calligraphy Ribbon: Computes angled nib geometry (45° incline),
   * creating thick downstrokes and thin diagonal hairlines.
   */
  private drawCalligraphyStroke(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    baseSize: number
  ): void {
    const nibAngle = Math.PI / 4; // 45 degrees
    const halfWidth = Math.max(2, baseSize * 0.6);
    const dxNib = Math.cos(nibAngle) * halfWidth;
    const dyNib = Math.sin(nibAngle) * halfWidth;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      ctx.beginPath();
      ctx.moveTo(p1.x - dxNib, p1.y - dyNib);
      ctx.lineTo(p1.x + dxNib, p1.y + dyNib);
      ctx.lineTo(p2.x + dxNib, p2.y + dyNib);
      ctx.lineTo(p2.x - dxNib, p2.y - dyNib);
      ctx.closePath();
      ctx.fill();
    }

    // Connect joints with smooth circular stamp
    for (let i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, halfWidth * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Chisel Marker Ribbon: Distinct architectural angled footprint (30° angle).
   */
  private drawChiselMarkerStroke(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    baseSize: number
  ): void {
    const chiselAngle = Math.PI / 6; // 30 degrees
    const halfCaliber = Math.max(2.5, baseSize * 0.55);
    const dxChisel = Math.cos(chiselAngle) * halfCaliber;
    const dyChisel = Math.sin(chiselAngle) * halfCaliber;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      ctx.beginPath();
      ctx.moveTo(p1.x - dxChisel, p1.y - dyChisel);
      ctx.lineTo(p1.x + dxChisel, p1.y + dyChisel);
      ctx.lineTo(p2.x + dxChisel, p2.y + dyChisel);
      ctx.lineTo(p2.x - dxChisel, p2.y - dyChisel);
      ctx.closePath();
      ctx.fill();
    }
  }

  private notifyHistoryChange(): void {
    if (this.listener.onHistoryChange) {
      this.listener.onHistoryChange(
        this.canUndo(),
        this.canRedo(),
        this.strokes.length
      );
    }
  }
}
