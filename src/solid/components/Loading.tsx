// packages/ui/src/solid/components/Loading.tsx

import { Component, JSX, splitProps, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '../lib/utils'

interface LoadingProps extends JSX.HTMLAttributes<HTMLDivElement> {
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
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

interface LoadingSkeletonProps extends JSX.HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  variant?: 'rectangular' | 'circular' | 'text'
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const SpinnerIcon: Component<{ class?: string }> = (props) => (
  <div class={cn('inline-block animate-spin rounded-full border-b-2 border-foreground mb-4', props.class)} />
)

const DotsIcon: Component<{ class?: string }> = (props) => (
  <div class={cn('flex space-x-1', props.class)}>
    <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ 'animation-delay': '0ms' }} />
    <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ 'animation-delay': '150ms' }} />
    <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ 'animation-delay': '300ms' }} />
  </div>
)

const PulseIcon: Component<{ class?: string }> = (props) => (
  <div class={cn('bg-blue-600 rounded-full animate-pulse', props.class)} />
)

export const Loading: Component<LoadingProps> = (props) => {
  const [local, others] = splitProps(props, [
    'size',
    'variant',
    'message',
    'showMessage',
    'fullScreen',
    'class',
    'ref'
  ])

  const displayMessage = () => local.message || 'Loading...'
  const size = () => local.size ?? 'md'
  const variant = () => local.variant ?? 'spinner'

  const Icon = () => {
    const v = variant()
    return v === 'dots' ? DotsIcon : v === 'pulse' ? PulseIcon : SpinnerIcon
  }

  const spinnerContent = (
    <div
      ref={!local.fullScreen ? local.ref : undefined}
      class={cn('flex flex-col items-center justify-center', !local.fullScreen && local.class)}
      role="status"
      aria-label={displayMessage()}
      {...(!local.fullScreen && others)}
    >
      <Dynamic component={Icon()} class={variant() !== 'dots' ? sizeClasses[size()] : undefined} />
      <Show when={local.showMessage}>
        <p class="mt-3 text-sm text-muted-foreground">{displayMessage()}</p>
      </Show>
      <span class="sr-only">{displayMessage()}</span>
    </div>
  )

  return (
    <Show
      when={local.fullScreen}
      fallback={spinnerContent}
    >
      <div
        ref={local.ref}
        class={cn('flex items-center justify-center min-h-screen bg-surface', local.class)}
        {...others}
      >
        {spinnerContent}
      </div>
    </Show>
  )
}

export const LoadingSkeleton: Component<LoadingSkeletonProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'width', 'height', 'variant', 'ref'])

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded'
  }

  return (
    <div
      ref={local.ref}
      class={cn(
        'animate-pulse bg-border',
        variantClasses[local.variant ?? 'rectangular'],
        local.width ?? 'w-full',
        local.height ?? 'h-4',
        local.class
      )}
      role="status"
      aria-label="Loading content"
      {...others}
    >
      <span class="sr-only">Loading...</span>
    </div>
  )
}
