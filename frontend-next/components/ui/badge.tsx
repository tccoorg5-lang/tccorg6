import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'gold' | 'active' | 'pending' | 'revoked' | 'burgundy' | 'outline' | 'neutral';
}

function Badge({ className, variant = 'gold', ...props }: BadgeProps) {
  const variantStyles = {
    gold: 'border-[rgba(197,160,89,0.35)] bg-[rgba(197,160,89,0.08)] text-[#C5A059]',
    active: 'border-[#2E7D32]/40 bg-[#2E7D32]/10 text-[#4ADE80]',
    pending: 'border-[#D8B26E]/40 bg-[#D8B26E]/10 text-[#D8B26E]',
    revoked: 'border-[#991B1B]/40 bg-[#991B1B]/15 text-[#F87171]',
    burgundy: 'border-[#5C161D] bg-[#5C161D]/25 text-[#E9E2D3]',
    outline: 'border-[#262C3A] bg-transparent text-[#B5B5BC]',
    neutral: 'border-[#262C3A] bg-[#161A22] text-[#858995]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[3px] border font-serif-formal text-[0.625rem] font-bold tracking-widest uppercase select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
