import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tool';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  active?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'secondary',
      size = 'md',
      active = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5B879] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1220] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap shrink-0 cursor-pointer select-none';

    const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-8 px-3 text-xs rounded-md',
      md: 'h-9 px-4 text-[13px] rounded-lg',
      lg: 'h-11 px-6 text-sm rounded-lg',
      icon: 'h-10 w-10 rounded-lg',
    };

    let variantClasses = '';
    if (variant === 'primary') {
      variantClasses =
        'bg-[#D5B879] text-[#0B1220] hover:bg-[#DFC68E] font-semibold border border-[#D5B879]';
    } else if (variant === 'secondary') {
      variantClasses = active
        ? 'bg-[#151E2D] text-[#D5B879] border border-[#D5B879]'
        : 'bg-[#151E2D] text-[#F0F2F6] border border-[#243247] hover:border-[#A4B0C1]/50 hover:bg-[#1B2638]';
    } else if (variant === 'ghost') {
      variantClasses = active
        ? 'bg-[#243247]/60 text-[#D5B879] border border-[#D5B879]/60'
        : 'bg-transparent text-[#A4B0C1] hover:text-[#F0F2F6] hover:bg-[#151E2D] border border-transparent';
    } else if (variant === 'danger') {
      variantClasses =
        'bg-[#E53E3E]/15 text-[#F87171] border border-[#E53E3E]/50 hover:bg-[#E53E3E] hover:text-[#F0F2F6]';
    } else if (variant === 'tool') {
      variantClasses = active
        ? 'bg-[#D5B879]/15 text-[#D5B879] border border-[#D5B879] shadow-xs'
        : 'bg-transparent text-[#A4B0C1] border border-transparent hover:text-[#F0F2F6] hover:bg-[#243247]/40';
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        aria-pressed={active || undefined}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
