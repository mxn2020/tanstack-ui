// packages/ui/src/solid/components/Card.tsx

import { splitProps, type JSX, type Component, type ParentComponent } from 'solid-js'
import { cn } from '../lib/utils'

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Card: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'className', 'children'])

  return (
    <div
      class={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        local.class || local.className
      )}
      {...others}
    >
      {local.children}
    </div>
  )
}

export const CardHeader: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'className', 'children'])

  return (
    <div
      class={cn('flex flex-col space-y-1.5 p-6', local.class || local.className)}
      {...others}
    >
      {local.children}
    </div>
  )
}

export const CardTitle: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'className', 'children'])

  return (
    <h3
      class={cn('text-2xl font-semibold leading-none tracking-tight', local.class || local.className)}
      {...others}
    >
      {local.children}
    </h3>
  )
}

export const CardDescription: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'className', 'children'])

  return (
    <p
      class={cn('text-sm text-muted-foreground', local.class || local.className)}
      {...others}
    >
      {local.children}
    </p>
  )
}

export const CardContent: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'className', 'children'])

  return (
    <div class={cn('p-6 pt-0', local.class || local.className)} {...others}>
      {local.children}
    </div>
  )
}

export const CardFooter: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'className', 'children'])

  return (
    <div class={cn('flex items-center p-6 pt-0', local.class || local.className)} {...others}>
      {local.children}
    </div>
  )
}
