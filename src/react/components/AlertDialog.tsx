// packages/ui/src/react/components/AlertDialog.tsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  memo,
  cloneElement,
  isValidElement,
} from 'react'
import type { ReactElement, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils'

interface AlertDialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = createContext<AlertDialogContextValue | undefined>(undefined)

const useAlertDialogContext = () => {
  const context = useContext(AlertDialogContext)
  if (!context) throw new Error('AlertDialog compound components must be used within an AlertDialog component')
  return context
}

interface AlertDialogProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const AlertDialog = memo(function AlertDialog({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  return (
    <AlertDialogContext.Provider value={{ open, setOpen: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
})

/* Trigger */
interface AlertDialogTriggerProps {
  children: ReactNode
  asChild?: boolean
  className?: string
}

export const AlertDialogTrigger = memo(
  forwardRef<HTMLElement, AlertDialogTriggerProps>(({ children, asChild = false, className }, ref) => {
    const { setOpen } = useAlertDialogContext()

    const openDialog = useCallback(() => setOpen(true), [setOpen])

    if (asChild) {
      if (!isValidElement(children)) return null
      const child = children as ReactElement

      // TypeScript can't infer props when cloning with ref, so we assert the type is correct
      return cloneElement(child, {
        ref,
        className: cn((child.props as { className?: string }).className, className),
        onClick: (e: React.MouseEvent) => {
          const childProps = child.props as { onClick?: React.MouseEventHandler }
          childProps.onClick?.(e)
          openDialog()
        },
      } as Record<string, unknown>)
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type='button'
        onClick={openDialog}
        className={cn('cursor-pointer', className)}
      >
        {children}
      </button>
    )
  })
)
AlertDialogTrigger.displayName = 'AlertDialogTrigger'

/* Portal */
interface AlertDialogPortalProps {
  children: ReactNode
  container?: HTMLElement
}

export const AlertDialogPortal = memo(function AlertDialogPortal({ children, container }: AlertDialogPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const portalContainer = container ?? (typeof document !== 'undefined' ? document.body : null)
  if (!mounted || !portalContainer) return null

  return createPortal(children, portalContainer)
})

/* Overlay */
interface AlertDialogOverlayProps {
  className?: string
  state?: 'open' | 'closed'
}

export const AlertDialogOverlay = memo(
  forwardRef<HTMLDivElement, AlertDialogOverlayProps>(({ className, state = 'open' }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
        data-state={state}
      />
    )
  })
)
AlertDialogOverlay.displayName = 'AlertDialogOverlay'

/* Content */
interface AlertDialogContentProps {
  children: ReactNode
  className?: string
  closeOnEscape?: boolean
  closeOnBackdropClick?: boolean
}

export const AlertDialogContent = memo(
  forwardRef<HTMLDivElement, AlertDialogContentProps>(
    ({ children, className, closeOnEscape = false, closeOnBackdropClick = false }, ref) => {
      const { open, setOpen } = useAlertDialogContext()
      const contentRef = useRef<HTMLDivElement | null>(null)
      const lastActiveRef = useRef<HTMLElement | null>(null)

      const mergedRef = useCallback(
        (node: HTMLDivElement | null) => {
          contentRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        },
        [ref]
      )

      useEffect(() => {
        if (!open) return
        lastActiveRef.current = document.activeElement as HTMLElement

        if (!closeOnEscape) return

        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') setOpen(false)
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [open, closeOnEscape, setOpen])

      useEffect(() => {
        if (!open) return
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = 'unset'
        }
      }, [open])

      useEffect(() => {
        if (!open) return

        const node = contentRef.current
        if (!node) return

        const focusables = node.querySelectorAll<HTMLElement>(
          `button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])`
        )
        focusables[0]?.focus()

        return () => {
          lastActiveRef.current?.focus?.()
        }
      }, [open])

      if (!open) return null

      const state: 'open' | 'closed' = 'open'

      return (
        <AlertDialogPortal>
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div
              className='fixed inset-0'
              onMouseDown={(e) => {
                if (!closeOnBackdropClick) return
                if (e.target === e.currentTarget) setOpen(false)
              }}
            >
              <AlertDialogOverlay state={state} />
            </div>

            <div
              ref={mergedRef}
              className={cn(
                'relative z-50 grid w-full max-w-lg gap-4 border bg-card p-6 shadow-lg duration-200 sm:rounded-lg',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
                className
              )}
              role='alertdialog'
              aria-modal='true'
              data-state={state}
            >
              {children}
            </div>
          </div>
        </AlertDialogPortal>
      )
    }
  )
)
AlertDialogContent.displayName = 'AlertDialogContent'

/* Header */
interface AlertDialogHeaderProps {
  children: ReactNode
  className?: string
}

export const AlertDialogHeader = memo(
  forwardRef<HTMLDivElement, AlertDialogHeaderProps>(({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}>
        {children}
      </div>
    )
  })
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

/* Title */
interface AlertDialogTitleProps {
  children: ReactNode
  className?: string
}

export const AlertDialogTitle = memo(
  forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(({ children, className }, ref) => {
    return (
      <h2 ref={ref} className={cn('text-lg font-semibold', className)}>
        {children}
      </h2>
    )
  })
)
AlertDialogTitle.displayName = 'AlertDialogTitle'

/* Description */
interface AlertDialogDescriptionProps {
  children: ReactNode
  className?: string
}

export const AlertDialogDescription = memo(
  forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(({ children, className }, ref) => {
    return (
      <p ref={ref} className={cn('text-sm text-muted-foreground', className)}>
        {children}
      </p>
    )
  })
)
AlertDialogDescription.displayName = 'AlertDialogDescription'

/* Footer */
interface AlertDialogFooterProps {
  children: ReactNode
  className?: string
}

export const AlertDialogFooter = memo(
  forwardRef<HTMLDivElement, AlertDialogFooterProps>(({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
        {children}
      </div>
    )
  })
)
AlertDialogFooter.displayName = 'AlertDialogFooter'

/* Action */
interface AlertDialogActionProps {
  children: ReactNode
  asChild?: boolean
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const AlertDialogAction = memo(
  forwardRef<HTMLButtonElement, AlertDialogActionProps>(({ children, asChild = false, className, onClick, disabled }, ref) => {
    const { setOpen } = useAlertDialogContext()

    const handle = useCallback(() => {
      onClick?.()
      setOpen(false)
    }, [onClick, setOpen])

    if (asChild) {
      if (!isValidElement(children)) return null
      const child = children as ReactElement
      const childProps = child.props as {
        onClick?: React.MouseEventHandler
        className?: string
      }
      // TypeScript can't infer props when cloning, so we assert the type is correct
      return cloneElement(child, {
        className: cn(childProps.className, className),
        onClick: (e: React.MouseEvent) => {
          childProps.onClick?.(e)
          handle()
        },
      } as Record<string, unknown>)
    }

    return (
      <button
        ref={ref}
        type='button'
        onClick={handle}
        disabled={disabled}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white ring-offset-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        {children}
      </button>
    )
  })
)
AlertDialogAction.displayName = 'AlertDialogAction'

/* Cancel */
interface AlertDialogCancelProps {
  children: ReactNode
  asChild?: boolean
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const AlertDialogCancel = memo(
  forwardRef<HTMLButtonElement, AlertDialogCancelProps>(({ children, asChild = false, className, onClick, disabled }, ref) => {
    const { setOpen } = useAlertDialogContext()

    const handle = useCallback(() => {
      onClick?.()
      setOpen(false)
    }, [onClick, setOpen])

    if (asChild) {
      if (!isValidElement(children)) return null
      const child = children as ReactElement
      const childProps = child.props as {
        onClick?: React.MouseEventHandler
        className?: string
      }
      // TypeScript can't infer props when cloning, so we assert the type is correct
      return cloneElement(child, {
        className: cn(childProps.className, className),
        onClick: (e: React.MouseEvent) => {
          childProps.onClick?.(e)
          handle()
        },
      } as Record<string, unknown>)
    }

    return (
      <button
        ref={ref}
        type='button'
        onClick={handle}
        disabled={disabled}
        className={cn(
          'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground ring-offset-white transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0',
          className
        )}
      >
        {children}
      </button>
    )
  })
)
AlertDialogCancel.displayName = 'AlertDialogCancel'
