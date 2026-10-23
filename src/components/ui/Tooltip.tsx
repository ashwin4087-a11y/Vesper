import React, { useState } from 'react';

export interface TooltipProps {
  content: string;
  shortcut?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  side = 'right',
  children,
}) => {
  const [visible, setVisible] = useState(false);

  const positionClasses: Record<NonNullable<TooltipProps['side']>, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2.5',
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-50 flex items-center gap-2 rounded-md bg-[#0B1220] px-2.5 py-1.5 text-xs font-medium text-[#F0F2F6] border border-[#243247] shadow-lg whitespace-nowrap ${positionClasses[side]}`}
        >
          <span>{content}</span>
          {shortcut && (
            <kbd className="rounded bg-[#151E2D] px-1.5 py-0.5 font-mono text-[10px] text-[#D5B879] border border-[#243247]">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
};
