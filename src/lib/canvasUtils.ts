import { CanvasBackground, ExportSettings } from '../types/drawing';

/**
 * Configures an HTML5 Canvas for crisp Retina / High-DPI rendering
 * while preserving logical CSS pixel coordinate space.
 */
export function configureHighDPICanvas(
  canvas: HTMLCanvasElement,
  logicalWidth: number,
  logicalHeight: number
): CanvasRenderingContext2D | null {
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  if (
    canvas.width !== Math.floor(logicalWidth * dpr) ||
    canvas.height !== Math.floor(logicalHeight * dpr)
  ) {
    canvas.width = Math.floor(logicalWidth * dpr);
    canvas.height = Math.floor(logicalHeight * dpr);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/**
 * Draws the subtle drafting grid guidelines for the Studio Grid background option.
 */
export function drawStudioGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number = 32
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(230, 234, 240, 0.7)';
  ctx.lineWidth = 0.75;

  ctx.beginPath();
  for (let x = gridSize; x < width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = gridSize; y < height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Subtle major subdivision points
  ctx.fillStyle = 'rgba(213, 184, 121, 0.4)';
  const majorStep = gridSize * 4;
  for (let x = majorStep; x < width; x += majorStep) {
    for (let y = majorStep; y < height; y += majorStep) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Exports the artwork with user-configurable format, background, and resolution options.
 */
export function exportCanvasToPng(
  sourceCanvas: HTMLCanvasElement,
  settings: ExportSettings,
  background: CanvasBackground
): boolean {
  try {
    const scale = settings.scale || 1;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = sourceCanvas.width * scale;
    exportCanvas.height = sourceCanvas.height * scale;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return false;

    // Scale context if exporting at 2x high resolution
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    // Fill background unless transparent is requested
    if (!settings.transparentBackground) {
      ctx.fillStyle = background.hex;
      ctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);

      if (background.grid) {
        drawStudioGrid(ctx, sourceCanvas.width, sourceCanvas.height);
      }
    }

    // Composite high-DPI artwork strokes
    ctx.drawImage(sourceCanvas, 0, 0);

    const sanitizedName =
      settings.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'vesper-artwork';

    const suffix = settings.transparentBackground ? '-transparent' : '';
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
    console.error('Failed to export artwork PNG:', err);
    return false;
  }
}
