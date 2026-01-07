// packages/ui/src/solid/components/Separator.tsx

import { splitProps } from 'solid-js';
import { cn } from '../lib/utils';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  class?: string;
}

export function Separator(props: SeparatorProps) {
  const [local] = splitProps(props, ['orientation', 'class']);
  const orientation = () => local.orientation || 'horizontal';

  return (
    <div
      role="separator"
      aria-orientation={orientation()}
      class={cn(
        'shrink-0 bg-border',
        orientation() === 'horizontal' 
          ? 'h-px w-full' 
          : 'h-full w-px',
        local.class
      )}
    />
  );
}
