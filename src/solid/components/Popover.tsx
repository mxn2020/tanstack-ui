// packages/ui/src/solid/components/Popover.tsx

import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  Show,
  JSX,
  Component,
  Accessor,
  onMount,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { cn } from '../lib/utils'
import { clamp, composeEventHandlers, getPortalContainer } from '../lib/helpers'

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
  open: Accessor<boolean>
  setOpen: (open: boolean) => void
  triggerRef: HTMLElement | undefined
  setTriggerRef: (el: HTMLElement) => void
  contentRef: HTMLDivElement | undefined
  setContentRef: (el: HTMLDivElement) => void
}

const PopoverContext = createContext<PopoverContextValue>()

function usePopoverContext() {
  const ctx = useContext(PopoverContext)
  if (!ctx) throw new Error('Popover compound components must be used within a Popover component')
  return ctx
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------------------------------- */

interface PopoverProps {
  children: JSX.Element
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Popover: Component<PopoverProps> = (props) => {
  const [local, _] = splitProps(props, ['children', 'open', 'defaultOpen', 'onOpenChange'])
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(local.defaultOpen ?? false)
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement>()
  const [contentRef, setContentRef] = createSignal<HTMLDivElement>()

  const isControlled = () => local.open !== undefined
  const open = () => (isControlled() ? !!local.open : uncontrolledOpen())

  const setOpen = (next: boolean) => {
    if (!isControlled()) setUncontrolledOpen(next)
    local.onOpenChange?.(next)
  }

  const ctx: PopoverContextValue = {
    open,
    setOpen,
    get triggerRef() {
      return triggerRef()
    },
    setTriggerRef,
    get contentRef() {
      return contentRef()
    },
    setContentRef,
  }

  return (
    <PopoverContext.Provider value={ctx}>
      <div class="relative">{local.children}</div>
    </PopoverContext.Provider>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

interface PopoverTriggerProps {
  children: JSX.Element
  class?: string
  toggle?: boolean
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const PopoverTrigger: Component<PopoverTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'toggle', 'ref'])
  const { open, setOpen, setTriggerRef } = usePopoverContext()

  const toggle = () => local.toggle ?? true

  const onClick = () => {
    setOpen(toggle() ? !open() : true)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(toggle() ? !open() : true)
    }
  }

  return (
    <button
      ref={(el) => {
        setTriggerRef(el)
        if (typeof local.ref === 'function') local.ref(el)
        else if (local.ref) (local.ref as any) = el
      }}
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      class={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium',
        'ring-offset-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        local.class
      )}
      aria-expanded={open()}
      aria-haspopup="dialog"
      data-state={open() ? 'open' : 'closed'}
      {...others}
    >
      {local.children}
    </button>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

interface PopoverContentProps {
  children: JSX.Element
  class?: string
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  container?: HTMLElement
  autoFocus?: boolean
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const PopoverContent: Component<PopoverContentProps> = (props) => {
  const [local, _] = splitProps(props, [
    'children',
    'class',
    'side',
    'align',
    'sideOffset',
    'alignOffset',
    'collisionPadding',
    'container',
    'autoFocus',
    'onEscapeKeyDown',
    'onPointerDownOutside',
    'ref',
  ])

  const { open, setOpen, triggerRef, contentRef, setContentRef } = usePopoverContext()
  const [mounted, setMounted] = createSignal(false)
  const [pos, setPos] = createSignal<{ x: number; y: number } | null>(null)

  const side = () => local.side ?? 'bottom'
  const align = () => local.align ?? 'center'
  const sideOffset = () => local.sideOffset ?? 8
  const alignOffset = () => local.alignOffset ?? 0
  const collisionPadding = () => local.collisionPadding ?? 8
  const autoFocus = () => local.autoFocus ?? true

  const portalContainer = () => local.container ?? getPortalContainer()

  onMount(() => {
    setMounted(true)
    onCleanup(() => setMounted(false))
  })

  const updatePosition = () => {
    const triggerEl = triggerRef
    const contentEl = contentRef
    if (!triggerEl || !contentEl) return
    const triggerRect = triggerEl.getBoundingClientRect()
    const contentRect = contentEl.getBoundingClientRect()
    setPos(
      computePosition({
        triggerRect,
        contentRect,
        side: side(),
        align: align(),
        sideOffset: sideOffset(),
        alignOffset: alignOffset(),
        collisionPadding: collisionPadding(),
      })
    )
  }

  createEffect(() => {
    if (!open()) return
    setPos(null)
    requestAnimationFrame(updatePosition)
  })

  createEffect(() => {
    if (!open()) return
    const onResize = () => updatePosition()
    const onScroll = () => updatePosition()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)
    onCleanup(() => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    })
  })

  createEffect(() => {
    if (!open()) return
    const onMouseDown = (event: MouseEvent) => {
      const t = event.target as Node
      const clickedTrigger = !!triggerRef && triggerRef.contains(t)
      const clickedContent = !!contentRef && contentRef.contains(t)
      if (!clickedTrigger && !clickedContent) {
        local.onPointerDownOutside?.(event as unknown as PointerEvent)
        setOpen(false)
        ;(triggerRef as HTMLElement | undefined)?.focus?.()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    onCleanup(() => document.removeEventListener('mousedown', onMouseDown))
  })

  createEffect(() => {
    if (!open()) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        local.onEscapeKeyDown?.(event)
        setOpen(false)
        ;(triggerRef as HTMLElement | undefined)?.focus?.()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    onCleanup(() => document.removeEventListener('keydown', onKeyDown))
  })

  createEffect(() => {
    if (!open() || !autoFocus()) return
    const el = contentRef
    if (!el) return
    const first = el.querySelector<HTMLElement>(
      `button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])`
    )
    first?.focus()
  })

  const style = (): JSX.CSSProperties => ({
    position: 'fixed',
    left: pos() ? `${pos()!.x}px` : '-9999px',
    top: pos() ? `${pos()!.y}px` : '-9999px',
  })

  return (
    <Show when={open() && mounted() && portalContainer()}>
      <Portal mount={portalContainer()!}>
        <div
          ref={(el) => {
            setContentRef(el)
            if (typeof local.ref === 'function') local.ref(el)
            else if (local.ref) (local.ref as any) = el
          }}
          style={style()}
          data-state={open() ? 'open' : 'closed'}
          class={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card p-2 shadow-lg',
            'origin-top data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            local.class
          )}
          role="dialog"
          aria-modal="false"
        >
          {local.children}
        </div>
      </Portal>
    </Show>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Close
 * ------------------------------------------------------------------------------------------------- */

interface PopoverCloseProps {
  children: JSX.Element
  class?: string
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const PopoverClose: Component<PopoverCloseProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  const { setOpen } = usePopoverContext()
  const onClick = () => setOpen(false)

  return (
    <button ref={local.ref} type="button" onClick={onClick} class={local.class} {...others}>
      {local.children}
    </button>
  )
}
