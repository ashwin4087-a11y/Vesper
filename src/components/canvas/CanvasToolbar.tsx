import React, { useState } from 'react';
import {
  Brush,
  Eraser,
  Minus,
  Paintbrush,
  Plus,
  Redo2,
  Trash2,
  Undo2,
} from 'lucide-react';
import { BRUSH_PRESETS, ToolType } from '../../types/drawing';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

export interface CanvasToolbarProps {
  activeTool: ToolType;
  activeSize: number;
  activeColor: string;
  activePresetId: string;
  canUndo: boolean;
  canRedo: boolean;
  strokeCount: number;
  onSelectTool: (tool: ToolType) => void;
  onApplyPreset: (presetId: string) => void;
  onChangeSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRequestClear: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  activeTool,
  activeSize,
  activeColor,
  activePresetId,
  canUndo,
  canRedo,
  strokeCount,
  onSelectTool,
  onApplyPreset,
  onChangeSize,
  onUndo,
  onRedo,
  onRequestClear,
}) => {
  const [presetsOpen, setPresetsOpen] = useState(false);

  return (
    <aside
      aria-label="Drawing Tools"
      className="w-14 sm:w-16 bg-[#151E2D] border-r border-[#243247] flex flex-col items-center justify-between py-4 px-2 select-none shrink-0 z-20"
    >
      {/* Top Group: Brush, Eraser, Presets */}
      <div className="flex flex-col items-center gap-2 w-full relative">
        <Tooltip content="Studio Brush" shortcut="B" side="right">
          <Button
            variant="tool"
            size="icon"
            active={activeTool === ToolType.BRUSH}
            onClick={() => onSelectTool(ToolType.BRUSH)}
            aria-label="Brush Tool"
            className="relative"
          >
            <Brush className="w-4 h-4" />
            {activeTool === ToolType.BRUSH && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#D5B879] rounded-r"
              />
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Precision Eraser" shortcut="E" side="right">
          <Button
            variant="tool"
            size="icon"
            active={activeTool === ToolType.ERASER}
            onClick={() => onSelectTool(ToolType.ERASER)}
            aria-label="Eraser Tool"
            className="relative"
          >
            <Eraser className="w-4 h-4" />
            {activeTool === ToolType.ERASER && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#D5B879] rounded-r"
              />
            )}
          </Button>
        </Tooltip>

        {/* Brush Dynamics Presets Popover Toggle */}
        <Tooltip content="Instrument Presets" side="right">
          <Button
            variant="tool"
            size="icon"
            active={presetsOpen}
            onClick={() => setPresetsOpen((prev) => !prev)}
            aria-label="Brush Presets"
          >
            <Paintbrush className="w-4 h-4" />
          </Button>
        </Tooltip>

        {/* Floating Presets Dropdown */}
        {presetsOpen && (
          <div className="absolute left-16 top-12 z-50 w-56 rounded-xl bg-[#151E2D] border border-[#243247] p-2 shadow-2xl space-y-1">
            <div className="text-[10px] uppercase font-semibold text-[#718096] px-2 py-1">
              Instrument Presets
            </div>
            {BRUSH_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onApplyPreset(preset.id);
                    setPresetsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex flex-col transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B1220] border border-[#D5B879] text-[#F0F2F6]'
                      : 'hover:bg-[#243247]/50 text-[#A4B0C1]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={isSelected ? 'text-[#D5B879]' : ''}>
                      {preset.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#718096] tabular-nums">
                      {preset.size}px
                    </span>
                  </div>
                  <span className="text-[10px] text-[#718096] truncate">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="w-8 h-px bg-[#243247] my-1.5" />

        {/* Caliber Stepper Controls */}
        <Tooltip content="Increase Caliber" shortcut="]" side="right">
          <Button
            variant="tool"
            size="icon"
            onClick={() => onChangeSize(activeSize + 3)}
            aria-label="Increase Brush Size"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div
          className="flex flex-col items-center py-1"
          title={`Current size: ${activeSize}px`}
        >
          <div className="w-7 h-7 rounded-md bg-[#0B1220] border border-[#243247] flex items-center justify-center">
            <span
              className="rounded-full transition-all duration-150"
              style={{
                width: `${Math.max(3, Math.min(20, activeSize * 0.45))}px`,
                height: `${Math.max(3, Math.min(20, activeSize * 0.45))}px`,
                backgroundColor:
                  activeTool === ToolType.ERASER ? '#F87171' : activeColor,
                border:
                  activeTool === ToolType.ERASER
                    ? '1.5px dashed #D5B879'
                    : activeColor.toLowerCase() === '#0b1220'
                      ? '1px solid #A4B0C1'
                      : 'none',
              }}
            />
          </div>
          <span className="mt-1 font-mono text-[10px] text-[#A4B0C1] tabular-nums">
            {activeSize}px
          </span>
        </div>

        <Tooltip content="Decrease Caliber" shortcut="[" side="right">
          <Button
            variant="tool"
            size="icon"
            onClick={() => onChangeSize(activeSize - 3)}
            aria-label="Decrease Brush Size"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>

      {/* Bottom Group: History (Undo, Redo, Clear) */}
      <div className="flex flex-col items-center gap-2 w-full">
        <Tooltip content="Undo Stroke" shortcut="⌘Z" side="right">
          <Button
            variant="tool"
            size="icon"
            disabled={!canUndo}
            onClick={onUndo}
            aria-label="Undo Stroke"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Redo Stroke" shortcut="⇧⌘Z" side="right">
          <Button
            variant="tool"
            size="icon"
            disabled={!canRedo}
            onClick={onRedo}
            aria-label="Redo Stroke"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </Tooltip>

        <div className="w-8 h-px bg-[#243247] my-1" />

        <Tooltip content="Clear Canvas" side="right">
          <Button
            variant="tool"
            size="icon"
            disabled={strokeCount === 0}
            onClick={onRequestClear}
            aria-label="Clear Canvas"
            className="hover:text-[#F87171]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>
    </aside>
  );
};
