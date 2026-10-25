import { useEffect } from 'react';
import { ToolType, VESPER_PALETTE } from '../types/drawing';
import { CameraState } from '../types/hand';

export interface UseKeyboardShortcutsOptions {
  enabled: boolean;
  activeSize: number;
  cameraState: CameraState;
  onSelectTool: (tool: ToolType) => void;
  onSelectColor: (hex: string) => void;
  onChangeSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleCamera: () => void;
  onOpenExportDialog: () => void;
  onToggleGuide: () => void;
  onToggleLandmarks?: () => void;
  onEscape?: () => void;
}

/**
 * Global Keyboard Shortcuts hook for VESPER Studio.
 * Supports B (Brush), E (Eraser), [ / ] (Size), Ctrl/Cmd+Z (Undo),
 * Ctrl/Cmd+Shift+Z / Ctrl/Cmd+Y (Redo), Space (Camera pause / toggle),
 * Esc (Close / cancel), 1-8 (Pigments), ? (Help guide).
 * Automatically suppresses triggers when active in inputs, textareas, or contentEditable.
 */
export function useKeyboardShortcuts({
  enabled,
  activeSize,
  cameraState,
  onSelectTool,
  onSelectColor,
  onChangeSize,
  onUndo,
  onRedo,
  onToggleCamera,
  onOpenExportDialog,
  onToggleGuide,
  onToggleLandmarks,
  onEscape,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        // If Escape is pressed in an input, blur it
        if (e.key === 'Escape') {
          target.blur();
          onEscape?.();
        }
        return;
      }

      // Escape: close open dialogs or cancel interaction
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape?.();
        return;
      }

      // Undo / Redo (Ctrl+Z, Cmd+Z, Ctrl+Shift+Z, Cmd+Shift+Z, Ctrl+Y, Cmd+Y)
      if (e.metaKey || e.ctrlKey) {
        const keyLower = e.key.toLowerCase();
        if (keyLower === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            onRedo();
          } else {
            onUndo();
          }
          return;
        }

        if (keyLower === 'y') {
          e.preventDefault();
          onRedo();
          return;
        }

        // Export hotkey (Ctrl+S / Cmd+S)
        if (keyLower === 's') {
          e.preventDefault();
          onOpenExportDialog();
          return;
        }

        return;
      }

      if (e.altKey) return;

      const key = e.key.toLowerCase();

      // B: Select Brush
      if (key === 'b') {
        e.preventDefault();
        onSelectTool(ToolType.BRUSH);
        return;
      }

      // E: Select Eraser
      if (key === 'e') {
        e.preventDefault();
        onSelectTool(ToolType.ERASER);
        return;
      }

      // L: Toggle Landmarks
      if (key === 'l') {
        e.preventDefault();
        onToggleLandmarks?.();
        return;
      }

      // [ and ]: Decrease / Increase brush size
      if (e.key === '[') {
        e.preventDefault();
        onChangeSize(Math.max(1, activeSize - 3));
        return;
      }

      if (e.key === ']') {
        e.preventDefault();
        onChangeSize(Math.min(64, activeSize + 3));
        return;
      }

      // ?: Toggle Gesture Guide
      if (e.key === '?') {
        e.preventDefault();
        onToggleGuide();
        return;
      }

      // Space: Toggle or Pause Camera stream
      if (e.code === 'Space') {
        e.preventDefault();
        onToggleCamera();
        return;
      }

      // 1-8: Palette Color shortcuts
      if (/^[1-8]$/.test(e.key)) {
        e.preventDefault();
        const index = Number(e.key) - 1;
        if (VESPER_PALETTE[index]) {
          onSelectColor(VESPER_PALETTE[index].hex);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    activeSize,
    cameraState,
    onSelectTool,
    onSelectColor,
    onChangeSize,
    onUndo,
    onRedo,
    onToggleCamera,
    onOpenExportDialog,
    onToggleGuide,
    onToggleLandmarks,
    onEscape,
  ]);
}
