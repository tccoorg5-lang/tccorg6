import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'gold' | 'secondary' | 'burgundy' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'gold',
      size = 'md',
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] relative overflow-hidden';

    const variantStyles = {
      gold: 'bg-gradient-to-r from-[#D8B26E] via-[#C5A059] to-[#8C6D2D] text-[#080A0E] font-serif-formal font-bold tracking-wider uppercase border border-[#F0DBA5] shadow-[0_2px_12px_rgba(197,160,89,0.25)] hover:brightness-110 hover:shadow-[0_0_20px_rgba(216,178,110,0.35)]',
      secondary:
        'bg-[#161A22] text-[#E9E2D3] border border-[#262C3A] hover:bg-[#1B2029] hover:border-[#C5A059]/60 hover:text-[#D8B26E] hover:shadow-[0_2px_12px_rgba(0,0,0,0.4)]',
      burgundy:
        'bg-[#5C161D] text-[#E9E2D3] font-serif-formal font-bold tracking-wider uppercase border border-[#8C232D] hover:bg-[#751C25] hover:border-[#B91C1C] hover:shadow-[0_0_20px_rgba(92,22,29,0.45)]',
      outline:
        'bg-transparent text-[#D8B26E] border border-[rgba(197,160,89,0.45)] hover:bg-[rgba(197,160,89,0.1)] hover:border-[#D8B26E] hover:shadow-[0_0_12px_rgba(197,160,89,0.15)]',
      ghost:
        'bg-transparent text-[#8993A3] hover:text-[#E9E2D3] hover:bg-[#161A22]',
      danger:
        'bg-[#7F1D1D] text-[#FEE2E2] border border-[#991B1B] hover:bg-[#991B1B] hover:shadow-[0_0_15px_rgba(153,27,27,0.35)]',
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-[4px] gap-1.5',
      md: 'text-xs px-4 py-2.5 rounded-[4px] gap-2',
      lg: 'text-sm px-6 py-3 rounded-[6px] gap-2.5',
      icon: 'w-8 h-8 rounded-[4px] p-0 flex items-center justify-center',
    };

    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };
