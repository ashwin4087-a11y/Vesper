import React from 'react';
import {
  Brush,
  Eraser,
  Minus,
  Plus,
  Redo2,
  Trash2,
  Undo2,
} from 'lucide-react';
import { ToolType } from '../../types/drawing';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

export interface CanvasToolbarProps {
  activeTool: ToolType;
  activeSize: number;
  activeColor: string;
  canUndo: boolean;
  canRedo: boolean;
  strokeCount: number;
  onSelectTool: (tool: ToolType) => void;
  onChangeSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onRequestClear: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  activeTool,
  activeSize,
  activeColor,
  canUndo,
  canRedo,
  strokeCount,
  onSelectTool,
  onChangeSize,
  onUndo,
  onRedo,
  onRequestClear,
}) => {
  return (
    <aside
      aria-label="Drawing Tools"
      className="w-14 sm:w-16 bg-[#151E2D] border-r border-[#243247] flex flex-col items-center justify-between py-4 px-2 select-none shrink-0 z-20"
    >
      {/* Top Group: Brush & Eraser */}
      <div className="flex flex-col items-center gap-2 w-full">
        <Tooltip content="Brush Tool" shortcut="B" side="right">
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

        <Tooltip content="Eraser Tool" shortcut="E" side="right">
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

        <div className="w-8 h-px bg-[#243247] my-1.5" />

        {/* Brush Size Stepper Controls */}
        <Tooltip content="Increase Size" shortcut="]" side="right">
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
              className="rounded-full"
              style={{
                width: `${Math.max(3, Math.min(20, activeSize * 0.45))}px`,
                height: `${Math.max(3, Math.min(20, activeSize * 0.45))}px`,
                backgroundColor:
                  activeTool === ToolType.ERASER ? '#F7F5F0' : activeColor,
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

        <Tooltip content="Decrease Size" shortcut="[" side="right">
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
