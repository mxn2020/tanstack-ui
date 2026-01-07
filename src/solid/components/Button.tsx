// packages/ui/src/solid/components/Button.tsx

import { Show, splitProps, type JSX, type Component } from 'solid-js'
import { cn } from '../lib/utils'

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'danger'
  | 'destructive'
  | 'ghost'
  | 'outline'
  | 'link'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'default'

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: JSX.Element
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-[color:var(--primary)] text-primary-foreground border-transparent hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  primary:
    'bg-[color:var(--primary)] text-primary-foreground border-transparent hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  secondary:
    'bg-surface text-foreground border-border hover:bg-card focus-visible:ring-[color:var(--ring)]',
  success:
    'tone-success tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  warning:
    'tone-warning tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  error:
    'tone-danger tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  danger:
    'tone-danger tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  destructive:
    'tone-danger tone-surface hover:opacity-90 focus-visible:ring-[color:var(--ring)]',
  ghost:
    'bg-transparent text-foreground border-transparent hover:bg-surface focus-visible:ring-[color:var(--ring)]',
  outline:
    'bg-transparent text-foreground border-border hover:bg-surface focus-visible:ring-[color:var(--ring)]',
  link:
    'bg-transparent text-[color:var(--primary)] border-transparent hover:underline focus-visible:ring-[color:var(--ring)] underline-offset-4',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'p-2 h-9 w-9',
  default: 'px-4 py-2 text-sm',
}

const LoadingSpinner: Component = () => (
  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

export const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'loading',
    'disabled',
    'icon',
    'class',
    'className',
    'children',
  ])

  const isDisabled = () => local.disabled || local.loading
  const hasText = () => !!local.children
  const showIcon = () => !local.loading && !!local.icon

  const buttonClasses = () =>
    cn(
      [
        'inline-flex items-center justify-center rounded-lg border font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[local.variant || 'primary'],
        sizeClasses[local.size || 'md'],
        local.class || local.className,
      ]
    )

  return (
    <button class={buttonClasses()} disabled={isDisabled()} {...others}>
      <Show when={local.loading}>
        <LoadingSpinner />
      </Show>
      <Show when={showIcon()}>
        <span class={hasText() ? 'mr-2' : ''}>{local.icon}</span>
      </Show>
      {local.children}
    </button>
  )
}
