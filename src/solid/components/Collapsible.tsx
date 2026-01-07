// packages/ui/src/solid/components/Collapsible.tsx

import { createContext, useContext, Component, JSX, splitProps, createSignal, Show, createEffect, onCleanup } from 'solid-js'
import { cn } from '../lib/utils'

interface CollapsibleContextValue {
  open: () => boolean
  setOpen: (open: boolean) => void
  disabled: () => boolean
}

const CollapsibleContext = createContext<CollapsibleContextValue>()

const useCollapsibleContext = () => {
  const context = useContext(CollapsibleContext)
  if (!context) {
    throw new Error('Collapsible compound components must be used within a Collapsible component')
  }
  return context
}

interface CollapsibleProps {
  children: JSX.Element
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const Collapsible: Component<CollapsibleProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
    'disabled',
    'class',
    'ref'
  ])

  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? false)

  const isControlled = () => local.open !== undefined
  const open = () => isControlled() ? local.open! : internalOpen()
  const disabled = () => local.disabled ?? false

  const handleOpenChange = (newOpen: boolean) => {
    if (disabled()) return

    if (!isControlled()) {
      setInternalOpen(newOpen)
    }
    local.onOpenChange?.(newOpen)
  }

  return (
    <CollapsibleContext.Provider value={{ open, setOpen: handleOpenChange, disabled }}>
      <div
        ref={local.ref}
        class={local.class}
        data-state={open() ? 'open' : 'closed'}
        {...others}
      >
        {local.children}
      </div>
    </CollapsibleContext.Provider>
  )
}

interface CollapsibleTriggerProps {
  children: JSX.Element
  asChild?: boolean
  class?: string
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const CollapsibleTrigger: Component<CollapsibleTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'asChild', 'class', 'ref'])
  const { open, setOpen, disabled } = useCollapsibleContext()

  const handleClick = () => {
    setOpen(!open())
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(!open())
    }
  }

  if (local.asChild) {
    return (
      <div onClick={handleClick} onKeyDown={handleKeyDown} class={local.class}>
        {local.children}
      </div>
    )
  }

  return (
    <button
      ref={local.ref}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled()}
      class={cn(
        'flex items-center justify-between w-full p-0 text-left',
        !disabled() && 'cursor-pointer',
        disabled() && 'cursor-not-allowed opacity-50',
        local.class
      )}
      aria-expanded={open()}
      aria-controls="collapsible-content"
      data-state={open() ? 'open' : 'closed'}
      {...others}
    >
      {local.children}
    </button>
  )
}

interface CollapsibleContentProps {
  children: JSX.Element
  class?: string
  forceMount?: boolean
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const CollapsibleContent: Component<CollapsibleContentProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'forceMount', 'ref'])
  const { open } = useCollapsibleContext()
  
  let contentRef: HTMLDivElement | undefined
  const [height, setHeight] = createSignal<number | 'auto'>(0)
  const [isAnimating, setIsAnimating] = createSignal(false)

  createEffect(() => {
    const element = contentRef
    if (!element) return

    if (open()) {
      setIsAnimating(true)
      const scrollHeight = element.scrollHeight
      setHeight(scrollHeight)

      const timer = setTimeout(() => {
        setHeight('auto')
        setIsAnimating(false)
      }, 200)

      onCleanup(() => clearTimeout(timer))
    } else {
      setIsAnimating(true)
      const scrollHeight = element.scrollHeight
      setHeight(scrollHeight)

      requestAnimationFrame(() => {
        setHeight(0)
      })

      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 200)

      onCleanup(() => clearTimeout(timer))
    }
  })

  return (
    <Show when={open() || local.forceMount || isAnimating()}>
      <div
        ref={(el) => {
          contentRef = el
          if (typeof local.ref === 'function') local.ref(el)
          else if (local.ref) (local.ref as any) = el
        }}
        id="collapsible-content"
        class={cn('overflow-hidden transition-all duration-200 ease-out', local.class)}
        style={{ height: height() === 'auto' ? 'auto' : `${height()}px` }}
        data-state={open() ? 'open' : 'closed'}
        {...others}
      >
        <div class="pb-0">
          {local.children}
        </div>
      </div>
    </Show>
  )
}
