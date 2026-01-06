// packages/ui/src/components/Loading.tsx
import { forwardRef, memo } from 'react'
import type { HTMLAttributes, ElementRef } from 'react'
import { cn } from '../lib/utils'

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse'
  /**
   * Optional message to display below the spinner
   * Can be a plain string or i18n translation key
   * Examples: 'Loading projects...', 'loading.projects', 'projects:loading.list'
   */
  message?: string
  /**
   * Show the message visually (default: false, uses sr-only for accessibility)
   */
  showMessage?: boolean
  /**
   * Whether to center the spinner vertically and horizontally on full screen
   * When true, wraps the loading component in a full-screen centered container
   * @default false
   */
  fullScreen?: boolean
}

interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  variant?: 'rectangular' | 'circular' | 'text'
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const SpinnerIcon = ({ className }: { className?: string }) => (
  <div className={cn('inline-block animate-spin rounded-full border-b-2 border-foreground mb-4', className)} />
)

const DotsIcon = ({ className }: { className?: string }) => (
  <div className={cn('flex space-x-1', className)}>
    <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
    <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
    <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
  </div>
)

const PulseIcon = ({ className }: { className?: string }) => (
  <div className={cn('bg-blue-600 rounded-full animate-pulse', className)} />
)

export const Loading = memo(forwardRef<ElementRef<'div'>, LoadingProps>(
  ({
    size = 'md',
    variant = 'spinner',
    message,
    showMessage = false,
    fullScreen = false,
    className,
    ...props
  }, ref) => {
    const displayMessage = message || 'Loading...'

    const Icon = {
      spinner: SpinnerIcon,
      dots: DotsIcon,
      pulse: PulseIcon
    }[variant]

    const spinnerContent = (
      <div
        ref={!fullScreen ? ref : undefined}
        className={cn('flex flex-col items-center justify-center', !fullScreen && className)}
        role='status'
        aria-label={displayMessage}
        {...(!fullScreen && props)}
      >
        <Icon className={variant !== 'dots' ? sizeClasses[size] : undefined} />
        {showMessage && (
          <p className='mt-3 text-sm text-muted-foreground'>{displayMessage}</p>
        )}
        <span className='sr-only'>{displayMessage}</span>
      </div>
    )

    // If fullScreen is enabled, wrap in a full-screen centered container
    if (fullScreen) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center justify-center min-h-screen bg-surface', className)}
          {...props}
        >
          {spinnerContent}
        </div>
      )
    }

    return spinnerContent
  }
))
Loading.displayName = 'Loading'

export const LoadingSkeleton = memo(forwardRef<ElementRef<'div'>, LoadingSkeletonProps>(
  ({
    className,
    width = 'w-full',
    height = 'h-4',
    variant = 'rectangular',
    ...props
  }, ref) => {
    const variantClasses = {
      rectangular: 'rounded',
      circular: 'rounded-full',
      text: 'rounded'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-border',
          variantClasses[variant],
          width,
          height,
          className
        )}
        role='status'
        aria-label='Loading content'
        {...props}
      >
        <span className='sr-only'>Loading...</span>
      </div>
    )
  }
))
LoadingSkeleton.displayName = 'LoadingSkeleton'
