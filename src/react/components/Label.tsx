// packages/ui/src/react/components/Label.tsx

import { forwardRef, LabelHTMLAttributes, memo } from 'react';
import { cn } from '../lib/utils';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'muted';
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

export const Label = memo(forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    children, 
    className, 
    required = false, 
    disabled = false,
    size = 'md',
    variant = 'default',
    ...props 
  }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'cursor-not-allowed opacity-70',
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span 
            className='ml-1 text-red-500' 
            aria-label='Required field'
            title='This field is required'
          >
            *
          </span>
        )}
      </label>
    );
  }
));
Label.displayName = 'Label';