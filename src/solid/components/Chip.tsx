// packages/ui/src/solid/components/Chip.tsx

import { Component, JSX, splitProps, Show } from 'solid-js'
import { X } from 'lucide-solid'
import { cn } from '../lib/utils'

type ChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'
type ChipSize = 'sm' | 'md' | 'lg'

interface ChipProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  children: JSX.Element
  variant?: ChipVariant
  size?: ChipSize
  onRemove?: () => void
  removable?: boolean
  disabled?: boolean
  ref?: HTMLSpanElement | ((el: HTMLSpanElement) => void)
}

const variantClasses: Record<ChipVariant, string> = {
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  secondary: 'bg-surface text-foreground border-border',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  default: 'bg-surface text-foreground border-border'
}

const sizeClasses: Record<ChipSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base'
}

const removeButtonSizeClasses: Record<ChipSize, string> = {
  sm: 'ml-1 -mr-0.5 p-0.5',
  md: 'ml-2 -mr-1 p-0.5',
  lg: 'ml-2 -mr-1 p-1'
}

const iconSizeClasses: Record<ChipSize, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-4 w-4'
}

export const Chip: Component<ChipProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'variant',
    'size',
    'class',
    'onRemove',
    'removable',
    'disabled',
    'onClick',
    'ref'
  ])

  const variant = () => local.variant ?? 'default'
  const size = () => local.size ?? 'md'
  const disabled = () => local.disabled ?? false
  const hasRemove = () => (local.removable ?? false) || !!local.onRemove
  const isClickable = () => Boolean(local.onClick) && !disabled()

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation()
    if (!disabled()) {
      local.onRemove?.()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isClickable() && !disabled() && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      e.currentTarget?.dispatchEvent(clickEvent)
    }
  }

  const chipClassName = () => cn(
    'inline-flex items-center rounded-full border font-medium transition-colors',
    variantClasses[variant()],
    sizeClasses[size()],
    isClickable() && 'cursor-pointer hover:opacity-80',
    disabled() && 'opacity-50 cursor-not-allowed',
    local.class
  )

  return (
    <span
      ref={local.ref}
      class={chipClassName()}
      onClick={local.onClick}
      role={isClickable() ? 'button' : undefined}
      tabIndex={isClickable() && !disabled() ? 0 : undefined}
      onKeyDown={isClickable() ? handleKeyDown : undefined}
      {...others}
    >
      {local.children}
      <Show when={hasRemove()}>
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled()}
          class={cn(
            'rounded-full hover:bg-black/10 transition-colors focus:outline-none focus:ring-1 focus:ring-black/20',
            removeButtonSizeClasses[size()],
            disabled() && 'cursor-not-allowed hover:bg-transparent'
          )}
          aria-label="Remove"
          tabIndex={disabled() ? -1 : 0}
        >
          <X class={iconSizeClasses[size()]} />
        </button>
      </Show>
    </span>
  )
}
