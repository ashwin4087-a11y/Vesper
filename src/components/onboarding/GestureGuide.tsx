import React from 'react';
import { Camera, CheckCircle2, Eye, Hand, Sparkles } from 'lucide-react';
import { GestureType } from '../../types/hand';

export interface GestureGuideProps {
  activeGesture?: GestureType;
  compact?: boolean;
}

export const GestureGuide: React.FC<GestureGuideProps> = ({
  activeGesture = GestureType.NONE,
  compact = false,
}) => {
  const gestures = [
    {
      type: GestureType.DRAW,
      title: 'Draw Stroke',
      posture: 'Index extended · other fingers folded',
      detail: 'Depicts continuous ink strokes from your index fingertip onto the canvas.',
      badgeColor: '#D5B879',
    },
    {
      type: GestureType.OPEN_PALM,
      title: 'Pause / Rest',
      posture: 'Open Palm (all 5 fingers spread)',
      detail: 'Instantly pauses ink flow. Lift and reposition your hand without leaving a mark.',
      badgeColor: '#38A169',
    },
    {
      type: GestureType.ERASE,
      title: 'V-Sign Eraser',
      posture: 'Index + Middle extended (Peace sign)',
      detail: 'Activates the subtractive eraser without clicking any buttons or switching tools.',
      badgeColor: '#F87171',
    },
    {
      type: GestureType.PINCH,
      title: 'Pinch & Select',
      posture: 'Thumb + Index fingertips touching',
      detail: 'Pinch or hover over the top dock to switch instruments and pigments instantly.',
      badgeColor: '#D5B879',
    },
    {
      type: GestureType.HOVER,
      title: 'Spatial Hover',
      posture: 'Gentle relaxed hand movement',
      detail: 'Aims the circular targeting reticle across the canvas without depositing pigment.',
      badgeColor: '#A4B0C1',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#F0F2F6]">
          Spatial Gesture Vocabulary
        </span>
        <span className="text-[11px] font-mono text-[#D5B879] tabular-nums">
          Optical Computer Vision
        </span>
      </div>

      <div className="divide-y divide-[#243247]/70 border-t border-b border-[#243247]">
        {gestures.map((item) => {
          const isCurrent =
            activeGesture === item.type ||
            (item.type === GestureType.OPEN_PALM && activeGesture === GestureType.PAUSE) ||
            (item.type === GestureType.HOVER && activeGesture === GestureType.CLUTCH);

          return (
            <div
              key={item.type}
              className={`py-2.5 transition-all duration-150 ${
                isCurrent ? 'bg-[#151E2D]/80 px-2 rounded-md -mx-2' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-[#F0F2F6]' : 'text-[#A4B0C1]'
                    }`}
                  >
                    {item.title}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#0B1220] border border-[#D5B879] text-[#D5B879]">
                      <Sparkles className="w-2.5 h-2.5" />
                      Active
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#718096] font-mono">
                  {item.posture}
                </span>
              </div>
              {!compact && (
                <p className="mt-1 text-xs text-[#A4B0C1] leading-relaxed">
                  {item.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="rounded-lg bg-[#0B1220] border border-[#243247] p-3 text-xs text-[#A4B0C1] space-y-1.5">
          <div className="font-semibold text-[#F0F2F6] flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#D5B879]" />
            <span>Optimal Hand Positioning</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-[#A4B0C1] leading-relaxed">
            <li>Keep your hand approximately 1.5 to 2.5 feet (45–75 cm) from the camera.</li>
            <li>Ensure front-facing ambient light so all finger joints are clearly visible.</li>
            <li>You can also draw anytime with your mouse, trackpad, or stylus!</li>
          </ul>
        </div>
      )}
    </div>
  );
};
