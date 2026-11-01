'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { isFounderSession } from '@/lib/api';

interface ChamberHeaderProps {
  badgeText: string;
  badgeVariant?: BadgeProps['variant'];
}

export function ChamberHeader({
  badgeText,
  badgeVariant = 'gold',
}: ChamberHeaderProps) {
  const [isFounder, setIsFounder] = useState(false);

  useEffect(() => {
    setIsFounder(isFounderSession());
  }, []);

  return (
    <div className="flex items-center justify-between border-b border-[#262C3A]/70 pb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2.5">
        {isFounder ? (
          <>
            <Link href="/founder">
              <Button variant="gold" size="sm">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Central Command</span>
              </Button>
            </Link>
            <Link href="/member">
              <Button variant="secondary" size="sm">
                <span>Member View</span>
              </Button>
            </Link>
          </>
        ) : (
          <Link href="/member">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Vault</span>
            </Button>
          </Link>
        )}
      </div>
      <Badge variant={badgeVariant}>{badgeText}</Badge>
    </div>
  );
}
