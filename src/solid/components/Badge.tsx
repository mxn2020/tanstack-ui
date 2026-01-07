// packages/ui/src/solid/components/Badge.tsx

import { Component, JSX, splitProps } from 'solid-js'
import { cn } from '../lib/utils'
import type { BadgeVariant, BadgeSize, PriorityLevel } from '../lib/types'

interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  children: JSX.Element
  variant?: BadgeVariant
  size?: BadgeSize
  ref?: HTMLSpanElement | ((el: HTMLSpanElement) => void)
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-[color:var(--primary)] border-[color-mix(in_oklab,var(--primary)_35%,transparent)]',
  primary:
    'bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-[color:var(--primary)] border-[color-mix(in_oklab,var(--primary)_35%,transparent)]',
  secondary: 'bg-surface text-foreground border-border',
  success:
    'bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-success border-[color-mix(in_oklab,var(--success)_35%,transparent)]',
  warning: 'tone-warning tone-surface',
  danger:
    'bg-[color-mix(in_oklab,var(--danger)_18%,transparent)] text-danger border-[color-mix(in_oklab,var(--danger)_35%,transparent)]',
  destructive:
    'bg-[color-mix(in_oklab,var(--danger)_26%,transparent)] text-danger border-[color-mix(in_oklab,var(--danger)_45%,transparent)]',
  error:
    'bg-[color-mix(in_oklab,var(--danger)_18%,transparent)] text-danger border-[color-mix(in_oklab,var(--danger)_35%,transparent)]',
  info:
    'bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] text-accent border-[color-mix(in_oklab,var(--primary)_28%,transparent)]',
  outline: 'bg-card text-foreground border-border hover:bg-surface',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export const Badge: Component<BadgeProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'variant', 'size', 'class', 'ref'])
  
  const badgeClassName = () => cn(
    'inline-flex items-center rounded-full border font-medium',
    variantClasses[local.variant ?? 'secondary'],
    sizeClasses[local.size ?? 'md'],
    local.class
  )

  return (
    <span ref={local.ref} class={badgeClassName()} {...others}>
      {local.children}
    </span>
  )
}

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
}

export const StatusBadge: Component<StatusBadgeProps> = (props) => {
  const [local, others] = splitProps(props, ['status'])
  
  const variants = {
    active: 'success' as const,
    completed: 'primary' as const,
    on_hold: 'warning' as const,
    cancelled: 'danger' as const,
  }

  return (
    <Badge variant={variants[local.status]} {...others}>
      {local.status.charAt(0).toUpperCase() + local.status.slice(1)}
    </Badge>
  )
}

interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: PriorityLevel
}

export const PriorityBadge: Component<PriorityBadgeProps> = (props) => {
  const [local, others] = splitProps(props, ['priority'])
  
  const variants = {
    low: 'secondary' as const,
    medium: 'info' as const,
    high: 'warning' as const,
    urgent: 'danger' as const,
  }

  return (
    <Badge variant={variants[local.priority]} {...others}>
      {local.priority.charAt(0).toUpperCase() + local.priority.slice(1)}
    </Badge>
  )
}
