// packages/ui/src/components/Input.tsx

import { forwardRef, useId, memo, useCallback } from 'react'
import type { InputHTMLAttributes, ElementRef, ReactNode } from 'react'
import { cn } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/utils'
import type { InputSize, FormComponentProps } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/types'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, FormComponentProps {
  label?: string
  description?: string
  size?: InputSize
  icon?: ReactNode
  endIcon?: ReactNode
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

export const Input = memo(forwardRef<ElementRef<'input'>, InputProps>(
  ({ 
    label,
    error,
    description,
    helpText,
    size = 'md',
    icon,
    endIcon,
    className,
    id,
    disabled = false,
    required = false,
    onChange,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const hasError = Boolean(error)

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
    }, [onChange])

    return (
      <div className='w-full'>
        {(label || description) && (
          <div className='flex items-start justify-between gap-2 mb-1'>
            {label && (
              <label 
                htmlFor={inputId} 
                className={cn(
                  'block text-sm font-medium text-foreground',
                  disabled && 'opacity-50'
                )}
              >
                {label}
                {required && <span className='text-red-500 ml-1'>*</span>}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  'text-xs text-muted-foreground leading-tight text-right',
                  disabled && 'opacity-50'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className='relative'>
          {icon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground'>
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            className={cn(
              'block w-full border border-border rounded-lg bg-card text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-surface disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors',
              sizeClasses[size],
              icon && 'pl-10',
              endIcon && 'pr-10',
              hasError && 'border-red-300 focus:ring-red-500 focus:border-red-500',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : 
              helpText ? `${inputId}-help` : undefined
            }
            {...props}
          />
          
          {endIcon && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground'>
              {endIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className='mt-1 text-sm text-red-600'>
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={`${inputId}-help`} className='mt-1 text-sm text-muted-foreground'>
            {helpText}
          </p>
        )}
      </div>
    )
  }
))
Input.displayName = 'Input'
