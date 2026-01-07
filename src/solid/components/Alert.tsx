// packages/ui/src/solid/components/Alert.tsx

import { Component, JSX, splitProps, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { cn } from '../lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-solid'

interface AlertProps {
  children: JSX.Element
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

const variantClasses = {
  default: 'bg-surface border-border text-foreground',
  destructive: 'tone-danger tone-surface',
  success: 'tone-success tone-surface',
  warning: 'tone-warning tone-surface',
} as const

export const Alert: Component<AlertProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'variant', 'class', 'ref'])
  
  return (
    <div
      ref={local.ref}
      role="alert"
      class={cn('relative w-full rounded-lg border px-4 py-3 text-sm', variantClasses[local.variant ?? 'default'], local.class)}
      {...others}
    >
      {local.children}
    </div>
  )
}

interface AlertTitleProps {
  children: JSX.Element
  class?: string
  ref?: HTMLHeadingElement | ((el: HTMLHeadingElement) => void)
}

export const AlertTitle: Component<AlertTitleProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <h5 ref={local.ref} class={cn('mb-1 font-medium leading-none tracking-tight', local.class)} {...others}>
      {local.children}
    </h5>
  )
}

interface AlertDescriptionProps {
  children: JSX.Element
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const AlertDescription: Component<AlertDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <div ref={local.ref} class={cn('text-sm opacity-90', local.class)} {...others}>
      {local.children}
    </div>
  )
}

interface AlertIconProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

const variantIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
} as const

const iconClasses = {
  default: 'text-accent',
  destructive: 'text-danger',
  success: 'text-success',
  warning: 'text-warning',
} as const

export const AlertIcon: Component<AlertIconProps> = (props) => {
  const [local, others] = splitProps(props, ['variant', 'class', 'ref'])
  const variant = () => local.variant ?? 'default'
  const IconComponent = () => variantIcons[variant()]
  
  return (
    <div ref={local.ref} class={cn('mr-2 mt-0.5', local.class)} {...others}>
      <Dynamic component={IconComponent()} class={cn('h-4 w-4', iconClasses[variant()])} aria-hidden="true" />
    </div>
  )
}

interface CompoundAlertProps {
  children: JSX.Element
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  title?: string
  showIcon?: boolean
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const CompoundAlert: Component<CompoundAlertProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'variant', 'title', 'showIcon', 'class', 'ref'])
  
  return (
    <Alert ref={local.ref} variant={local.variant} class={local.class} {...others}>
      <div class="flex">
        <Show when={local.showIcon ?? true}>
          <AlertIcon variant={local.variant} />
        </Show>
        <div class="flex-1">
          <Show when={local.title}>
            <AlertTitle>{local.title}</AlertTitle>
          </Show>
          <AlertDescription>{local.children}</AlertDescription>
        </div>
      </div>
    </Alert>
  )
}