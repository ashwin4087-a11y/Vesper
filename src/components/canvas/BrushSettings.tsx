import React from 'react';
import { BRUSH_SIZE_PRESETS, ToolType } from '../../types/drawing';

export interface BrushSettingsProps {
  tool: ToolType;
  color: string;
  size: number;
  opacity: number;
  smoothing: number;
  onChangeSize: (size: number) => void;
  onChangeOpacity: (opacity: number) => void;
  onChangeSmoothing: (smoothing: number) => void;
}

export const BrushSettings: React.FC<BrushSettingsProps> = ({
  tool,
  color,
  size,
  opacity,
  smoothing,
  onChangeSize,
  onChangeOpacity,
  onChangeSmoothing,
}) => {
  const isEraser = tool === ToolType.ERASER;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#F0F2F6]">
          {isEraser ? 'Eraser Caliber' : 'Brush Dynamics'}
        </span>
        <span className="font-mono text-xs text-[#D5B879] tabular-nums">
          {size}px
        </span>
      </div>

      {/* Live Brush Tip Preview on Warm Ivory Miniature */}
      <div className="h-14 rounded-lg bg-[#F7F5F0] border border-[#243247] flex items-center justify-between px-4">
        <span className="text-[11px] font-medium text-[#475569]">
          {isEraser ? 'Eraser Tip Diameter' : 'Stroke Tip Preview'}
        </span>
        <div className="w-12 h-12 flex items-center justify-center">
          <div
            className="rounded-full transition-all duration-100"
            style={{
              width: `${Math.max(4, Math.min(44, size))}px`,
              height: `${Math.max(4, Math.min(44, size))}px`,
              backgroundColor: isEraser ? '#F7F5F0' : color,
              opacity: isEraser ? 1 : opacity,
              border: isEraser
                ? '1.5px dashed #0B1220'
                : color.toLowerCase() === '#f7f5f0'
                  ? '1.5px solid #475569'
                  : 'none',
            }}
          />
        </div>
      </div>

      {/* Quick Size Presets */}
      <div className="grid grid-cols-5 gap-1.5">
        {BRUSH_SIZE_PRESETS.map((preset) => {
          const isCurrent = size === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChangeSize(preset)}
              className={`h-7 rounded text-xs font-mono tabular-nums transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-[#D5B879] text-[#0B1220] font-semibold'
                  : 'bg-[#0B1220] text-[#A4B0C1] border border-[#243247] hover:text-[#F0F2F6]'
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>

      {/* Fine Size Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="vesper-size-slider" className="text-[#A4B0C1]">
            Diameter
          </label>
          <span className="font-mono text-[#718096] tabular-nums">{size} px</span>
        </div>
        <input
          id="vesper-size-slider"
          type="range"
          min={1}
          max={64}
          value={size}
          onChange={(e) => onChangeSize(Number(e.target.value))}
          className="w-full vesper-slider"
        />
      </div>

      {/* Opacity Slider (Brush only) */}
      {!isEraser && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="vesper-opacity-slider" className="text-[#A4B0C1]">
              Pigment Opacity
            </label>
            <span className="font-mono text-[#718096] tabular-nums">
              {Math.round(opacity * 100)}%
            </span>
          </div>
          <input
            id="vesper-opacity-slider"
            type="range"
            min={15}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(e) => onChangeOpacity(Number(e.target.value) / 100)}
            className="w-full vesper-slider"
          />
        </div>
      )}

      {/* Adaptive Smoothing Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="vesper-smoothing-slider" className="text-[#A4B0C1]">
            Gesture Stabilization
          </label>
          <span className="font-mono text-[#718096] tabular-nums">
            {Math.round(smoothing * 100)}%
          </span>
        </div>
        <input
          id="vesper-smoothing-slider"
          type="range"
          min={10}
          max={90}
          value={Math.round(smoothing * 100)}
          onChange={(e) => onChangeSmoothing(Number(e.target.value) / 100)}
          className="w-full vesper-slider"
        />
      </div>
    </div>
  );
};
