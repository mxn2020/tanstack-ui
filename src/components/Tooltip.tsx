// packages/ui/src/components/Tooltip.tsx

import {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
  cloneElement,
  ReactElement,
  memo,
  createContext,
  useContext,
} from 'react'
import type { HTMLAttributes, ElementRef, ReactNode } from 'react'
import { cn } from '../lib/utils'

type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

interface LegacyTooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string
  children: ReactElement
  position?: TooltipSide
  delay?: number
  disabled?: boolean
}

interface TooltipProviderProps {
  children: ReactNode
}

interface TooltipRootProps {
  delay?: number
  children: ReactNode
}

interface TooltipTriggerProps {
  children: ReactElement
  asChild?: boolean
}

interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: TooltipSide
  align?: 'center' | 'start' | 'end'
}

interface ChildElementHandlers extends Record<string, unknown> {
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
  onFocus?: (e: React.FocusEvent) => void
  onBlur?: (e: React.FocusEvent) => void
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-foreground',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-foreground',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-foreground',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-foreground',
}

// =========================
// Legacy Tooltip (content prop) for backwards compatibility
// =========================

const LegacyTooltip = memo(forwardRef<ElementRef<'div'>, LegacyTooltipProps>(
  ({
    content,
    children,
    position = 'top',
    delay = 200,
    disabled = false,
    className,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const showTooltip = useCallback(() => {
      if (disabled) return
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
    }, [disabled, delay])

    const hideTooltip = useCallback(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setIsVisible(false)
    }, [])

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    const childElement = children as ReactElement<ChildElementHandlers>

    const handleMouseEnter = useCallback((e: React.MouseEvent) => {
      showTooltip()
      childElement.props.onMouseEnter?.(e)
    }, [showTooltip, childElement])

    const handleMouseLeave = useCallback((e: React.MouseEvent) => {
      hideTooltip()
      childElement.props.onMouseLeave?.(e)
    }, [hideTooltip, childElement])

    const handleFocus = useCallback((e: React.FocusEvent) => {
      showTooltip()
      childElement.props.onFocus?.(e)
    }, [showTooltip, childElement])

    const handleBlur = useCallback((e: React.FocusEvent) => {
      hideTooltip()
      childElement.props.onBlur?.(e)
    }, [hideTooltip, childElement])

    const enhancedChild = cloneElement<ChildElementHandlers>(childElement, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    })

    return (
      <div ref={ref} className='relative inline-block' {...props}>
        {enhancedChild}
        {isVisible && !disabled && content && (
          <div
            className={cn(
              'absolute z-50 px-3 py-2 text-sm text-white bg-foreground rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
              'animate-in fade-in-0 zoom-in-95 duration-200',
              positionClasses[position],
              className,
            )}
            role='tooltip'
            aria-hidden='false'
          >
            {content}
            <div className={cn('absolute w-0 h-0 border-4', arrowClasses[position])} />
          </div>
        )}
      </div>
    )
  }
))
LegacyTooltip.displayName = 'Tooltip'

// =========================
// New composable Tooltip API
// =========================

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  delay: number
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>
}

const TooltipContext = createContext<TooltipContextValue | null>(null)

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

const TooltipRoot = memo(function TooltipRoot({ delay = 150, children }: TooltipRootProps) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  return (
    <TooltipContext.Provider value={{ open, setOpen, delay, timerRef }}>
      <div className='relative inline-block'>{children}</div>
    </TooltipContext.Provider>
  )
})
TooltipRoot.displayName = 'TooltipRoot'

export const TooltipTrigger = memo(function TooltipTrigger({ children, asChild = false }: TooltipTriggerProps) {
  const ctx = useContext(TooltipContext)
  if (!ctx) throw new Error('TooltipTrigger must be used within Tooltip')

  const child = children as ReactElement<ChildElementHandlers>
  const mergedProps: ChildElementHandlers = {
    onMouseEnter: (e) => {
      if (ctx.timerRef.current) clearTimeout(ctx.timerRef.current)
      ctx.setOpen(true)
      if (ctx.delay > 0) {
        ctx.timerRef.current = setTimeout(() => ctx.setOpen(true), ctx.delay)
      }
      child.props.onMouseEnter?.(e)
    },
    onMouseLeave: (e) => {
      if (ctx.timerRef.current) clearTimeout(ctx.timerRef.current)
      ctx.setOpen(false)
      child.props.onMouseLeave?.(e)
    },
    onFocus: (e) => {
      if (ctx.timerRef.current) clearTimeout(ctx.timerRef.current)
      ctx.setOpen(true)
      child.props.onFocus?.(e)
    },
    onBlur: (e) => {
      if (ctx.timerRef.current) clearTimeout(ctx.timerRef.current)
      ctx.setOpen(false)
      child.props.onBlur?.(e)
    },
  }

  if (asChild) {
    return cloneElement(child, mergedProps)
  }

  return (
    <button type='button' {...mergedProps} className={(child.props as { className?: string }).className}>
      {child}
    </button>
  )
})

export const TooltipContent = memo(forwardRef<ElementRef<'div'>, TooltipContentProps>(
  ({ side = 'top', align = 'center', className, children, ...props }, ref) => {
    const ctx = useContext(TooltipContext)
    if (!ctx) return null
    if (!ctx.open) return null

    const alignClass =
      align === 'start'
        ? 'left-0'
        : align === 'end'
          ? 'right-0'
          : 'left-1/2 -translate-x-1/2'

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg border border-border/70 bg-popover text-popover-foreground',
          'animate-in fade-in-0 zoom-in-95 duration-150',
          positionClasses[side],
          alignClass,
          className,
        )}
        role='tooltip'
        {...props}
      >
        {children}
        <div className={cn('absolute w-0 h-0 border-4', arrowClasses[side])} />
      </div>
    )
  }
))
TooltipContent.displayName = 'TooltipContent'

// Unified export that supports both legacy (content prop) and composable API
export const Tooltip = Object.assign(
  function TooltipComponent(props: TooltipRootProps | LegacyTooltipProps) {
    if ('content' in props) {
      return <LegacyTooltip {...(props as LegacyTooltipProps)} />
    }
    return <TooltipRoot {...(props as TooltipRootProps)} />
  },
  {
    Provider: TooltipProvider,
    Trigger: TooltipTrigger,
    Content: TooltipContent,
    displayName: 'Tooltip',
  },
)
