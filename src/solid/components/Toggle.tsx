// packages/ui/src/solid/components/Toggle.tsx

import { Component, JSX, splitProps } from 'solid-js'
import { cn } from '../lib/utils'

interface ToggleProps {
  children?: JSX.Element
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  disabled?: boolean
  class?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  'aria-label'?: string
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

const sizeClasses = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base'
}

const variantClasses = {
  default: {
    base: 'border border-border bg-card text-foreground hover:bg-surface',
    pressed: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
  },
  outline: {
    base: 'border-2 border-border bg-transparent text-foreground hover:bg-surface',
    pressed: 'border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100'
  }
}

export const Toggle: Component<ToggleProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'pressed',
    'onPressedChange',
    'disabled',
    'class',
    'size',
    'variant',
    'aria-label',
    'ref'
  ])

  const handleClick = () => {
    if (!(local.disabled ?? false)) {
      local.onPressedChange?.(!(local.pressed ?? false))
    }
  }

  const handleKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !(local.disabled ?? false)) {
      e.preventDefault()
      local.onPressedChange?.(!(local.pressed ?? false))
    }
  }

  const variantStyles = () => variantClasses[local.variant ?? 'default']

  const toggleClassName = () => cn(
    'inline-flex items-center justify-center rounded-md font-medium cursor-pointer',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    sizeClasses[local.size ?? 'md'],
    local.pressed ? variantStyles().pressed : variantStyles().base,
    local.disabled && 'cursor-not-allowed opacity-50',
    local.class
  )

  return (
    <button
      ref={local.ref}
      type="button"
      role="button"
      aria-pressed={local.pressed ?? false}
      aria-label={local['aria-label']}
      disabled={local.disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      class={toggleClassName()}
      {...others}
    >
      {local.children}
    </button>
  )
}
