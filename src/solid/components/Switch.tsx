// packages/ui/src/solid/components/Switch.tsx

import { Component, createSignal, createUniqueId, splitProps, Show } from 'solid-js'
import { cn } from '../lib/utils'
import type { FormComponentProps } from '../lib/types'

interface SwitchProps extends FormComponentProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  class?: string
  id?: string
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void)
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

export const Switch: Component<SwitchProps> = (props) => {
  const [local, others] = splitProps(props, [
    'label',
    'error',
    'helpText',
    'size',
    'checked',
    'defaultChecked',
    'disabled',
    'onChange',
    'onCheckedChange',
    'class',
    'id',
    'ref'
  ])

  const [internalChecked, setInternalChecked] = createSignal(local.defaultChecked ?? false)
  const generatedId = createUniqueId()
  const switchId = () => local.id || generatedId

  const isControlled = () => local.checked !== undefined
  const checked = () => isControlled() ? local.checked! : internalChecked()
  const hasError = () => Boolean(local.error)
  const sizes = sizeClasses[local.size ?? 'md']
  const disabled = () => local.disabled ?? false

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const newChecked = target.checked
    
    if (!isControlled()) {
      setInternalChecked(newChecked)
    }
    local.onChange?.(newChecked)
    local.onCheckedChange?.(newChecked)
  }

  const handleToggle = (e: MouseEvent) => {
    if (!disabled()) {
      e.preventDefault()
      e.stopPropagation()
      const newChecked = !checked()
      
      if (!isControlled()) {
        setInternalChecked(newChecked)
      }
      local.onChange?.(newChecked)
      local.onCheckedChange?.(newChecked)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled()) {
      e.preventDefault()
      const newChecked = !checked()
      
      if (!isControlled()) {
        setInternalChecked(newChecked)
      }
      local.onChange?.(newChecked)
      local.onCheckedChange?.(newChecked)
    }
  }

  return (
    <div class={cn('flex items-start', local.class)}>
      <div class="flex items-center">
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            ref={local.ref}
            id={switchId()}
            type="checkbox"
            checked={checked()}
            disabled={disabled()}
            onChange={handleChange}
            class="sr-only"
            aria-invalid={hasError()}
            aria-describedby={
              local.error ? `${switchId()}-error` : 
              local.helpText ? `${switchId()}-help` : undefined
            }
            {...others}
          />
          <div
            class={cn(
              'relative rounded-full transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-offset-2',
              sizes.track,
              checked()
                ? 'bg-primary'
                : 'bg-border',
              hasError()
                ? 'focus-within:ring-red-500'
                : 'focus-within:ring-primary',
              disabled() && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleToggle}
            role="switch"
            aria-checked={checked()}
            tabIndex={disabled() ? -1 : 0}
            onKeyDown={handleKeyDown}
          >
            <span
              class={cn(
                'absolute left-0.5 top-0.5 bg-card rounded-full shadow transform transition-transform duration-200 ease-in-out',
                sizes.thumb,
                checked() && sizes.translateX
              )}
            />
          </div>
        </label>
      </div>
      
      <Show when={local.label || local.helpText || local.error}>
        <div class="ml-3 text-sm">
          <Show when={local.label}>
            <label
              for={switchId()}
              class={cn(
                'block font-medium cursor-pointer',
                hasError() ? 'text-red-900' : 'text-foreground',
                disabled() && 'cursor-not-allowed opacity-50'
              )}
            >
              {local.label}
            </label>
          </Show>
          
          <Show when={local.error}>
            <p id={`${switchId()}-error`} class="mt-1 text-red-600">
              {local.error}
            </p>
          </Show>
          
          <Show when={local.helpText && !local.error}>
            <p id={`${switchId()}-help`} class="mt-1 text-muted-foreground">
              {local.helpText}
            </p>
          </Show>
        </div>
      </Show>
    </div>
  )
}
