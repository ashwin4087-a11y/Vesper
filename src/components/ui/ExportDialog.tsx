import React, { useState } from 'react';
import { Check, Download, Layers, Sparkles } from 'lucide-react';
import { CanvasBackground, ExportSettings } from '../../types/drawing';
import { Button } from './Button';
import { Dialog } from './Dialog';

export interface ExportDialogProps {
  open: boolean;
  artworkTitle: string;
  background: CanvasBackground;
  strokeCount: number;
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  artworkTitle,
  background,
  strokeCount,
  onClose,
  onExport,
}) => {
  const [title, setTitle] = useState(artworkTitle);
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [scale, setScale] = useState<1 | 2>(2);

  const handleConfirm = () => {
    onExport({
      title: title.trim() || 'vesper-artwork',
      transparentBackground,
      scale,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Export Artwork"
      description="Save your gesture-drawn piece as a pristine, high-resolution PNG."
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {/* Artwork Name */}
        <div className="space-y-1.5">
          <label htmlFor="export-title-input" className="text-[#A4B0C1]">
            Artwork File Name
          </label>
          <input
            id="export-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-[#0B1220] border border-[#243247] px-3 py-2 text-xs text-[#F0F2F6] focus:outline-none focus:border-[#D5B879]"
            placeholder="vesper-artwork"
          />
        </div>

        {/* Resolution Quality */}
        <div className="space-y-2 rounded-lg bg-[#0B1220] border border-[#243247] p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#F0F2F6]">Resolution Scale</span>
            <span className="font-mono text-[#D5B879] tabular-nums">
              {scale === 2 ? '2x Retina Ultra-Crisp' : '1x Standard'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setScale(1)}
              className={`py-2 px-3 rounded-md text-xs font-medium border text-center transition-colors cursor-pointer ${
                scale === 1
                  ? 'bg-[#151E2D] border-[#D5B879] text-[#D5B879]'
                  : 'border-[#243247] text-[#A4B0C1] hover:text-[#F0F2F6]'
              }`}
            >
              1× Standard Canvas
            </button>
            <button
              type="button"
              onClick={() => setScale(2)}
              className={`py-2 px-3 rounded-md text-xs font-medium border text-center transition-colors cursor-pointer ${
                scale === 2
                  ? 'bg-[#151E2D] border-[#D5B879] text-[#D5B879]'
                  : 'border-[#243247] text-[#A4B0C1] hover:text-[#F0F2F6]'
              }`}
            >
              2× High-DPI Print Ready
            </button>
          </div>
        </div>

        {/* Background Option */}
        <div className="space-y-2 rounded-lg bg-[#0B1220] border border-[#243247] p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#F0F2F6]">
                Transparent Background
              </div>
              <div className="text-[#A4B0C1] mt-0.5">
                Export vector-smooth ink strokes only without paper color
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={transparentBackground}
              onClick={() => setTransparentBackground((prev) => !prev)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                transparentBackground ? 'bg-[#D5B879]' : 'bg-[#243247]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#0B1220] transition-transform ${
                  transparentBackground ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {!transparentBackground && (
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#A4B0C1]">
              <span
                className="w-3 h-3 rounded-full border border-[#243247]"
                style={{ backgroundColor: background.hex }}
              />
              <span>Includes active paper surface: {background.name}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-[11px] text-[#718096] pt-1">
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            <Layers className="w-3.5 h-3.5 text-[#D5B879]" />
            <span>{strokeCount} vector strokes composited</span>
          </div>
          <span>PNG Format</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleConfirm}>
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
