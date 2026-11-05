import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gold' | 'interactive' | 'burgundy';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default:
        'bg-[#0F1218] border border-[#262C3A] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7)] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059]/25 before:to-transparent',
      elevated:
        'bg-[#161A22] border border-[#262C3A] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.85)] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059]/35 before:to-transparent',
      gold:
        'bg-[#0F1218] border border-[rgba(197,160,89,0.4)] shadow-[0_12px_40px_-6px_rgba(0,0,0,0.85),0_0_24px_-4px_rgba(197,160,89,0.1)] before:bg-gradient-to-r before:from-transparent before:via-[#D8B26E]/60 before:to-transparent',
      interactive:
        'bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.45)] hover:shadow-[0_16px_48px_-6px_rgba(0,0,0,0.85),0_0_24px_-4px_rgba(197,160,89,0.15)] transition-all duration-250 cursor-pointer before:bg-gradient-to-r before:from-transparent before:via-[#C5A059]/30 before:to-transparent',
      burgundy:
        'bg-[#0F1218] border border-[#5C161D]/70 shadow-[0_12px_40px_-6px_rgba(92,22,29,0.2)] before:bg-gradient-to-r before:from-transparent before:via-[#8C232D] before:to-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[8px] relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px]',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-5 border-b border-[#262C3A]/60', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-serif-formal text-sm font-bold tracking-wider text-[#D8B26E] uppercase',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-[#8993A3] leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-5 pt-0 border-t border-[#262C3A]/60 mt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
