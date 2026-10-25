import React, { useState } from 'react';
import {
  ArrowRight,
  Camera,
  Compass,
  Cpu,
  Hand,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
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
  const [gestureGuideOpen, setGestureGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F0F2F6] flex flex-col justify-between selection:bg-[#D5B879]/25">
      {/* Top Header: Brand Wordmark & Navigation */}
      <header className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-8 px-6 md:px-12 py-5 border-b border-[#243247]">
        <div className="flex items-center gap-3">
          <span className="font-display text-[26px] font-bold tracking-tight text-[#F0F2F6] uppercase whitespace-nowrap">
            VESPER
          </span>
          <span className="hidden sm:inline text-xs font-mono text-[#D5B879] pl-2 border-l border-[#243247]">
            v2.0 Spatial Studio
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#A4B0C1]">
          <button
            type="button"
            onClick={() => setHowItWorksOpen(true)}
            className="hover:text-[#F0F2F6] transition-colors whitespace-nowrap cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => setGestureGuideOpen(true)}
            className="hover:text-[#F0F2F6] transition-colors whitespace-nowrap cursor-pointer"
          >
            Gesture Vocabulary
          </button>
          <span className="text-[#718096]">On-Device WebAssembly</span>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
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

      {/* Main Split-Screen Section */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Monograph Editorial Identity */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#151E2D] border border-[#243247] px-3 py-1 text-xs text-[#D5B879] mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-medium">A canvas beyond touch.</span>
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#F0F2F6] tracking-tight leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Your hand is the instrument. Your gesture is the mark.
              </h1>

              <p className="mt-6 text-base text-[#A4B0C1] leading-relaxed max-w-[56ch]">
                VESPER is an intelligent browser-based drawing studio that translates
                subtle physical hand movement into organic calligraphic lines. Powered
                by 21-point optical landmark tracking, quadratic spline interpolation,
                and velocity dynamics.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
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
                  onClick={() => onEnterStudio(true)}
                >
                  <Camera className="w-4 h-4 text-[#D5B879]" />
                  <span>Launch With Camera</span>
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setHowItWorksOpen(true)}
                >
                  <span>How It Works</span>
                </Button>
              </div>
            </div>

            {/* Privacy & Technology Guarantees */}
            <div className="mt-12 pt-6 border-t border-[#243247] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A4B0C1]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#D5B879] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#F0F2F6] block">
                    Zero Camera Streaming
                  </span>
                  Video remains 100% on your machine. Processed locally via GPU/WASM.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Compass className="w-4 h-4 text-[#D5B879] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#F0F2F6] block">
                    Dual Input Modality
                  </span>
                  Full gesture drawing or direct mouse/trackpad drawing anytime.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Spatial Drafting Graphic */}
          <div className="lg:col-span-6 flex">
            <div className="w-full rounded-2xl bg-[#151E2D] border border-[#243247] p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[#243247]">
                <div className="flex items-center gap-2 text-xs text-[#A4B0C1]">
                  <span className="font-medium text-[#F0F2F6]">
                    Spatial Vector Interpolation
                  </span>
                  <span>·</span>
                  <span className="font-mono text-[#D5B879]">Landmark 08</span>
                </div>
                <span className="font-mono text-[11px] text-[#718096]">
                  60 FPS Spline
                </span>
              </div>

              {/* Warm Ivory Surface Miniature */}
              <div className="my-6 relative rounded-xl bg-[#F7F5F0] border border-[#243247] aspect-[16/10] overflow-hidden flex items-center justify-center p-6 shadow-inner">
                <svg
                  viewBox="0 0 600 360"
                  className="w-full h-full"
                  aria-label="Illustration of hand landmarks translating into a continuous calligraphic stroke"
                >
                  {/* Subtle ivory grid guidelines */}
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#E6EAF0" strokeWidth="1" />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="#E6EAF0" strokeWidth="1" />
                  <line x1="0" y1="270" x2="600" y2="270" stroke="#E6EAF0" strokeWidth="1" />
                  <line x1="150" y1="0" x2="150" y2="360" stroke="#E6EAF0" strokeWidth="1" />
                  <line x1="300" y1="0" x2="300" y2="360" stroke="#E6EAF0" strokeWidth="1" />
                  <line x1="450" y1="0" x2="450" y2="360" stroke="#E6EAF0" strokeWidth="1" />

                  {/* Flowing Midnight Ink Stroke */}
                  <path
                    d="M 80,240 C 140,110 220,90 290,170 C 360,250 440,210 520,100"
                    fill="none"
                    stroke="#0B1220"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Gold Calligraphic Accents */}
                  <path
                    d="M 120,260 C 200,200 320,240 460,150"
                    fill="none"
                    stroke="#D5B879"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="4 6"
                  />

                  {/* Fingertip Cursor Marker */}
                  <circle cx="520" cy="100" r="10" fill="#D5B879" />
                  <circle cx="520" cy="100" r="16" fill="none" stroke="#D5B879" strokeWidth="1.5" />
                  <circle cx="520" cy="100" r="3" fill="#0B1220" />
                </svg>

                {/* Subtitle tag */}
                <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded-md bg-[#0B1220]/80 text-[10px] font-mono text-[#D5B879] border border-[#243247]">
                  Warm Ivory Surface · #F7F5F0
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-[#0B1220] border border-[#243247] p-2.5">
                  <div className="text-[10px] text-[#718096]">Index Posture</div>
                  <div className="mt-0.5 font-medium text-[#F0F2F6]">Continuous Draw</div>
                </div>
                <div className="rounded-lg bg-[#0B1220] border border-[#243247] p-2.5">
                  <div className="text-[10px] text-[#718096]">V-Sign Posture</div>
                  <div className="mt-0.5 font-medium text-[#F87171]">Gesture Erase</div>
                </div>
                <div className="rounded-lg bg-[#0B1220] border border-[#243247] p-2.5">
                  <div className="text-[10px] text-[#718096]">Pinch / Hover</div>
                  <div className="mt-0.5 font-medium text-[#D5B879]">Dock Select</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-[1440px] mx-auto px-6 md:px-12 py-5 border-t border-[#243247] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718096]">
        <div className="flex items-center gap-2">
          <span>VESPER</span>
          <span>·</span>
          <span>A canvas beyond touch</span>
        </div>
        <div>
          Designed for natural spatial creativity · No account required
        </div>
      </footer>

      {/* How It Works Dialog */}
      <Dialog
        open={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        title="How VESPER Works"
        description="The intersection of computer vision, geometry, and digital ink."
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4 text-xs text-[#A4B0C1] leading-relaxed">
          <div className="space-y-3 rounded-lg bg-[#0B1220] border border-[#243247] p-4">
            <div className="flex items-start gap-3">
              <Cpu className="w-4 h-4 text-[#D5B879] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F0F2F6] block">
                  1. Local Optical Landmark Processing
                </strong>
                Using Google MediaPipe Hand Landmarker compiled to WebAssembly,
                VESPER tracks 21 skeletal landmarks on your hand at 60 FPS directly
                inside your browser without sending any video data to remote servers.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Hand className="w-4 h-4 text-[#D5B879] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F0F2F6] block">
                  2. Temporal Gesture State Machine
                </strong>
                Unlike naive frame-by-frame apps, VESPER uses temporal debounce,
                hysteresis, and a 130ms sensor dropout grace period to distinguish
                between intentional drawing, pausing, spatial hovering, and tool selection.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Palette className="w-4 h-4 text-[#D5B879] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F0F2F6] block">
                  3. Quadratic Spline Interpolation & Velocity Dynamics
                </strong>
                Fingertip coordinates are stabilized with adaptive velocity-aware
                smoothing, producing crisp, natural calligraphic lines that taper organically
                with speed.
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
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

      {/* Gesture Guide Dialog */}
      <Dialog
        open={gestureGuideOpen}
        onClose={() => setGestureGuideOpen(false)}
        title="Gesture Vocabulary"
        description="Master the core hand gestures for fluid spatial drawing."
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          <GestureGuide />
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setGestureGuideOpen(false);
                onEnterStudio(false);
              }}
            >
              <span>Ready to Draw</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
