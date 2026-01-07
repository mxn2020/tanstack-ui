// packages/ui/src/solid/components/Checkbox.tsx

import { Component, JSX, splitProps, createUniqueId, Show } from 'solid-js'
import { cn } from '../lib/utils'
import { Check } from 'lucide-solid'
import type { FormComponentProps } from '../lib/types'

interface CheckboxProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'>, FormComponentProps {
  label?: string
  indeterminate?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void)
}

export const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, others] = splitProps(props, [
    'label',
    'error',
    'helpText',
    'indeterminate',
    'checked',
    'disabled',
    'onChange',
    'class',
    'id',
    'ref'
  ])

  const generatedId = createUniqueId()
  const checkboxId = () => local.id || generatedId
  const hasError = () => Boolean(local.error)
  const checked = () => local.checked ?? false
  const disabled = () => local.disabled ?? false
  const indeterminate = () => local.indeterminate ?? false

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    local.onChange?.(target.checked)
  }

  const handleBoxClick = () => {
    if (!disabled()) {
      local.onChange?.(!checked())
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled()) {
      e.preventDefault()
      local.onChange?.(!checked())
    }
  }

  return (
    <div class={cn('flex items-start', local.class)}>
      <div class="flex items-center h-5">
        <div class="relative">
          <input
            ref={local.ref}
            id={checkboxId()}
            type="checkbox"
            checked={checked()}
            disabled={disabled()}
            onChange={handleChange}
            class="sr-only"
            aria-invalid={hasError()}
            aria-describedby={
              local.error ? `${checkboxId()}-error` : 
              local.helpText ? `${checkboxId()}-help` : undefined
            }
            {...others}
          />
          <div
            class={cn(
              'w-4 h-4 border rounded transition-colors cursor-pointer flex items-center justify-center',
              checked() || indeterminate()
                ? 'bg-blue-600 border-blue-600'
                : 'bg-card border-border hover:border-muted-foreground',
              hasError() 
                ? 'border-red-300 focus-within:ring-red-500' 
                : 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
              disabled() && 'opacity-50 cursor-not-allowed'
            )}
            onClick={handleBoxClick}
            role="checkbox"
            aria-checked={indeterminate() ? 'mixed' : checked()}
            tabIndex={disabled() ? -1 : 0}
            onKeyDown={handleKeyDown}
          >
            <Show when={checked() && !indeterminate()}>
              <Check class="w-3 h-3 text-white" stroke-width={3} />
            </Show>
            <Show when={indeterminate()}>
              <div class="w-2 h-0.5 bg-card rounded" />
            </Show>
          </div>
        </div>
      </div>
      
      <Show when={local.label || local.helpText || local.error}>
        <div class="ml-2 text-sm">
          <Show when={local.label}>
            <label
              for={checkboxId()}
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
            <p id={`${checkboxId()}-error`} class="mt-1 text-red-600">
              {local.error}
            </p>
          </Show>
          
          <Show when={local.helpText && !local.error}>
            <p id={`${checkboxId()}-help`} class="mt-1 text-muted-foreground">
              {local.helpText}
            </p>
          </Show>
        </div>
      </Show>
    </div>
  )
}
