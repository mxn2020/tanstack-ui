// packages/ui/src/components/Checkbox.tsx

import { forwardRef, useId, useCallback, memo } from 'react'
import type { InputHTMLAttributes, ElementRef } from 'react'
import { cn } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/utils'
import { Check } from 'lucide-react'
import type { FormComponentProps } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/types'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'>, FormComponentProps {
  label?: string
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
}

export const Checkbox = memo(forwardRef<ElementRef<'input'>, CheckboxProps>(
  ({ 
    label,
    error,
    helpText,
    indeterminate = false,
    checked = false,
    disabled = false,
    onChange,
    className,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const checkboxId = id || generatedId
    const hasError = Boolean(error)

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }, [onChange])

    const handleBoxClick = useCallback(() => {
      if (!disabled) {
        onChange?.(!checked)
      }
    }, [disabled, checked, onChange])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        onChange?.(!checked)
      }
    }, [disabled, checked, onChange])

    return (
      <div className={cn('flex items-start', className)}>
        <div className='flex items-center h-5'>
          <div className='relative'>
            <input
              ref={ref}
              id={checkboxId}
              type='checkbox'
              checked={checked}
              disabled={disabled}
              onChange={handleChange}
              className='sr-only'
              aria-invalid={hasError}
              aria-describedby={
                error ? `${checkboxId}-error` : 
                helpText ? `${checkboxId}-help` : undefined
              }
              {...props}
            />
            <div
              className={cn(
                'w-4 h-4 border rounded transition-colors cursor-pointer flex items-center justify-center',
                checked || indeterminate
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-card border-border hover:border-muted-foreground',
                hasError 
                  ? 'border-red-300 focus-within:ring-red-500' 
                  : 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={handleBoxClick}
              role='checkbox'
              aria-checked={indeterminate ? 'mixed' : checked}
              tabIndex={disabled ? -1 : 0}
              onKeyDown={handleKeyDown}
            >
              {checked && !indeterminate && (
                <Check className='w-3 h-3 text-white' strokeWidth={3} />
              )}
              {indeterminate && (
                <div className='w-2 h-0.5 bg-card rounded' />
              )}
            </div>
          </div>
        </div>
        
        {(label || helpText || error) && (
          <div className='ml-2 text-sm'>
            {label && (
              <label
                htmlFor={checkboxId}
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
              <p id={`${checkboxId}-error`} className='mt-1 text-red-600'>
                {error}
              </p>
            )}
            
            {helpText && !error && (
              <p id={`${checkboxId}-help`} className='mt-1 text-muted-foreground'>
                {helpText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
))
Checkbox.displayName = 'Checkbox'