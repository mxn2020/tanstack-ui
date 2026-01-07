// packages/ui/src/solid/components/Input.tsx

import { Component, JSX, splitProps, createUniqueId, Show } from 'solid-js'
import { cn } from '../lib/utils'
import type { InputSize, FormComponentProps } from '../lib/types'

interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size'>, FormComponentProps {
  label?: string
  description?: string
  size?: InputSize
  icon?: JSX.Element
  endIcon?: JSX.Element
  ref?: (el: HTMLInputElement) => void
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

export const Input: Component<InputProps> = (props) => {
  const [local, inputProps] = splitProps(props, [
    'label',
    'error',
    'description',
    'helpText',
    'size',
    'icon',
    'endIcon',
    'class',
    'id',
    'disabled',
    'required',
    'ref'
  ])

  const generatedId = createUniqueId()
  const inputId = () => local.id || generatedId
  const hasError = () => Boolean(local.error)
  const size = () => local.size || 'md'
  const disabled = () => local.disabled || false
  const required = () => local.required || false

  return (
    <div class='w-full'>
      <Show when={local.label || local.description}>
        <div class='flex items-start justify-between gap-2 mb-1'>
          <Show when={local.label}>
            <label 
              for={inputId()} 
              class={cn(
                'block text-sm font-medium text-foreground',
                disabled() && 'opacity-50'
              )}
            >
              {local.label}
              <Show when={required()}>
                <span class='text-red-500 ml-1'>*</span>
              </Show>
            </label>
          </Show>
          <Show when={local.description}>
            <p
              class={cn(
                'text-xs text-muted-foreground leading-tight text-right',
                disabled() && 'opacity-50'
              )}
            >
              {local.description}
            </p>
          </Show>
        </div>
      </Show>
      
      <div class='relative'>
        <Show when={local.icon}>
          <div class='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground'>
            {local.icon}
          </div>
        </Show>
        
        <input
          ref={local.ref}
          id={inputId()}
          disabled={disabled()}
          required={required()}
          class={cn(
            'block w-full border border-border rounded-lg bg-card text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-surface disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors',
            sizeClasses[size()],
            local.icon && 'pl-10',
            local.endIcon && 'pr-10',
            hasError() && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            local.class
          )}
          aria-invalid={hasError()}
          aria-describedby={
            local.error ? `${inputId()}-error` : 
            local.helpText ? `${inputId()}-help` : undefined
          }
          {...inputProps}
        />
        
        <Show when={local.endIcon}>
          <div class='absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground'>
            {local.endIcon}
          </div>
        </Show>
      </div>
      
      <Show when={local.error}>
        <p id={`${inputId()}-error`} class='mt-1 text-sm text-red-600'>
          {local.error}
        </p>
      </Show>
      
      <Show when={local.helpText && !local.error}>
        <p id={`${inputId()}-help`} class='mt-1 text-sm text-muted-foreground'>
          {local.helpText}
        </p>
      </Show>
    </div>
  )
}
