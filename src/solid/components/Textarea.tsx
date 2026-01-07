// packages/ui/src/solid/components/Textarea.tsx

import { Component, JSX, splitProps, Show, createUniqueId } from 'solid-js'
import { cn } from '../lib/utils'
import type { FormComponentProps } from '../lib/types'

interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, FormComponentProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  ref?: HTMLTextAreaElement | ((el: HTMLTextAreaElement) => void)
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base'
}

const resizeClasses = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize'
}

export const Textarea: Component<TextareaProps> = (props) => {
  const [local, others] = splitProps(props, [
    'label',
    'error',
    'helpText',
    'size',
    'resize',
    'class',
    'id',
    'disabled',
    'required',
    'onChange',
    'ref'
  ])
  
  const generatedId = createUniqueId()
  const textareaId = () => local.id || generatedId
  const hasError = () => Boolean(local.error)

  return (
    <div class="w-full">
      <Show when={local.label}>
        <label 
          for={textareaId()} 
          class={cn(
            'block text-sm font-medium text-foreground mb-1',
            local.disabled && 'opacity-50'
          )}
        >
          {local.label}
          <Show when={local.required}>
            <span class="text-red-500 ml-1">*</span>
          </Show>
        </label>
      </Show>
      
      <textarea
        ref={local.ref}
        id={textareaId()}
        disabled={local.disabled}
        required={local.required}
        onChange={local.onChange}
        class={cn(
          'block w-full border border-border rounded-lg bg-card text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent disabled:bg-surface disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors min-h-[80px]',
          sizeClasses[local.size ?? 'md'],
          resizeClasses[local.resize ?? 'vertical'],
          hasError() && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          local.class
        )}
        aria-invalid={hasError()}
        aria-describedby={
          local.error ? `${textareaId()}-error` : 
          local.helpText ? `${textareaId()}-help` : undefined
        }
        {...others}
      />
      
      <Show when={local.error}>
        <p id={`${textareaId()}-error`} class="mt-1 text-sm text-red-600">
          {local.error}
        </p>
      </Show>
      
      <Show when={local.helpText && !local.error}>
        <p id={`${textareaId()}-help`} class="mt-1 text-sm text-muted-foreground">
          {local.helpText}
        </p>
      </Show>
    </div>
  )
}
