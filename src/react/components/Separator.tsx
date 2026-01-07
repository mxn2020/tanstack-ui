// packages/ui/src/react/components/Separator.tsx

import { memo } from 'react';
import { cn } from '../lib/utils';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator = memo(function Separator({ 
  orientation = 'horizontal', 
  className 
}: SeparatorProps) {
  return (
    <div
      role='separator'
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' 
          ? 'h-px w-full' 
          : 'h-full w-px',
        className
      )}
    />
  );
});

