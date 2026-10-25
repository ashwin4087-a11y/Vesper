import { ToolType } from '../../types/drawing';
import { GestureType } from '../../types/hand';

export interface ReticleRenderOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  size: number;
  color: string;
  tool: ToolType;
  gesture: GestureType;
  isGestureErasing?: boolean;
}

/**
 * High-performance cursor reticle renderer for VESPER.
 * Provides immediate spatial feedback of the brush footprint, active instrument,
 * and gesture state without causing React re-renders.
 */
export function renderReticle({
  ctx,
  x,
  y,
  size,
  color,
  tool,
  gesture,
  isGestureErasing = false,
}: ReticleRenderOptions): void {
  ctx.save();

  const radius = Math.max(3.5, size / 2);
  const isDrawing = gesture === GestureType.DRAW;
  const isErasing = tool === ToolType.ERASER || isGestureErasing || gesture === GestureType.ERASE;

  if (isErasing) {
    // Eraser mode: crisp dashed ring with gentle subtractive backdrop
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fill();

    ctx.lineWidth = 1.75;
    ctx.strokeStyle = '#F87171';
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Outer subtle guide ring if actively erasing
    if (isDrawing || isGestureErasing) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.5)';
      ctx.lineWidth = 1.25;
      ctx.stroke();
    } else {
      // Precision center dot
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#F87171';
      ctx.fill();
    }
  } else {
    // Brush mode: pigment preview filled circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = isDrawing ? 0.9 : 0.45;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Border ring: dark if light color, gold if dark color
    ctx.lineWidth = isDrawing ? 2 : 1.25;
    const isLightPigment =
      color.toLowerCase() === '#f7f5f0' || color.toLowerCase() === '#ffffff';
    ctx.strokeStyle = isLightPigment ? '#0B1220' : '#D5B879';
    ctx.stroke();

    if (isDrawing) {
      // Golden drawing aura
      ctx.beginPath();
      ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#D5B879';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Center targeting pip for precision alignment
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = isLightPigment ? '#0B1220' : '#D5B879';
      ctx.fill();
    }
  }

  ctx.restore();
}
