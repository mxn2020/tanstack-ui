// CompoundComponentExample.tsx - Example of compound component pattern in SolidJS

import {
  Component,
  JSX,
  splitProps,
  mergeProps,
  createContext,
  useContext,
  createSignal,
  Show,
} from 'solid-js'
import { cn } from '../lib/utils'

// 1. Define context type
interface AccordionContextValue {
  open: () => boolean
  setOpen: (open: boolean) => void
}

// 2. Create context
const AccordionContext = createContext<AccordionContextValue>()

// 3. Custom hook to use context
const useAccordionContext = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion compound components must be used within Accordion')
  }
  return context
}

// 4. Root component
interface AccordionProps {
  children: JSX.Element
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Accordion: Component<AccordionProps> = (props) => {
  const merged = mergeProps({ defaultOpen: false }, props)
  const [local, _] = splitProps(merged, ['children', 'open', 'defaultOpen', 'onOpenChange'])
  
  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen)
  
  const isControlled = () => local.open !== undefined
  const open = () => (isControlled() ? local.open! : internalOpen())
  
  const handleOpenChange = (next: boolean) => {
    if (!isControlled()) setInternalOpen(next)
    local.onOpenChange?.(next)
  }

  return (
    <AccordionContext.Provider value={{ open, setOpen: handleOpenChange }}>
      {local.children}
    </AccordionContext.Provider>
  )
}

// 5. Trigger component
interface AccordionTriggerProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  children: JSX.Element
  class?: string
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const AccordionTrigger: Component<AccordionTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref', 'onClick'])
  const { open, setOpen } = useAccordionContext()

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
    setOpen(!open())
    if (local.onClick) {
      if (typeof local.onClick === 'function') {
        local.onClick(e)
      }
    }
  }

  return (
    <button
      ref={local.ref}
      type="button"
      onClick={handleClick}
      aria-expanded={open()}
      class={cn(
        'flex w-full items-center justify-between py-4 font-medium transition-all hover:underline',
        local.class
      )}
      {...others}
    >
      {local.children}
    </button>
  )
}

// 6. Content component
interface AccordionContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const AccordionContent: Component<AccordionContentProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  const { open } = useAccordionContext()

  return (
    <Show when={open()}>
      <div
        ref={local.ref}
        class={cn('overflow-hidden pb-4 pt-0 text-sm', local.class)}
        {...others}
      >
        {local.children}
      </div>
    </Show>
  )
}

// 7. Export all components
export const AccordionExample = {
  Root: Accordion,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
}
