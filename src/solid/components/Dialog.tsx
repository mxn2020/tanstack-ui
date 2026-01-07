// packages/ui/src/solid/components/Dialog.tsx

import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onCleanup,
  Show,
  type Component,
  type JSX,
  type ParentComponent,
  splitProps,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { cn } from '../lib/utils'
import { X } from 'lucide-solid'

// Context for managing dialog state
interface DialogContextValue {
  open: () => boolean
  setOpen: (open: boolean) => void
}

const DialogContext = createContext<DialogContextValue>()

const useDialogContext = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error(
      'Dialog compound components must be used within a Dialog component'
    )
  }
  return context
}

// Root Dialog component
interface DialogProps {
  children: JSX.Element
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Dialog: ParentComponent<DialogProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'open',
    'defaultOpen',
    'onOpenChange',
  ])

  const [internalOpen, setInternalOpen] = createSignal(
    local.defaultOpen ?? false
  )

  const isControlled = () => local.open !== undefined
  const open = () => (isControlled() ? local.open! : internalOpen())

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled()) {
      setInternalOpen(newOpen)
    }
    local.onOpenChange?.(newOpen)
  }

  return (
    <DialogContext.Provider value={{ open, setOpen: handleOpenChange }}>
      {local.children}
    </DialogContext.Provider>
  )
}

// DialogTrigger component
interface DialogTriggerProps {
  children: JSX.Element
  asChild?: boolean
  class?: string
  ref?: (el: HTMLButtonElement) => void
}

export const DialogTrigger: Component<DialogTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'asChild',
    'class',
    'ref',
  ])
  const { setOpen } = useDialogContext()

  const handleClick = () => {
    setOpen(true)
  }

  return (
    <Show
      when={!local.asChild}
      fallback={
        <div onClick={handleClick} class={cn('cursor-pointer', local.class)}>
          {local.children}
        </div>
      }
    >
      <button
        ref={local.ref}
        type='button'
        onClick={handleClick}
        class={cn('cursor-pointer', local.class)}
      >
        {local.children}
      </button>
    </Show>
  )
}

// DialogPortal component for rendering outside the DOM tree
interface DialogPortalProps {
  children: JSX.Element
  mount?: Node
}

export const DialogPortal: Component<DialogPortalProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'mount'])

  return (
    <Portal mount={local.mount || document.body}>
      {local.children}
    </Portal>
  )
}

// DialogOverlay component
interface DialogOverlayProps {
  class?: string
  ref?: (el: HTMLDivElement) => void
}

export const DialogOverlay: Component<DialogOverlayProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'ref'])
  const { setOpen } = useDialogContext()

  const handleClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false)
    }
  }

  return (
    <div
      ref={local.ref}
      onClick={handleClick}
      class={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm cursor-pointer',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        local.class
      )}
      data-state='open'
    />
  )
}

// DialogContent component
interface DialogContentProps {
  children: JSX.Element
  class?: string
  showCloseButton?: boolean
  ref?: (el: HTMLDivElement) => void
}

export const DialogContent: Component<DialogContentProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'class',
    'showCloseButton',
    'ref',
  ])
  const { open, setOpen } = useDialogContext()

  let contentRef: HTMLDivElement | undefined

  const handleCloseClick = () => {
    setOpen(false)
  }

  // Handle escape key
  createEffect(() => {
    if (open()) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      onCleanup(() => {
        document.removeEventListener('keydown', handleEscape)
      })
    }
  })

  // Focus management
  createEffect(() => {
    if (open() && contentRef) {
      const focusableElements = contentRef.querySelectorAll(
        `button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])`
      )
      const firstElement = focusableElements[0] as HTMLElement
      if (firstElement) {
        firstElement.focus()
      }
    }
  })

  // Body scroll lock
  createEffect(() => {
    if (open()) {
      document.body.style.overflow = 'hidden'
      onCleanup(() => {
        document.body.style.overflow = 'unset'
      })
    }
  })

  return (
    <Show when={open()}>
      <DialogPortal>
        <div class='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <DialogOverlay />
          <div
            ref={(el) => {
              contentRef = el
              local.ref?.(el)
            }}
            class={cn(
              'relative z-50 grid w-full max-w-lg gap-4 border bg-card p-6 shadow-lg duration-200',
              'sm:rounded-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
              'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
              local.class
            )}
            role='dialog'
            aria-modal='true'
            data-state='open'
          >
            {local.children}
            <Show when={local.showCloseButton ?? true}>
              <button
                type='button'
                onClick={handleCloseClick}
                class='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none cursor-pointer'
              >
                <X class='h-4 w-4' />
                <span class='sr-only'>Close</span>
              </button>
            </Show>
          </div>
        </div>
      </DialogPortal>
    </Show>
  )
}

// DialogHeader component
interface DialogHeaderProps {
  children: JSX.Element
  class?: string
  ref?: (el: HTMLDivElement) => void
}

export const DialogHeader: Component<DialogHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])

  return (
    <div
      ref={local.ref}
      class={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        local.class
      )}
    >
      {local.children}
    </div>
  )
}

// DialogTitle component
interface DialogTitleProps {
  children: JSX.Element
  class?: string
  ref?: (el: HTMLHeadingElement) => void
}

export const DialogTitle: Component<DialogTitleProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])

  return (
    <h2
      ref={local.ref}
      class={cn(
        'text-lg font-semibold leading-none tracking-tight',
        local.class
      )}
    >
      {local.children}
    </h2>
  )
}

// DialogDescription component
interface DialogDescriptionProps {
  children: JSX.Element
  class?: string
  ref?: (el: HTMLParagraphElement) => void
}

export const DialogDescription: Component<DialogDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])

  return (
    <p ref={local.ref} class={cn('text-sm text-muted-foreground', local.class)}>
      {local.children}
    </p>
  )
}

// DialogFooter component
interface DialogFooterProps {
  children: JSX.Element
  class?: string
  ref?: (el: HTMLDivElement) => void
}

export const DialogFooter: Component<DialogFooterProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])

  return (
    <div
      ref={local.ref}
      class={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        local.class
      )}
    >
      {local.children}
    </div>
  )
}

// DialogClose component
interface DialogCloseProps {
  children: JSX.Element
  asChild?: boolean
  class?: string
  ref?: (el: HTMLButtonElement) => void
}

export const DialogClose: Component<DialogCloseProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'asChild',
    'class',
    'ref',
  ])
  const { setOpen } = useDialogContext()

  const handleClick = () => {
    setOpen(false)
  }

  return (
    <Show
      when={!local.asChild}
      fallback={
        <div onClick={handleClick} class={cn('cursor-pointer', local.class)}>
          {local.children}
        </div>
      }
    >
      <button
        ref={local.ref}
        type='button'
        onClick={handleClick}
        class={cn('cursor-pointer', local.class)}
      >
        {local.children}
      </button>
    </Show>
  )
}
