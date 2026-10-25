import React from 'react';
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
      posture: 'Index extended · others folded',
      detail: 'Directs continuous ink strokes from your index fingertip onto the canvas.',
    },
    {
      type: GestureType.ERASE,
      title: 'V-Sign Eraser',
      posture: 'Index + Middle extended (Peace)',
      detail: 'Instantly activates the subtractive eraser without clicking any buttons.',
    },
    {
      type: GestureType.HOVER,
      title: 'Hover / Move',
      posture: 'Open palm or relaxed hand',
      detail: 'Lifts the brush cleanly while tracking the cursor reticle across the canvas.',
    },
    {
      type: GestureType.PINCH,
      title: 'Pinch & Select',
      posture: 'Thumb + Index fingertips touching',
      detail:
        'Move cursor to the top dock and pinch or hold to select colors and instruments.',
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#A4B0C1]">
          Gesture Vocabulary
        </span>
        <span className="text-[11px] text-[#718096] tabular-nums">
          Spatial Computer Vision
        </span>
      </div>

      <div className="divide-y divide-[#243247]/70 border-t border-b border-[#243247]">
        {gestures.map((item) => {
          const isCurrent =
            activeGesture === item.type ||
            (item.type === GestureType.HOVER &&
              (activeGesture === GestureType.OPEN_PALM ||
                activeGesture === GestureType.PAUSE));

          return (
            <div
              key={item.type}
              className={`py-2.5 transition-colors ${
                isCurrent ? 'text-[#F0F2F6]' : 'text-[#A4B0C1]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? item.type === GestureType.ERASE
                        ? 'text-[#F87171]'
                        : 'text-[#D5B879]'
                      : 'text-[#F0F2F6]'
                  }`}
                >
                  {item.title}
                </span>
                <span className="text-[11px] text-[#718096]">
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
    </div>
  );
};
