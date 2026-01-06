// packages/ui/src/components/Switch.tsx

import { forwardRef, useId, useCallback, memo } from 'react'
import type { InputHTMLAttributes, ElementRef } from 'react'
import { cn } from '../lib/utils'
import type { FormComponentProps } from '../lib/types'

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'>, FormComponentProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  onChange?: (checked: boolean) => void
  onCheckedChange?: (checked: boolean) => void
}

const sizeClasses = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'h-3 w-3',
    translateX: 'translate-x-4'
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'h-5 w-5',
    translateX: 'translate-x-5'
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'h-6 w-6',
    translateX: 'translate-x-7'
  }
}

export const Switch = memo(forwardRef<ElementRef<'input'>, SwitchProps>(
  ({ 
    label,
    error,
    helpText,
    size = 'md',
    checked = false,
    disabled = false,
    onChange,
    onCheckedChange,
    className,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const switchId = id || generatedId
    const hasError = Boolean(error)
    const sizes = sizeClasses[size]

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
      onCheckedChange?.(e.target.checked)
    }, [onChange, onCheckedChange])

    const handleToggle = useCallback((e: React.MouseEvent) => {
      if (!disabled) {
        e.preventDefault()
        e.stopPropagation()
        onChange?.(!checked)
        onCheckedChange?.(!checked)
      }
    }, [disabled, checked, onChange, onCheckedChange])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        onChange?.(!checked)
        onCheckedChange?.(!checked)
      }
    }, [disabled, checked, onChange, onCheckedChange])

    return (
      <div className={cn('flex items-start', className)}>
        <div className='flex items-center'>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input
              ref={ref}
              id={switchId}
              type='checkbox'
              checked={checked}
              disabled={disabled}
              onChange={handleChange}
              className='sr-only'
              aria-invalid={hasError}
              aria-describedby={
                error ? `${switchId}-error` : 
                helpText ? `${switchId}-help` : undefined
              }
              {...props}
            />
            <div
              className={cn(
                'relative rounded-full transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-offset-2',
                sizes.track,
                checked
                  ? 'bg-primary'
                  : 'bg-border',
                hasError
                  ? 'focus-within:ring-red-500'
                  : 'focus-within:ring-primary',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={handleToggle}
              role='switch'
              aria-checked={checked}
              tabIndex={disabled ? -1 : 0}
              onKeyDown={handleKeyDown}
            >
              <span
                className={cn(
                  'absolute left-0.5 top-0.5 bg-card rounded-full shadow transform transition-transform duration-200 ease-in-out',
                  sizes.thumb,
                  checked && sizes.translateX
                )}
              />
            </div>
          </label>
        </div>
        
        {(label || helpText || error) && (
          <div className='ml-3 text-sm'>
            {label && (
              <label
                htmlFor={switchId}
                className={cn(
                  'block font-medium cursor-pointer',
                  hasError ? 'text-red-900' : 'text-foreground',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            
            {error && (
              <p id={`${switchId}-error`} className='mt-1 text-red-600'>
                {error}
              </p>
            )}
            
            {helpText && !error && (
              <p id={`${switchId}-help`} className='mt-1 text-muted-foreground'>
                {helpText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
))
Switch.displayName = 'Switch'
