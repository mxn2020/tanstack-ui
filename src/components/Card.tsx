// packages/ui/src/components/Card.tsx

import { forwardRef, ReactNode, memo, useCallback } from 'react'
import { cn } from '../lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

interface CardFooterProps {
  children: ReactNode
  className?: string
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

export const Card = memo(
  forwardRef<HTMLDivElement, CardProps>(
    ({ children, className, padding = 'none', shadow = 'sm', hover = false, onClick }, ref) => {
      const handleClick = useCallback(() => onClick?.(), [onClick])

      return (
        <div
          ref={ref}
          className={cn(
            'rounded-lg border border-border bg-card text-foreground',
            // keep shadow controlled by prop
            shadowClasses[shadow],
            // hover behavior only when requested or clickable
            (hover || !!onClick) ? 'transition-shadow hover:shadow-md cursor-pointer' : '',
            paddingClasses[padding],
            className
          )}
          onClick={onClick ? handleClick : undefined}
        >
          {children}
        </div>
      )
    }
  )
)
Card.displayName = 'Card'

export const CardHeader = memo(
  forwardRef<HTMLDivElement, CardHeaderProps>(({ children, className }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  ))
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = memo(
  forwardRef<HTMLHeadingElement, CardTitleProps>(({ children, className }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  ))
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = memo(
  forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ children, className }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  ))
)
CardDescription.displayName = 'CardDescription'

export const CardContent = memo(
  forwardRef<HTMLDivElement, CardContentProps>(({ children, className }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  ))
)
CardContent.displayName = 'CardContent'

export const CardFooter = memo(
  forwardRef<HTMLDivElement, CardFooterProps>(({ children, className }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)}>
      {children}
    </div>
  ))
)
CardFooter.displayName = 'CardFooter'
