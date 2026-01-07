// packages/ui/src/solid/components/Label.tsx

import { Component, JSX, splitProps, Show } from 'solid-js';
import { cn } from '../lib/utils';

interface LabelProps extends JSX.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'muted';
  ref?: (el: HTMLLabelElement) => void;
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

const variantClasses = {
  default: 'text-foreground font-medium',
  subtle: 'text-foreground font-normal',
  muted: 'text-muted-foreground font-normal'
};

export const Label: Component<LabelProps> = (props) => {
  const [local, labelProps] = splitProps(props, [
    'children',
    'class',
    'required',
    'disabled',
    'size',
    'variant',
    'ref'
  ]);

  const required = () => local.required || false;
  const disabled = () => local.disabled || false;
  const size = () => local.size || 'md';
  const variant = () => local.variant || 'default';

  return (
    <label
      ref={local.ref}
      class={cn(
        'leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        sizeClasses[size()],
        variantClasses[variant()],
        disabled() && 'cursor-not-allowed opacity-70',
        local.class
      )}
      {...labelProps}
    >
      {local.children}
      <Show when={required()}>
        <span 
          class='ml-1 text-red-500' 
          aria-label='Required field'
          title='This field is required'
        >
          *
        </span>
      </Show>
    </label>
  );
};
