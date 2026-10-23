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
      detail: 'Tracks Landmark 8 (Index Tip) for continuous ink strokes.',
    },
    {
      type: GestureType.PAUSE,
      title: 'Pause / Hover',
      posture: 'Open palm or lower index finger',
      detail: 'Lifts the brush cleanly while keeping the cursor reticle visible.',
    },
    {
      type: GestureType.PINCH,
      title: 'Pick Color or Tool',
      posture: 'Hover over top palette bar',
      detail:
        'Move your hand to the top palette bar and hold briefly (or pinch) over any color swatch to select it—never triggers mid-drawing.',
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#A4B0C1]">
          Gesture Vocabulary
        </span>
        <span className="text-[11px] text-[#718096] tabular-nums">
          21-pt Hand Mesh
        </span>
      </div>

      <div className="divide-y divide-[#243247]/70 border-t border-b border-[#243247]">
        {gestures.map((item) => {
          const isCurrent =
            activeGesture === item.type ||
            (item.type === GestureType.PAUSE &&
              activeGesture === GestureType.OPEN_PALM);

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
                    isCurrent ? 'text-[#D5B879]' : 'text-[#F0F2F6]'
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
