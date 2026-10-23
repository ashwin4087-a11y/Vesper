# VESPER — Gesture-Based Creative Studio

> **A canvas beyond touch.**  
> Your hand is the brush; your movement is the medium.

VESPER is a browser-based creative studio for drawing and painting on a digital canvas using real-time hand gestures captured through your webcam. Powered by **MediaPipe Tasks Vision (Hand Landmarker)** and an independent **HTML5 Canvas quadratic spline engine**, VESPER translates physical hand movement into expressive digital artwork with zero cloud uploads.

---

## Features

- **Real-Time 21-Point Hand Tracking**: Uses MediaPipe Hand Landmarker in `VIDEO` mode (`requestAnimationFrame`) with GPU acceleration and automatic CPU fallback.
- **Dedicated Gesture Recognition Engine**:
  - **Draw Gesture**: Raise your **index finger** (Landmark `8`) with middle, ring, and pinky fingers folded to paint continuous smooth strokes.
  - **Pause / Hover Gesture**: Open your palm or lower your index finger to lift the brush cleanly while maintaining a live spatial reticle on the canvas.
  - **Pinch Gesture**: Bring your **thumb tip** (`4`) and **index fingertip** (`8`) together within a configurable threshold to cycle through the studio pigment palette without ever erasing your canvas.
- **Independent HTML5 Vector Spline Engine**:
  - Quadratic midpoint curve interpolation (`quadraticCurveTo`) with adaptive velocity-aware exponential smoothing.
  - High-DPI (`window.devicePixelRatio`) Retina canvas rendering.
  - Structured stroke history (`Stroke[]`) supporting lossless **Undo**, **Redo**, proportional **Window Resizing**, and **PNG Export** composited onto a warm Ivory (`#F7F5F0`) paper surface.
  - Dedicated **Eraser** (`destination-out` compositing) that removes only affected artwork while preserving the warm ivory canvas.
- **Full Mouse & Trackpad Fallback**: Draw seamlessly with a mouse, stylus, or trackpad at any time—even without a webcam.
- **Privacy-First Camera Lifecycle**: Never requests camera permissions automatically. Stopping the camera or exiting the studio immediately releases all media tracks and disposes tracking resources.

---

## Design System

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Midnight** | `#0B1220` | Main application background |
| **Obsidian Blue** | `#151E2D` | Panels, sidebars, elevated surfaces |
| **Slate** | `#243247` | Hairline borders, dividers, secondary controls |
| **Vesper Gold** | `#D5B879` | Primary brand accent, active tools, key actions |
| **Ivory** | `#F7F5F0` | Main drawing canvas |
| **Mist** | `#E6EAF0` | Light surfaces, subtle canvas elements |
| **Primary Text** | `#F0F2F6` | Main text on dark surfaces |
| **Secondary Text** | `#A4B0C1` | Supporting text |
| **Muted Text** | `#718096` | Labels and metadata |

- **Typography**: `Bricolage Grotesque` (600, 700, 800) for display headings and branding; `Inter` (400, 500, 600) for studio controls; `JetBrains Mono` for tabular numeric readouts.

---

## Project Architecture

```text
src/
├── components/
│   ├── layout/       TopBar.tsx, Sidebar.tsx, StatusBar.tsx
│   ├── canvas/       DrawingCanvas.tsx, CanvasToolbar.tsx, ColorPalette.tsx, BrushSettings.tsx
│   ├── camera/       CameraPreview.tsx, CameraControls.tsx, TrackingStatus.tsx
│   ├── onboarding/   WelcomeScreen.tsx, GestureGuide.tsx
│   └── ui/           Button.tsx, Tooltip.tsx, Dialog.tsx
├── hooks/            useCamera.ts, useHandTracking.ts, useDrawing.ts
├── lib/              handTracking.ts, gestureRecognition.ts, drawingEngine.ts,
│                     canvasUtils.ts, coordinateMapping.ts
├── types/            hand.ts, drawing.ts
├── styles/           globals.css
├── App.tsx
└── main.tsx
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **pnpm**
- A webcam (optional; mouse drawing works out of the box)
- A modern browser with WebGL / WebAssembly support

### Installation

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Usage & Keyboard Shortcuts

1. Click **Enter Studio** from the welcome screen.
2. Click **Enable Camera** in the right-hand panel to grant webcam access.
3. Hold your hand in front of the camera and **raise your index finger** (other fingers folded) to draw.
4. **Open your palm** or lower your index finger to pause between strokes.
5. Click **Save Artwork** in the top bar to export a high-resolution PNG.

| Shortcut | Action |
| :--- | :--- |
| `B` | Select Brush tool |
| `E` | Select Eraser tool |
| `[` / `]` | Decrease / Increase brush or eraser size |
| `1` – `8` | Select pigment from the 8-color VESPER palette |
| `L` | Toggle 21-point hand landmark skeleton overlay |
| `Ctrl+Z` / `⌘Z` | Undo last stroke |
| `Ctrl+Y` / `⇧⌘Z` | Redo stroke |
| `?` | Open Studio Gesture Guide |
