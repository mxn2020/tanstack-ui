// packages/ui/src/react/components/Badge.tsx

import { forwardRef, memo } from 'react'
import type { HTMLAttributes, ElementRef, ReactNode } from 'react'
import { cn } from '../lib/utils'
import type { BadgeVariant, BadgeSize, PriorityLevel} from '../lib/types'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  asChild?: boolean
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

export const Badge = memo(
  forwardRef<ElementRef<'span'>, BadgeProps>(({ children, variant = 'secondary', size = 'md', asChild = false, className, ...props }, ref) => {
    const badgeClassName = cn(
      'inline-flex items-center rounded-full border font-medium',
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    if (asChild) {
      return (
        <span className={badgeClassName} {...props}>
          {children}
        </span>
      )
    }

    return (
      <span ref={ref} className={badgeClassName} {...props}>
        {children}
      </span>
    )
  })
)
Badge.displayName = 'Badge'

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
}

export const StatusBadge = memo(
  forwardRef<ElementRef<'span'>, StatusBadgeProps>(({ status, ...props }, ref) => {
    const variants = {
      active: 'success' as const,
      completed: 'primary' as const,
      on_hold: 'warning' as const,
      cancelled: 'danger' as const,
    }

    return (
      <Badge ref={ref} variant={variants[status]} {...props}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  })
)
StatusBadge.displayName = 'StatusBadge'

interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: PriorityLevel
}

export const PriorityBadge = memo(
  forwardRef<ElementRef<'span'>, PriorityBadgeProps>(({ priority, ...props }, ref) => {
    const variants = {
      low: 'secondary' as const,
      medium: 'info' as const,
      high: 'warning' as const,
      urgent: 'danger' as const,
    }

    return (
      <Badge ref={ref} variant={variants[priority]} {...props}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  })
)
PriorityBadge.displayName = 'PriorityBadge'
