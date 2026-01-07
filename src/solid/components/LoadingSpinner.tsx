// packages/ui/src/solid/components/LoadingSpinner.tsx

import { Component, Show } from 'solid-js'

interface LoadingSpinnerProps {
  /**
   * Whether to center the spinner vertically and horizontally on full screen
   * @default false
   */
  fullScreen?: boolean
  /**
   * Optional message to display below the spinner
   */
  message?: string
  /**
   * Size of the spinner
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingSpinner: Component<LoadingSpinnerProps> = (props) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const size = () => props.size ?? 'md'

  const spinner = (
    <div class="text-center">
      <div class={`inline-block animate-spin rounded-full border-b-2 border-foreground ${sizeClasses[size()]} mb-4`} />
      <Show when={props.message}>
        <p class="text-muted-foreground">{props.message}</p>
      </Show>
    </div>
  )

  return (
    <Show
      when={props.fullScreen}
      fallback={<div class="flex justify-center py-8">{spinner}</div>}
    >
      <div class="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    </Show>
  )
}
