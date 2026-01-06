// packages/ui/src/components/Button.tsx

import React, { forwardRef, memo, useCallback } from 'react'
import type { ButtonHTMLAttributes, ElementRef, ReactNode } from 'react'
import { cn } from '../lib/utils'
import type { ButtonVariant, ButtonSize } from '../lib/types'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
  asChild?: boolean
}

interface ChildElementProps extends Record<string, unknown> {
  className?: string
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-[color:var(--primary)] text-primary-foreground border-transparent hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  primary:
    'bg-[color:var(--primary)] text-primary-foreground border-transparent hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  secondary:
    'bg-surface text-foreground border-border hover:bg-card focus-visible:ring-[color:var(--ring)]',
  success:
    'tone-success tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  warning:
    'tone-warning tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  error:
    'tone-danger tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  danger:
    'tone-danger tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  destructive:
    'tone-danger tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  ghost:
    'bg-transparent text-foreground border-transparent hover:bg-surface focus-visible:ring-[color:var(--ring)]',
  outline:
    'bg-transparent text-foreground border-border hover:bg-surface focus-visible:ring-[color:var(--ring)]',
  link:
    'bg-transparent text-[color:var(--primary)] border-transparent hover:underline focus-visible:ring-[color:var(--ring)] underline-offset-4',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2 h-9 w-9',
  default: 'px-4 py-2 text-sm',
}

const LoadingSpinner = memo(() => (
  <svg className='animate-spin -ml-1 mr-2 h-4 w-4' fill='none' viewBox='0 0 24 24'>
    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
    <path
      className='opacity-75'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    />
  </svg>
))
LoadingSpinner.displayName = 'LoadingSpinner'

export const Button = memo(
  forwardRef<ElementRef<'button'>, ButtonProps>(
    (
      {
        variant = 'primary',
        size = 'md',
        loading = false,
        disabled = false,
        icon,
        className,
        children,
        onClick,
        asChild = false,
        ...props
      },
      ref
    ) => {
      const isDisabled = disabled || loading
      const hasText = !!children
      const showIcon = !loading && !!icon

      const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
          if (!isDisabled && onClick) onClick(e)
        },
        [isDisabled, onClick]
      )

      const buttonClasses = cn(
        [
          'inline-flex items-center justify-center rounded-lg border font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'focus-visible:ring-offset-surface',
          'disabled:opacity-50',
          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
        ].join(' '),
        className
      )

      if (asChild) {
        if (!React.isValidElement(children)) {
          if (import.meta.env.DEV) console.warn('<Button asChild> expects a single valid React element child.')
          return null
        }

        const childProps = (children as React.ReactElement<ChildElementProps>).props
        return React.cloneElement(children as React.ReactElement<ChildElementProps>, {
          ref,
          className: cn(buttonClasses, childProps.className),
          disabled: isDisabled || childProps.disabled,
          onClick: handleClick,
          ...props,
        })
      }

      return (
        <button ref={ref} disabled={isDisabled} onClick={handleClick} className={buttonClasses} {...props}>
          {loading && <LoadingSpinner />}

          {showIcon && (
            <span
              className={cn(
                'inline-flex items-center justify-center shrink-0 [&>svg]:h-5 [&>svg]:w-5',
                hasText ? 'mr-2' : ''
              )}
            >
              {icon}
            </span>
          )}

          {hasText ? <span className='inline-flex items-center'>{children}</span> : null}
        </button>
      )
    }
  )
)

Button.displayName = 'Button'
