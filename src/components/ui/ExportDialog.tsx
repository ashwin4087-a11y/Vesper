import React, { useState } from 'react';
import { Check, Download, Layers } from 'lucide-react';
import { CANVAS_BACKGROUNDS, CanvasBackground, ExportSettings } from '../../types/drawing';
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

interface ExportBgChoice {
  id: string;
  name: string;
  isTransparent: boolean;
  hex: string;
}

const EXPORT_BG_CHOICES: ExportBgChoice[] = [
  { id: 'transparent', name: 'Transparent', isTransparent: true, hex: 'transparent' },
  { id: 'warm-ivory', name: 'Warm Ivory', isTransparent: false, hex: '#F7F5F0' },
  { id: 'pure-white', name: 'Pure White', isTransparent: false, hex: '#FFFFFF' },
  { id: 'midnight-studio', name: 'Midnight Studio', isTransparent: false, hex: '#0B1220' },
  { id: 'studio-grid', name: 'Studio Grid', isTransparent: false, hex: '#F7F5F0' },
];

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  artworkTitle,
  background,
  strokeCount,
  onClose,
  onExport,
}) => {
  const [title, setTitle] = useState(artworkTitle);
  const [selectedBgId, setSelectedBgId] = useState<string>(background.id);
  const [scale, setScale] = useState<1 | 2>(2);

  const handleConfirm = () => {
    const isTransparent = selectedBgId === 'transparent';
    onExport({
      title: title.trim() || 'vesper-artwork',
      transparentBackground: isTransparent,
      backgroundId: isTransparent ? undefined : selectedBgId,
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

        {/* Background Options */}
        <div className="space-y-2 rounded-lg bg-[#0B1220] border border-[#243247] p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#F0F2F6]">Background Surface</span>
            <span className="text-[11px] text-[#A4B0C1]">
              {EXPORT_BG_CHOICES.find((b) => b.id === selectedBgId)?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
            {EXPORT_BG_CHOICES.map((choice) => {
              const isSelected = selectedBgId === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => setSelectedBgId(choice.id)}
                  className={`py-2 px-2 rounded-md text-[11px] font-medium border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#151E2D] border-[#D5B879] text-[#D5B879]'
                      : 'border-[#243247] text-[#A4B0C1] hover:text-[#F0F2F6]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {choice.isTransparent ? (
                      <span className="w-3 h-3 rounded-full border border-[#718096] bg-[repeating-conic-gradient(#243247_0%_25%,transparent_0%_50%)] bg-[length:6px_6px] shrink-0" />
                    ) : (
                      <span
                        className="w-3 h-3 rounded-full border border-[#243247] shrink-0"
                        style={{ backgroundColor: choice.hex }}
                      />
                    )}
                    <span className="truncate">{choice.name}</span>
                  </div>
                  {isSelected && <Check className="w-3 h-3 shrink-0 ml-1 text-[#D5B879]" />}
                </button>
              );
            })}
          </div>
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
