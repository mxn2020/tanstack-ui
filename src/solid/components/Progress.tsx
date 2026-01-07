// packages/ui/src/solid/components/Progress.tsx

import { createMemo, type Component, type JSX } from 'solid-js';
import { cn } from '../lib/utils';

interface ProgressProps {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  class?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const variantClasses = {
  default: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  danger: 'bg-red-600'
};

export const Progress: Component<ProgressProps> = (props) => {
  const value = () => props.value ?? 0;
  const max = () => props.max ?? 100;
  const size = () => props.size ?? 'md';
  const variant = () => props.variant ?? 'default';
  const showLabel = () => props.showLabel ?? false;

  const percentage = createMemo(() => {
    return Math.min(Math.max((value() / max()) * 100, 0), 100);
  });

  return (
    <div class={cn('w-full', props.class)}>
      <div
        role="progressbar"
        aria-valuenow={value()}
        aria-valuemin={0}
        aria-valuemax={max()}
        class={cn(
          'w-full bg-border rounded-full overflow-hidden',
          sizeClasses[size()]
        )}
      >
        <div
          class={cn(
            'h-full transition-all duration-300 ease-in-out rounded-full',
            variantClasses[variant()]
          )}
          style={{ width: `${percentage()}%` }}
        />
      </div>
      
      {showLabel() && (
        <div class="flex justify-between items-center mt-1 text-xs text-muted-foreground">
          <span>{value()}</span>
          <span>{max()}</span>
        </div>
      )}
    </div>
  );
};
