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
 * Exports the current artwork canvas composited over VESPER's warm Ivory (#F7F5F0)
 * paper background as a high-resolution PNG download.
 */
export function exportCanvasToPng(
  sourceCanvas: HTMLCanvasElement,
  artworkTitle: string = 'vesper-artwork',
  backgroundColor: string = '#F7F5F0'
): boolean {
  try {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = sourceCanvas.width;
    exportCanvas.height = sourceCanvas.height;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return false;

    // Fill warm ivory paper background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw the high-DPI artwork layer on top
    ctx.drawImage(sourceCanvas, 0, 0);

    const sanitizedName =
      artworkTitle
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'vesper-artwork';

    const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${sanitizedName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to export PNG:', err);
    return false;
  }
}
