// packages/ui/src/react/components/Alert.tsx

import { forwardRef, ReactNode, memo } from 'react'
import { cn } from '../lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface AlertProps {
  children: ReactNode
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  className?: string
}

const variantClasses = {
  default: 'bg-surface border-border text-foreground',
  destructive: 'tone-danger tone-surface',
  success: 'tone-success tone-surface',
  warning: 'tone-warning tone-surface',
} as const

export const Alert = memo(
  forwardRef<HTMLDivElement, AlertProps>(({ children, variant = 'default', className }, ref) => {
    return (
      <div
        ref={ref}
        role='alert'
        className={cn('relative w-full rounded-lg border px-4 py-3 text-sm', variantClasses[variant], className)}
      >
        {children}
      </div>
    )
  })
)
Alert.displayName = 'Alert'

interface AlertTitleProps {
  children: ReactNode
  className?: string
}

export const AlertTitle = memo(
  forwardRef<HTMLHeadingElement, AlertTitleProps>(({ children, className }, ref) => {
    return (
      <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)}>
        {children}
      </h5>
    )
  })
)
AlertTitle.displayName = 'AlertTitle'

interface AlertDescriptionProps {
  children: ReactNode
  className?: string
}

export const AlertDescription = memo(
  forwardRef<HTMLParagraphElement, AlertDescriptionProps>(({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('text-sm opacity-90', className)}>
        {children}
      </div>
    )
  })
)
AlertDescription.displayName = 'AlertDescription'

interface AlertIconProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  className?: string
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

export const AlertIcon = memo(
  forwardRef<HTMLDivElement, AlertIconProps>(({ variant = 'default', className }, ref) => {
    const IconComponent = variantIcons[variant]
    return (
      <div ref={ref} className={cn('mr-2 mt-0.5', className)}>
        <IconComponent className={cn('h-4 w-4', iconClasses[variant])} aria-hidden='true' />
      </div>
    )
  })
)
AlertIcon.displayName = 'AlertIcon'

interface CompoundAlertProps {
  children: ReactNode
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  title?: string
  showIcon?: boolean
  className?: string
}

export const CompoundAlert = memo(
  forwardRef<HTMLDivElement, CompoundAlertProps>(
    ({ children, variant = 'default', title, showIcon = true, className }, ref) => {
      return (
        <Alert ref={ref} variant={variant} className={className}>
          <div className='flex'>
            {showIcon && <AlertIcon variant={variant} />}
            <div className='flex-1'>
              {title && <AlertTitle>{title}</AlertTitle>}
              <AlertDescription>{children}</AlertDescription>
            </div>
          </div>
        </Alert>
      )
    }
  )
)
CompoundAlert.displayName = 'CompoundAlert'
