import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'gold' | 'active' | 'pending' | 'revoked' | 'burgundy' | 'outline' | 'neutral' | 'cyan';
}

function Badge({ className, variant = 'gold', ...props }: BadgeProps) {
  const variantStyles = {
    gold: 'border-[rgba(197,160,89,0.4)] bg-[rgba(197,160,89,0.08)] text-[#D8B26E] shadow-[0_0_8px_rgba(197,160,89,0.08)]',
    active: 'border-[#2E7D32]/50 bg-[#2E7D32]/12 text-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.1)]',
    pending: 'border-[#D8B26E]/40 bg-[#D8B26E]/10 text-[#FBBF24]',
    revoked: 'border-[#991B1B]/50 bg-[#991B1B]/15 text-[#F87171]',
    burgundy: 'border-[#8C232D]/70 bg-[#5C161D]/30 text-[#E9E2D3] shadow-[0_0_8px_rgba(92,22,29,0.25)]',
    cyan: 'border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[#38BDF8] shadow-[0_0_8px_rgba(6,182,212,0.12)]',
    outline: 'border-[#262C3A] bg-transparent text-[#8993A3]',
    neutral: 'border-[#262C3A] bg-[#161A22] text-[#8993A3]',
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
