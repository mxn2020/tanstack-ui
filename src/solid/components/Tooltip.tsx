// packages/ui/src/solid/components/Tooltip.tsx

import {
  createSignal,
  createContext,
  useContext,
  onCleanup,
  JSX,
  Component,
  splitProps,
  Show,
  children as resolveChildren,
} from 'solid-js'
import { cn } from '../lib/utils'

type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

interface LegacyTooltipProps {
  content: string
  children: JSX.Element
  position?: TooltipSide
  delay?: number
  disabled?: boolean
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

interface TooltipProviderProps {
  children: JSX.Element
}

interface TooltipRootProps {
  delay?: number
  children: JSX.Element
}

interface TooltipTriggerProps {
  children: JSX.Element
  asChild?: boolean
}

interface TooltipContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  side?: TooltipSide
  align?: 'center' | 'start' | 'end'
  children: JSX.Element
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

const LegacyTooltip: Component<LegacyTooltipProps> = (props) => {
  const [local, others] = splitProps(props, ['content', 'children', 'position', 'delay', 'disabled', 'class', 'ref'])
  const [isVisible, setIsVisible] = createSignal(false)
  let timeoutRef: ReturnType<typeof setTimeout> | null = null

  const showTooltip = () => {
    if (local.disabled) return
    if (timeoutRef) clearTimeout(timeoutRef)
    timeoutRef = setTimeout(() => setIsVisible(true), local.delay ?? 200)
  }

  const hideTooltip = () => {
    if (timeoutRef) clearTimeout(timeoutRef)
    setIsVisible(false)
  }

  onCleanup(() => {
    if (timeoutRef) {
      clearTimeout(timeoutRef)
    }
  })

  const position = () => local.position ?? 'top'

  return (
    <div ref={local.ref} class="relative inline-block" {...others}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {local.children}
      </div>
      <Show when={isVisible() && !local.disabled && local.content}>
        <div
          class={cn(
            'absolute z-50 px-3 py-2 text-sm text-white bg-foreground rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            positionClasses[position()],
            local.class,
          )}
          role="tooltip"
          aria-hidden="false"
        >
          {local.content}
          <div class={cn('absolute w-0 h-0 border-4', arrowClasses[position()])} />
        </div>
      </Show>
    </div>
  )
}

// =========================
// New composable Tooltip API
// =========================

interface TooltipContextValue {
  open: () => boolean
  setOpen: (open: boolean) => void
  delay: number
  timerRef: { current: ReturnType<typeof setTimeout> | null }
}

const TooltipContext = createContext<TooltipContextValue>()

export const TooltipProvider: Component<TooltipProviderProps> = (props) => {
  return <>{props.children}</>
}

const TooltipRoot: Component<TooltipRootProps> = (props) => {
  const [local, _] = splitProps(props, ['delay', 'children'])
  const [open, setOpen] = createSignal(false)
  const timerRef = { current: null as ReturnType<typeof setTimeout> | null }

  onCleanup(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  })

  return (
    <TooltipContext.Provider value={{ open, setOpen, delay: local.delay ?? 150, timerRef }}>
      <div class="relative inline-block">{local.children}</div>
    </TooltipContext.Provider>
  )
}

export const TooltipTrigger: Component<TooltipTriggerProps> = (props) => {
  const [local, _] = splitProps(props, ['children', 'asChild'])
  const ctx = useContext(TooltipContext)
  if (!ctx) throw new Error('TooltipTrigger must be used within Tooltip')

  const handleMouseEnter = () => {
    if (ctx.timerRef.current) clearTimeout(ctx.timerRef.current)
    if (ctx.delay > 0) {
      ctx.timerRef.current = setTimeout(() => ctx.setOpen(true), ctx.delay)
    } else {
      ctx.setOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (ctx.timerRef.current) clearTimeout(ctx.timerRef.current)
    ctx.setOpen(false)
  }

  const handleFocus = () => {
    if (ctx.timerRef.current) clearTimeout(ctx.timerRef.current)
    ctx.setOpen(true)
  }

  const handleBlur = () => {
    if (ctx.timerRef.current) clearTimeout(ctx.timerRef.current)
    ctx.setOpen(false)
  }

  if (local.asChild) {
    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {local.children}
      </div>
    )
  }

  return (
    <button
      type="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {local.children}
    </button>
  )
}

export const TooltipContent: Component<TooltipContentProps> = (props) => {
  const [local, others] = splitProps(props, ['side', 'align', 'class', 'children', 'ref'])
  const ctx = useContext(TooltipContext)
  if (!ctx) return null

  const side = () => local.side ?? 'top'
  const align = () => local.align ?? 'center'

  const alignClass = () =>
    align() === 'start'
      ? 'left-0'
      : align() === 'end'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2'

  return (
    <Show when={ctx.open()}>
      <div
        ref={local.ref}
        class={cn(
          'absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg border border-border/70 bg-popover text-popover-foreground',
          'animate-in fade-in-0 zoom-in-95 duration-150',
          positionClasses[side()],
          alignClass(),
          local.class,
        )}
        role="tooltip"
        {...others}
      >
        {local.children}
        <div class={cn('absolute w-0 h-0 border-4', arrowClasses[side()])} />
      </div>
    </Show>
  )
}

// Unified export that supports both legacy (content prop) and composable API
export const Tooltip = Object.assign(
  ((props: TooltipRootProps | LegacyTooltipProps) => {
    if ('content' in props) {
      return <LegacyTooltip {...(props as LegacyTooltipProps)} />
    }
    return <TooltipRoot {...(props as TooltipRootProps)} />
  }) as Component<TooltipRootProps | LegacyTooltipProps>,
  {
    Provider: TooltipProvider,
    Trigger: TooltipTrigger,
    Content: TooltipContent,
  }
)
