import React from 'react';
import { BRUSH_PRESETS, BRUSH_SIZE_PRESETS, ToolType } from '../../types/drawing';

export interface BrushSettingsProps {
  tool: ToolType;
  color: string;
  size: number;
  opacity: number;
  smoothing: number;
  activePresetId: string;
  enableGestureEraser: boolean;
  onApplyPreset: (presetId: string) => void;
  onChangeSize: (size: number) => void;
  onChangeOpacity: (opacity: number) => void;
  onChangeSmoothing: (smoothing: number) => void;
  onToggleGestureEraser: () => void;
}

export const BrushSettings: React.FC<BrushSettingsProps> = ({
  tool,
  color,
  size,
  opacity,
  smoothing,
  activePresetId,
  enableGestureEraser,
  onApplyPreset,
  onChangeSize,
  onChangeOpacity,
  onChangeSmoothing,
  onToggleGestureEraser,
}) => {
  const isEraser = tool === ToolType.ERASER;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#F0F2F6]">
          {isEraser ? 'Eraser Dynamics' : 'Instrument Dynamics'}
        </span>
        <span className="font-mono text-xs text-[#D5B879] tabular-nums">
          {size}px
        </span>
      </div>

      {/* Preset Pills */}
      <div className="grid grid-cols-2 gap-1.5">
        {BRUSH_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.id)}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors text-left flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#0B1220] border border-[#D5B879] text-[#D5B879]'
                  : 'bg-[#0B1220]/60 border border-[#243247] text-[#A4B0C1] hover:text-[#F0F2F6]'
              }`}
            >
              <span>{preset.name}</span>
              <span className="font-mono text-[10px] text-[#718096]">
                {preset.size}px
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Brush Tip Miniature on Warm Ivory Plate */}
      <div className="h-14 rounded-lg bg-[#F7F5F0] border border-[#243247] flex items-center justify-between px-4">
        <span className="text-[11px] font-medium text-[#475569]">
          {isEraser ? 'Eraser Tip Diameter' : 'Stroke Caliber'}
        </span>
        <div className="w-12 h-12 flex items-center justify-center">
          <div
            className="rounded-full transition-all duration-100"
            style={{
              width: `${Math.max(4, Math.min(44, size))}px`,
              height: `${Math.max(4, Math.min(44, size))}px`,
              backgroundColor: isEraser ? '#F87171' : color,
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
      <div className="grid grid-cols-6 gap-1.5">
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
            Caliber Diameter
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
            Movement Stabilization
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

      {/* V-Sign Gesture Eraser Toggle */}
      <div className="rounded-lg bg-[#0B1220] border border-[#243247] p-3 flex items-center justify-between gap-3 text-xs">
        <div>
          <div className="font-medium text-[#F0F2F6]">V-Sign Gesture Eraser</div>
          <div className="text-[11px] text-[#718096] mt-0.5">
            Hold 2 fingers up (Peace gesture) to erase instantly
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enableGestureEraser}
          onClick={onToggleGestureEraser}
          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
            enableGestureEraser ? 'bg-[#D5B879]' : 'bg-[#243247]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#0B1220] transition-transform ${
              enableGestureEraser ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
