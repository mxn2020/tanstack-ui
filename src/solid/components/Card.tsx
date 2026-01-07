// packages/ui/src/solid/components/Card.tsx

import { Component, JSX, splitProps } from 'solid-js'
import { cn } from '../lib/utils'

interface CardProps {
  children: JSX.Element
  class?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

interface CardHeaderProps {
  children: JSX.Element
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

interface CardContentProps {
  children: JSX.Element
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

interface CardTitleProps {
  children: JSX.Element
  class?: string
  ref?: HTMLHeadingElement | ((el: HTMLHeadingElement) => void)
}

interface CardDescriptionProps {
  children: JSX.Element
  class?: string
  ref?: HTMLParagraphElement | ((el: HTMLParagraphElement) => void)
}

interface CardFooterProps {
  children: JSX.Element
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
} as const

export const Card: Component<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'padding', 'shadow', 'hover', 'onClick', 'ref'])

  const handleClick = () => local.onClick?.()

  return (
    <div
      ref={local.ref}
      class={cn(
        'rounded-lg border border-border bg-card text-foreground',
        shadowClasses[local.shadow ?? 'sm'],
        (local.hover || !!local.onClick) ? 'transition-shadow hover:shadow-md cursor-pointer' : '',
        paddingClasses[local.padding ?? 'none'],
        local.class
      )}
      onClick={local.onClick ? handleClick : undefined}
      {...others}
    >
      {local.children}
    </div>
  )
}

export const CardHeader: Component<CardHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <div ref={local.ref} class={cn('flex flex-col space-y-1.5 p-6', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export const CardTitle: Component<CardTitleProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <h3 ref={local.ref} class={cn('text-2xl font-semibold leading-none tracking-tight', local.class)} {...others}>
      {local.children}
    </h3>
  )
}

export const CardDescription: Component<CardDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <p ref={local.ref} class={cn('text-sm text-muted-foreground', local.class)} {...others}>
      {local.children}
    </p>
  )
}

export const CardContent: Component<CardContentProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <div ref={local.ref} class={cn('p-6 pt-0', local.class)} {...others}>
      {local.children}
    </div>
  )
}

export const CardFooter: Component<CardFooterProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <div ref={local.ref} class={cn('flex items-center p-6 pt-0', local.class)} {...others}>
      {local.children}
    </div>
  )
}
