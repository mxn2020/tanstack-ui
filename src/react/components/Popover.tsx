// packages/ui/src/react/components/Popover.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  forwardRef,
  memo,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils'
import { clamp, composeEventHandlers, getPortalContainer, mergeRefs, setRef } from '../lib/helpers'

type Side = 'top' | 'right' | 'bottom' | 'left'
type Align = 'start' | 'center' | 'end'

function computePosition(args: {
  triggerRect: DOMRect
  contentRect: DOMRect
  side: Side
  align: Align
  sideOffset: number
  alignOffset: number
  collisionPadding: number
}) {
  const { triggerRect, contentRect, side, align, sideOffset, alignOffset, collisionPadding } = args

  const vw = typeof window !== 'undefined' ? window.innerWidth : 0
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0

  let x = 0
  let y = 0

  if (side === 'bottom') y = triggerRect.bottom + sideOffset
  else if (side === 'top') y = triggerRect.top - contentRect.height - sideOffset
  else if (side === 'right') x = triggerRect.right + sideOffset
  else if (side === 'left') x = triggerRect.left - contentRect.width - sideOffset

  if (side === 'top' || side === 'bottom') {
    if (align === 'start') x = triggerRect.left
    if (align === 'center') x = triggerRect.left + (triggerRect.width - contentRect.width) / 2
    if (align === 'end') x = triggerRect.right - contentRect.width
    x += alignOffset
  } else {
    if (align === 'start') y = triggerRect.top
    if (align === 'center') y = triggerRect.top + (triggerRect.height - contentRect.height) / 2
    if (align === 'end') y = triggerRect.bottom - contentRect.height
    y += alignOffset
  }

  const pad = collisionPadding
  x = clamp(x, pad, Math.max(pad, vw - contentRect.width - pad))
  y = clamp(y, pad, Math.max(pad, vh - contentRect.height - pad))

  return { x, y }
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------------------------------- */

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: MutableRefObject<HTMLElement | null>
  contentRef: MutableRefObject<HTMLDivElement | null>
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopoverContext() {
  const ctx = useContext(PopoverContext)
  if (!ctx) throw new Error('Popover compound components must be used within a Popover component')
  return ctx
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------------------------------- */

interface PopoverProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Popover = memo(function Popover({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? !!controlledOpen : uncontrolledOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  const ctx = useMemo<PopoverContextValue>(() => ({ open, setOpen, triggerRef, contentRef }), [open, setOpen])

  return (
    <PopoverContext.Provider value={ctx}>
      <div className='relative'>{children}</div>
    </PopoverContext.Provider>
  )
})

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

interface PopoverTriggerProps {
  children: ReactNode
  asChild?: boolean
  className?: string
  toggle?: boolean
}

export const PopoverTrigger = memo(
  forwardRef<HTMLButtonElement, PopoverTriggerProps>(({ children, asChild = false, className, toggle = true }, ref) => {
    const { open, setOpen, triggerRef } = usePopoverContext()

    const onClick = useCallback(() => {
      setOpen(toggle ? !open : true)
    }, [open, setOpen, toggle])

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setOpen(toggle ? !open : true)
        }
      },
      [open, setOpen, toggle]
    )

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement
      const childProps = child.props as {
        onClick?: React.MouseEventHandler
        onKeyDown?: React.KeyboardEventHandler
        className?: string
      }
      // TypeScript can't infer props when cloning with ref, so we assert the type is correct
      return React.cloneElement(child, {
        ref: mergeRefs(setRef(triggerRef), ref), // ✅ no child.ref access
        onClick: composeEventHandlers(childProps.onClick, () => onClick()),
        onKeyDown: composeEventHandlers(childProps.onKeyDown, onKeyDown),
        className: cn(childProps.className, className),
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
        'data-state': open ? 'open' : 'closed',
      } as Record<string, unknown>)
    }

    return (
      <button
        ref={mergeRefs(setRef(triggerRef as React.MutableRefObject<HTMLButtonElement | null>), ref)}
        type='button'
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium',
          'ring-offset-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        aria-expanded={open}
        aria-haspopup='dialog'
        data-state={open ? 'open' : 'closed'}
      >
        {children}
      </button>
    )
  })
)
PopoverTrigger.displayName = 'PopoverTrigger'

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

interface PopoverContentProps {
  children: ReactNode
  className?: string
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  container?: HTMLElement
  autoFocus?: boolean
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}

export const PopoverContent = memo(
  forwardRef<HTMLDivElement, PopoverContentProps>(
    (
      {
        children,
        className,
        side = 'bottom',
        align = 'center',
        sideOffset = 8,
        alignOffset = 0,
        collisionPadding = 8,
        container,
        autoFocus = true,
        onEscapeKeyDown,
        onPointerDownOutside,
      },
      ref
    ) => {
      const { open, setOpen, triggerRef, contentRef } = usePopoverContext()
      const [mounted, setMounted] = useState(false)
      const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

      const portalContainer = container ?? getPortalContainer()

      useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
      }, [])

      const updatePosition = useCallback(() => {
        const triggerEl = triggerRef.current
        const contentEl = contentRef.current
        if (!triggerEl || !contentEl) return
        const triggerRect = triggerEl.getBoundingClientRect()
        const contentRect = contentEl.getBoundingClientRect()
        setPos(
          computePosition({
            triggerRect,
            contentRect,
            side,
            align,
            sideOffset,
            alignOffset,
            collisionPadding,
          })
        )
      }, [align, alignOffset, collisionPadding, side, sideOffset, triggerRef, contentRef])

      useLayoutEffect(() => {
        if (!open) return
        setPos(null)
        requestAnimationFrame(updatePosition)
      }, [open, updatePosition])

      useEffect(() => {
        if (!open) return
        const onResize = () => updatePosition()
        const onScroll = () => updatePosition()
        window.addEventListener('resize', onResize)
        window.addEventListener('scroll', onScroll, true)
        return () => {
          window.removeEventListener('resize', onResize)
          window.removeEventListener('scroll', onScroll, true)
        }
      }, [open, updatePosition])

      useEffect(() => {
        if (!open) return
        const onMouseDown = (event: MouseEvent) => {
          const t = event.target as Node
          const clickedTrigger = !!triggerRef.current && triggerRef.current.contains(t)
          const clickedContent = !!contentRef.current && contentRef.current.contains(t)
          if (!clickedTrigger && !clickedContent) {
            onPointerDownOutside?.(event as unknown as PointerEvent)
            setOpen(false)
            triggerRef.current?.focus?.()
          }
        }
        document.addEventListener('mousedown', onMouseDown)
        return () => document.removeEventListener('mousedown', onMouseDown)
      }, [open, onPointerDownOutside, setOpen, triggerRef, contentRef])

      useEffect(() => {
        if (!open) return
        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            onEscapeKeyDown?.(event)
            setOpen(false)
            triggerRef.current?.focus?.()
          }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [open, onEscapeKeyDown, setOpen, triggerRef])

      useEffect(() => {
        if (!open || !autoFocus) return
        const el = contentRef.current
        if (!el) return
        const first = el.querySelector<HTMLElement>(
          `button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])`
        )
        first?.focus()
      }, [open, autoFocus, contentRef])

      if (!open || !mounted || !portalContainer) return null

      const style: CSSProperties = {
        position: 'fixed',
        left: pos ? pos.x : -9999,
        top: pos ? pos.y : -9999,
      }

      return createPortal(
        <div
          ref={mergeRefs(setRef(contentRef), ref)} // ✅ correct ref for div content
          style={style}
          data-state={open ? 'open' : 'closed'}
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card p-2 shadow-lg',
            'origin-top data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className
          )}
          role='dialog'
          aria-modal='false'
        >
          {children}
        </div>,
        portalContainer
      )
    }
  )
)
PopoverContent.displayName = 'PopoverContent'

/* -------------------------------------------------------------------------------------------------
 * Close
 * ------------------------------------------------------------------------------------------------- */

interface PopoverCloseProps {
  children: ReactNode
  asChild?: boolean
  className?: string
}

export const PopoverClose = memo(
  forwardRef<HTMLButtonElement, PopoverCloseProps>(({ children, asChild = false, className }, ref) => {
    const { setOpen } = usePopoverContext()
    const onClick = useCallback(() => setOpen(false), [setOpen])

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement
      const childProps = child.props as {
        onClick?: React.MouseEventHandler
        className?: string
      }
      // TypeScript can't infer props when cloning, so we assert the type is correct
      return React.cloneElement(child, {
        onClick: composeEventHandlers(childProps.onClick, () => onClick()),
        className: cn(childProps.className, className),
      } as Record<string, unknown>)
    }

    return (
      <button ref={ref} type='button' onClick={onClick} className={className}>
        {children}
      </button>
    )
  })
)
PopoverClose.displayName = 'PopoverClose'
