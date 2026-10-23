import React from 'react';
import { Check } from 'lucide-react';
import { ToolType, VESPER_PALETTE } from '../../types/drawing';
import { Tooltip } from '../ui/Tooltip';

export interface ColorPaletteProps {
  selectedColor: string;
  activeTool: ToolType;
  onSelectColor: (hex: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  activeTool,
  onSelectColor,
}) => {
  const activeSwatch =
    VESPER_PALETTE.find(
      (c) => c.hex.toLowerCase() === selectedColor.toLowerCase()
    ) || VESPER_PALETTE[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#F0F2F6]">
          Studio Pigments
        </span>
        <span className="font-mono text-[11px] text-[#A4B0C1] tabular-nums">
          {activeSwatch.name} · {activeSwatch.hex}
        </span>
      </div>

      <div
        className="grid grid-cols-4 gap-2.5"
        role="radiogroup"
        aria-label="Drawing Color Palette"
      >
        {VESPER_PALETTE.map((swatch) => {
          const isSelected =
            swatch.hex.toLowerCase() === selectedColor.toLowerCase() &&
            activeTool === ToolType.BRUSH;

          const isLightColor =
            swatch.id === 'ivory' || swatch.id === 'champagne-gold';

          return (
            <Tooltip
              key={swatch.id}
              content={swatch.name}
              shortcut={swatch.shortcut}
              side="top"
            >
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${swatch.name} (${swatch.hex})`}
                onClick={() => onSelectColor(swatch.hex)}
                className={`group relative w-full h-10 rounded-lg flex items-center justify-center transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B879] cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#D5B879] ring-offset-2 ring-offset-[#151E2D] scale-[1.02]'
                    : 'border border-[#243247] hover:border-[#A4B0C1]/70'
                }`}
                style={{ backgroundColor: swatch.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 stroke-[2.5] ${
                      isLightColor ? 'text-[#0B1220]' : 'text-[#F0F2F6]'
                    }`}
                  />
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
