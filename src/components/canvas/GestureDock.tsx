import React from 'react';
import { Brush, Check, Eraser } from 'lucide-react';
import { ToolType, VESPER_PALETTE } from '../../types/drawing';

export interface GestureDockProps {
  dockRef: React.RefObject<HTMLDivElement | null>;
  activeTool: ToolType;
  activeColor: string;
  hoveredTargetUI: { id: string | null; progress: number };
  registerTargetRef: (id: string, el: HTMLButtonElement | null) => void;
  onSelectTarget: (id: string) => void;
}

export const GestureDock: React.FC<GestureDockProps> = ({
  dockRef,
  activeTool,
  activeColor,
  hoveredTargetUI,
  registerTargetRef,
  onSelectTarget,
}) => {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 max-w-[95%]">
      <div
        ref={dockRef}
        aria-label="Gesture Color and Tool Bar"
        className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#151E2D]/95 border border-[#243247] px-2.5 py-1.5 shadow-xl backdrop-blur-xs"
      >
        <span className="hidden md:inline text-[11px] font-medium text-[#A4B0C1] pr-1 whitespace-nowrap">
          Hover to Pick:
        </span>

        {/* 8 Curated VESPER Pigments */}
        <div className="flex items-center gap-1.5">
          {VESPER_PALETTE.map((swatch) => {
            const targetId = `color:${swatch.hex}`;
            const isSelected =
              swatch.hex.toLowerCase() === activeColor.toLowerCase() &&
              activeTool === ToolType.BRUSH;
            const isHoveredByHand = hoveredTargetUI.id === targetId;
            const isLight =
              swatch.id === 'ivory' || swatch.id === 'champagne-gold';

            return (
              <button
                key={swatch.id}
                ref={(el) => registerTargetRef(targetId, el)}
                type="button"
                onClick={() => onSelectTarget(targetId)}
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

                {/* Circular Dwell Progress Ring */}
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
                      strokeDashoffset={94.2 * (1 - hoveredTargetUI.progress)}
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-[#243247] mx-0.5" />

        {/* Brush & Eraser Quick Gesture Targets */}
        <div className="flex items-center gap-1">
          <button
            ref={(el) => registerTargetRef('tool:brush', el)}
            type="button"
            onClick={() => onSelectTarget('tool:brush')}
            title="Brush Tool (Hover with hand or click)"
            className={`relative h-7 sm:h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTool === ToolType.BRUSH
                ? 'bg-[#D5B879] text-[#0B1220] font-semibold'
                : hoveredTargetUI.id === 'tool:brush'
                  ? 'bg-[#243247] text-[#D5B879]'
                  : 'bg-[#0B1220] text-[#A4B0C1] border border-[#243247]'
            }`}
          >
            <Brush className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Brush</span>
            {hoveredTargetUI.id === 'tool:brush' && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D5B879]"
                style={{ width: `${hoveredTargetUI.progress * 100}%` }}
              />
            )}
          </button>

          <button
            ref={(el) => registerTargetRef('tool:eraser', el)}
            type="button"
            onClick={() => onSelectTarget('tool:eraser')}
            title="Eraser Tool (Hover with hand or click)"
            className={`relative h-7 sm:h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTool === ToolType.ERASER
                ? 'bg-[#D5B879] text-[#0B1220] font-semibold'
                : hoveredTargetUI.id === 'tool:eraser'
                  ? 'bg-[#243247] text-[#D5B879]'
                  : 'bg-[#0B1220] text-[#A4B0C1] border border-[#243247]'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
            {hoveredTargetUI.id === 'tool:eraser' && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D5B879]"
                style={{ width: `${hoveredTargetUI.progress * 100}%` }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
