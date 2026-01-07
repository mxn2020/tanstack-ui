// packages/ui/src/components/Separator.tsx

import { memo } from 'react';
import { cn } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/utils';

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

