// src/components/ui/LinkButton.tsx

import { Link } from '@tanstack/react-router'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '../components/Button'

type RouterLinkProps = ComponentProps<typeof Link>
type ButtonProps = ComponentProps<typeof Button>

type LinkButtonProps = Omit<ButtonProps, 'asChild' | 'type' | 'children'> &
  RouterLinkProps & {
    children: ReactNode
  }

/**
 * LinkButton
 * - Wraps TanStack Router's Link with our Button styles via `asChild`
 * - Ensures consistent sizing/typography between links and buttons
 */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...linkProps
}: LinkButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link {...linkProps}>{children}</Link>
    </Button>
  )
}
