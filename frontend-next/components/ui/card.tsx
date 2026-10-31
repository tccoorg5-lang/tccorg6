import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'elevated' | 'gold' | 'interactive' }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = {
    default: 'bg-[#0F1218] border border-[#262C3A]',
    elevated: 'bg-[#1B2029] border border-[#262C3A] shadow-lg',
    gold: 'bg-[#0F1218] border border-[rgba(197,160,89,0.35)] shadow-[0_4px_24px_rgba(197,160,89,0.08)]',
    interactive:
      'bg-[#0F1218] border border-[#262C3A] hover:border-[rgba(197,160,89,0.45)] hover:shadow-[0_4px_20px_rgba(197,160,89,0.12)] transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      ref={ref}
      className={cn('rounded-[6px] relative overflow-hidden', variantStyles[variant], className)}
      {...props}
    />
  );
});
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
  HTMLParagraphElement,
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
    className={cn('text-xs text-[#858995] leading-relaxed', className)}
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
