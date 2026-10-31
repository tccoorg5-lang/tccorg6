import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'p-8 flex flex-col items-center justify-center text-center rounded-[6px] border border-dashed border-[#262C3A] bg-[#0F1218]/50 space-y-3 max-w-md mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#161A22] border border-[rgba(197,160,89,0.3)] flex items-center justify-center text-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.1)]">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-serif-formal text-sm font-bold tracking-wider text-[#D8B26E] uppercase">
          {title}
        </h4>
        <p className="text-xs text-[#858995] leading-relaxed max-w-xs">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="gold" size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
