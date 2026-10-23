export enum ToolType {
  BRUSH = 'BRUSH',
  ERASER = 'ERASER',
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  smoothing: number;
  tool: ToolType;
  timestamp: number;
}

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
  shortcut: string;
}

export const VESPER_PALETTE: PaletteColor[] = [
  { id: 'champagne-gold', name: 'Champagne Gold', hex: '#D5B879', shortcut: '1' },
  { id: 'midnight-blue', name: 'Midnight Blue', hex: '#0B1220', shortcut: '2' },
  { id: 'ivory', name: 'Ivory', hex: '#F7F5F0', shortcut: '3' },
  { id: 'slate', name: 'Slate', hex: '#475569', shortcut: '4' },
  { id: 'crimson', name: 'Crimson', hex: '#BE123C', shortcut: '5' },
  { id: 'emerald', name: 'Emerald', hex: '#047857', shortcut: '6' },
  { id: 'cobalt', name: 'Cobalt', hex: '#1D4ED8', shortcut: '7' },
  { id: 'violet', name: 'Violet', hex: '#6D28D9', shortcut: '8' },
];

export const BRUSH_SIZE_PRESETS = [3, 6, 12, 24, 42];

export interface DrawingSettings {
  tool: ToolType;
  color: string;
  brushSize: number;
  eraserSize: number;
  opacity: number;
  smoothing: number;
  pinchThreshold: number;
  showLandmarks: boolean;
  enablePinchColorCycle: boolean;
}
