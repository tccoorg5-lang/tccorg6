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
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--antique-gold)]';

    const variantStyles = {
      gold: 'bg-gradient-to-r from-[#C5A059] to-[#8C6D2D] text-[#080A0E] font-serif-formal font-bold tracking-wider uppercase border border-[#E6CA85] hover:brightness-110 hover:shadow-[0_0_15px_rgba(197,160,89,0.25)]',
      secondary:
        'bg-[#161A22] text-[#E9E2D3] border border-[#262C3A] hover:bg-[#202632] hover:border-[#C5A059] hover:text-[#C5A059]',
      burgundy:
        'bg-[#5C161D] text-[#E9E2D3] font-serif-formal font-bold tracking-wider uppercase border border-[#8C232D] hover:bg-[#751C25] hover:shadow-[0_0_15px_rgba(92,22,29,0.35)]',
      outline:
        'bg-transparent text-[#C5A059] border border-[rgba(197,160,89,0.4)] hover:bg-[rgba(197,160,89,0.1)] hover:border-[#C5A059]',
      ghost:
        'bg-transparent text-[#B5B5BC] hover:text-[#E9E2D3] hover:bg-[#161A22]',
      danger:
        'bg-[#7F1D1D] text-[#FEE2E2] border border-[#991B1B] hover:bg-[#991B1B]',
    };

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 rounded-[4px] gap-1.5',
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
