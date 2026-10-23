import React, { useState } from 'react';
import { ArrowRight, Camera, Hand, Layers, ShieldCheck, Sliders } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { GestureGuide } from './GestureGuide';

export interface WelcomeScreenProps {
  onEnterStudio: (autoStartCamera?: boolean) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnterStudio,
}) => {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F0F2F6] flex flex-col justify-between selection:bg-[#D5B879]/25">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Single-line Nav Links) — Zone 3 (1 Primary CTA) */}
      <header className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-8 px-6 md:px-12 py-5 border-b border-[#243247]">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
          }}
          className="font-display text-[28px] font-bold tracking-tight text-[#F0F2F6] uppercase whitespace-nowrap shrink-0"
        >
          VESPER
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A4B0C1]">
          <button
            type="button"
            onClick={() => setHowItWorksOpen(true)}
            className="hover:text-[#F0F2F6] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How It Works
          </button>
          <a
            href="#workflow"
            className="hover:text-[#F0F2F6] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Gesture Workflow
          </a>
          <a
            href="#privacy"
            className="hover:text-[#F0F2F6] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Camera Privacy
          </a>
          <a
            href="#architecture"
            className="hover:text-[#F0F2F6] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Drawing Engine
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => onEnterStudio(false)}
          >
            <span>Enter Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Split-Screen Hero */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Editorial Identity & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-wider uppercase text-[#D5B879] mb-4">
                A canvas beyond touch
              </p>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#F0F2F6] tracking-tight leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Your hand is the brush. Your movement is the medium.
              </h1>

              <p className="mt-6 text-base text-[#A4B0C1] leading-relaxed max-w-[60ch]">
                VESPER is a browser-based creative studio that transforms
                physical hand movement into expressive digital artwork through
                real-time MediaPipe computer vision and quadratic spline brush
                interpolation.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onEnterStudio(false)}
                >
                  <span>Enter Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setHowItWorksOpen(true)}
                >
                  <span>How It Works</span>
                </Button>
              </div>
            </div>

            {/* Camera Permission & Privacy Explanation */}
            <div
              id="privacy"
              className="mt-10 pt-6 border-t border-[#243247] flex items-start gap-3.5"
            >
              <ShieldCheck className="w-5 h-5 text-[#D5B879] shrink-0 mt-0.5" />
              <div className="text-xs text-[#A4B0C1] leading-relaxed">
                <span className="font-semibold text-[#F0F2F6]">
                  Explicit Camera Consent:
                </span>{' '}
                VESPER never requests webcam access automatically. You enter the
                studio first and activate the camera only when ready. All
                21-point hand landmark inference runs locally in your browser
                via WebAssembly and WebGL—no video feed is ever uploaded or
                stored.
              </div>
            </div>
          </div>

          {/* Right Column: Subtle Visual of Hand Movement Becoming a Drawing */}
          <div className="lg:col-span-6 flex">
            <div className="w-full rounded-xl bg-[#151E2D] border border-[#243247] p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#243247]">
                <div className="flex items-center gap-2 text-xs text-[#A4B0C1]">
                  <span className="font-medium text-[#F0F2F6]">
                    Spatial Stroke Translation
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Landmark 08 (Index Tip)</span>
                </div>
                <span className="font-mono text-xs text-[#D5B879] tabular-nums">
                  60 FPS Vector Spline
                </span>
              </div>

              {/* Warm Ivory Canvas Preview Plate */}
              <div className="my-5 relative rounded-lg bg-[#F7F5F0] border border-[#243247] aspect-[16/10] overflow-hidden flex items-center justify-center p-6">
                <svg
                  viewBox="0 0 600 360"
                  className="w-full h-full"
                  aria-label="Illustration of hand landmarks translating into a continuous calligraphic stroke on warm ivory paper"
                >
                  {/* Subtle studio drafting grid lines on ivory surface */}
                  <line
                    x1="0"
                    y1="90"
                    x2="600"
                    y2="90"
                    stroke="#E6EAF0"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="180"
                    x2="600"
                    y2="180"
                    stroke="#E6EAF0"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="270"
                    x2="600"
                    y2="270"
                    stroke="#E6EAF0"
                    strokeWidth="1"
                  />
                  <line
                    x1="150"
                    y1="0"
                    x2="150"
                    y2="360"
                    stroke="#E6EAF0"
                    strokeWidth="1"
                  />
                  <line
                    x1="300"
                    y1="0"
                    x2="300"
                    y2="360"
                    stroke="#E6EAF0"
                    strokeWidth="1"
                  />
                  <line
                    x1="450"
                    y1="0"
                    x2="450"
                    y2="360"
                    stroke="#E6EAF0"
                    strokeWidth="1"
                  />

                  {/* Secondary Champagne Gold gesture trail */}
                  <path
                    d="M 78 265 C 135 240, 175 110, 250 135 C 325 160, 340 250, 420 205 C 460 182, 488 125, 512 96"
                    fill="none"
                    stroke="#D5B879"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.45"
                  />

                  {/* Primary Midnight Blue calligraphic artwork stroke */}
                  <path
                    d="M 78 265 C 135 240, 175 110, 250 135 C 325 160, 340 250, 420 205 C 460 182, 488 125, 512 96"
                    fill="none"
                    stroke="#0B1220"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interpolated spline midpoints along the stroke */}
                  <circle cx="158" cy="182" r="3" fill="#D5B879" />
                  <circle cx="250" cy="135" r="3" fill="#D5B879" />
                  <circle cx="342" cy="198" r="3" fill="#D5B879" />
                  <circle cx="420" cy="205" r="3" fill="#D5B879" />

                  {/* Stylized 21-point Hand Skeleton converging at Index Tip (512, 96) */}
                  <g stroke="#243247" strokeWidth="1.5" opacity="0.85">
                    {/* Wrist (485, 290) to Index MCP (492, 195) to Index Tip (512, 96) */}
                    <line x1="485" y1="290" x2="455" y2="235" />
                    <line x1="455" y1="235" x2="442" y2="195" />
                    <line x1="485" y1="290" x2="492" y2="195" />
                    <line x1="492" y1="195" x2="500" y2="155" />
                    <line x1="500" y1="155" x2="506" y2="124" />
                    <line x1="506" y1="124" x2="512" y2="96" />

                    {/* Folded Middle, Ring, Pinky joints */}
                    <line x1="485" y1="290" x2="516" y2="205" />
                    <line x1="516" y1="205" x2="522" y2="232" />
                    <line x1="485" y1="290" x2="536" y2="218" />
                    <line x1="536" y1="218" x2="538" y2="244" />
                    <line x1="485" y1="290" x2="552" y2="234" />
                    <line x1="552" y1="234" x2="550" y2="256" />
                    {/* Palm bridge */}
                    <line x1="492" y1="195" x2="516" y2="205" />
                    <line x1="516" y1="205" x2="536" y2="218" />
                    <line x1="536" y1="218" x2="552" y2="234" />
                  </g>

                  {/* Hand Landmark Nodes */}
                  <circle cx="485" cy="290" r="3.5" fill="#243247" />
                  <circle cx="442" cy="195" r="3.5" fill="#243247" />
                  <circle cx="492" cy="195" r="3.5" fill="#243247" />
                  <circle cx="500" cy="155" r="3" fill="#243247" />
                  <circle cx="506" cy="124" r="3" fill="#243247" />
                  <circle cx="522" cy="232" r="3" fill="#718096" />
                  <circle cx="538" cy="244" r="3" fill="#718096" />
                  <circle cx="550" cy="256" r="3" fill="#718096" />

                  {/* Active Index Fingertip (Landmark 8) Precision Cursor */}
                  <circle
                    cx="512"
                    cy="96"
                    r="16"
                    fill="none"
                    stroke="#D5B879"
                    strokeWidth="1.75"
                  />
                  <circle cx="512" cy="96" r="6" fill="#D5B879" />
                  <circle cx="512" cy="96" r="2.5" fill="#0B1220" />
                </svg>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-[#475569] font-mono">
                  <span>CANVAS: #F7F5F0 WARM IVORY</span>
                  <span>INDEX TIP [08] → DRAW ACTIVE</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <div className="text-[#718096]">Raise Index</div>
                  <div className="font-medium text-[#F0F2F6] mt-0.5">
                    Engage Brush
                  </div>
                </div>
                <div>
                  <div className="text-[#718096]">Open Palm</div>
                  <div className="font-medium text-[#F0F2F6] mt-0.5">
                    Hover &amp; Pause
                  </div>
                </div>
                <div>
                  <div className="text-[#718096]">Thumb + Index</div>
                  <div className="font-medium text-[#F0F2F6] mt-0.5">
                    Pinch Pigment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 5-Step Onboarding Strip Below Hero Split */}
        <section
          id="workflow"
          aria-label="Studio Onboarding Steps"
          className="mt-14 pt-10 border-t border-[#243247]"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#F0F2F6]">
                Five Steps from Gesture to Artwork
              </h2>
              <p className="text-sm text-[#A4B0C1] mt-1">
                Designed for effortless touch-free control with full mouse and
                trackpad fallback at any time.
              </p>
            </div>
            <span className="text-xs text-[#718096] font-mono tabular-nums">
              640×480 Tracking · Retina Canvas Export
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                step: '01.',
                title: 'Allow Camera Access',
                desc: 'Activate your webcam inside the studio when ready, or sketch directly with your cursor.',
              },
              {
                step: '02.',
                title: 'Raise Index Finger',
                desc: 'Extend your index finger while keeping your middle, ring, and pinky fingers folded.',
              },
              {
                step: '03.',
                title: 'Move to Draw',
                desc: 'Glide your hand in the air. Mirrored coordinates map smoothly across the warm ivory canvas.',
              },
              {
                step: '04.',
                title: 'Lower or Open to Pause',
                desc: 'Open your palm or fold your index finger to lift the brush cleanly between separate strokes.',
              },
              {
                step: '05.',
                title: 'Select Tools & Export',
                desc: 'Pinch thumb and index fingertips to cycle pigments, refine brush size, and save high-DPI PNGs.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="pt-4 border-t border-[#243247] flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-semibold text-[#D5B879] tabular-nums">
                    {item.step}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold text-[#F0F2F6]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#A4B0C1] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture & Studio Specifications */}
        <section
          id="architecture"
          aria-label="Studio Technical Specifications"
          className="mt-12 pt-8 border-t border-[#243247] grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="flex items-start gap-3.5">
            <Camera className="w-4 h-4 text-[#D5B879] shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-semibold text-[#F0F2F6]">
                MediaPipe Hand Landmarker
              </h3>
              <p className="mt-1 text-xs text-[#A4B0C1] leading-relaxed">
                Tracks 21 3D hand knuckles in real time (`VIDEO` mode) with
                mirrored coordinate projection and adaptive velocity smoothing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Layers className="w-4 h-4 text-[#D5B879] shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-semibold text-[#F0F2F6]">
                Structured Stroke History
              </h3>
              <p className="mt-1 text-xs text-[#A4B0C1] leading-relaxed">
                Every stroke is stored as vector geometry with color, brush
                caliber, tool mode, and timestamp—enabling lossless undo, redo,
                and window resizing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Sliders className="w-4 h-4 text-[#D5B879] shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-semibold text-[#F0F2F6]">
                Curated Eight-Pigment Palette
              </h3>
              <p className="mt-1 text-xs text-[#A4B0C1] leading-relaxed">
                Paint with Champagne Gold, Midnight Blue, Warm Ivory, Slate,
                Crimson, Emerald, Cobalt, and Violet on a warm cotton-ivory
                surface.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-5 border-t border-[#243247] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718096]">
        <div>VESPER Creative Studio · A canvas beyond touch</div>
        <div className="flex items-center gap-3">
          <span>Client-Side Computer Vision</span>
          <span aria-hidden="true">·</span>
          <span>HTML5 Vector Spline Engine</span>
        </div>
      </footer>

      {/* How It Works Modal Dialog */}
      <Dialog
        open={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        title="How VESPER Works"
        description="Turn natural hand movement in front of your webcam into expressive digital brushwork."
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-5">
          <GestureGuide />

          <div className="rounded-lg bg-[#0B1220] border border-[#243247] p-4 space-y-2 text-xs text-[#A4B0C1]">
            <div className="flex items-center gap-2 font-semibold text-[#F0F2F6]">
              <Hand className="w-4 h-4 text-[#D5B879]" />
              <span>Tracked Hand Landmarks</span>
            </div>
            <p className="leading-relaxed">
              VESPER monitors Landmark 8 (Index Fingertip) for brush positioning,
              Landmark 4 (Thumb Tip) for pinch distance, and Landmarks 5, 12,
              16, and 20 to distinguish drawing posture from hovering or open
              palm pauses.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setHowItWorksOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setHowItWorksOpen(false);
                onEnterStudio(false);
              }}
            >
              <span>Enter Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
