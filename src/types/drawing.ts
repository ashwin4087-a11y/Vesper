export enum ToolType {
  BRUSH = 'BRUSH',
  ERASER = 'ERASER',
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  velocity?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  smoothing: number;
  tool: ToolType;
  presetId?: string;
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

export const BRUSH_SIZE_PRESETS = [3, 6, 10, 18, 32, 48];

export interface BrushPreset {
  id: string;
  name: string;
  description: string;
  size: number;
  opacity: number;
  smoothing: number;
  tool: ToolType;
}

export const BRUSH_PRESETS: BrushPreset[] = [
  {
    id: 'fine-ink',
    name: 'Fine Ink',
    description: 'Crisp technical contouring with velocity taper',
    size: 3,
    opacity: 1,
    smoothing: 0.45,
    tool: ToolType.BRUSH,
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy',
    description: 'Broad-edge dynamic nib with directional caliber variation',
    size: 14,
    opacity: 0.95,
    smoothing: 0.65,
    tool: ToolType.BRUSH,
  },
  {
    id: 'chisel-marker',
    name: 'Chisel Marker',
    description: 'Architectural flat angled ribbon footprint with bold coverage',
    size: 22,
    opacity: 0.82,
    smoothing: 0.5,
    tool: ToolType.BRUSH,
  },
  {
    id: 'soft-graphite',
    name: 'Soft Graphite',
    description: 'Velvety translucent pigment for shading & washes',
    size: 18,
    opacity: 0.42,
    smoothing: 0.7,
    tool: ToolType.BRUSH,
  },
  {
    id: 'eraser',
    name: 'Eraser',
    description: 'Clean sub-pixel subtractive eraser',
    size: 28,
    opacity: 1,
    smoothing: 0.4,
    tool: ToolType.ERASER,
  },
];

export interface CanvasBackground {
  id: string;
  name: string;
  hex: string;
  textColor: string;
  grid: boolean;
}

export const CANVAS_BACKGROUNDS: CanvasBackground[] = [
  {
    id: 'warm-ivory',
    name: 'Warm Ivory',
    hex: '#F7F5F0',
    textColor: '#0B1220',
    grid: false,
  },
  {
    id: 'studio-grid',
    name: 'Studio Grid',
    hex: '#F7F5F0',
    textColor: '#0B1220',
    grid: true,
  },
  {
    id: 'pure-white',
    name: 'Pure White',
    hex: '#FFFFFF',
    textColor: '#0B1220',
    grid: false,
  },
  {
    id: 'midnight-studio',
    name: 'Midnight Studio',
    hex: '#0B1220',
    textColor: '#F0F2F6',
    grid: false,
  },
];

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
  enableGestureEraser: boolean;
  activePresetId: string;
  background: CanvasBackground;
}

export interface ExportSettings {
  title: string;
  transparentBackground: boolean;
  backgroundId?: string;
  scale: 1 | 2;
}
