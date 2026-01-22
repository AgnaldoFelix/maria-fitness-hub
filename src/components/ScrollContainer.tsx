import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal';
}

export function ScrollContainer({ 
  children, 
  className,
  direction = 'vertical'
}: ScrollContainerProps) {
  return (
    <div
      className={cn(
        'overflow-auto',
        // iOS fixes
        'overscroll-behavior-contain',
        '-webkit-overflow-scrolling-touch',
        direction === 'vertical' && 'overflow-y-auto overflow-x-hidden',
        direction === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
        className
      )}
      style={{
        WebkitOverflowScrolling: 'touch',
        touchAction: direction === 'vertical' ? 'pan-y' : 'pan-x',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}