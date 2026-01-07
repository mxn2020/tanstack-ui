// packages/ui/src/solid/components/AlertDialog.tsx

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
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { cn } from '../lib/utils'

interface AlertDialogContextValue {
  open: () => boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = createContext<AlertDialogContextValue>()

const useAlertDialogContext = () => {
  const context = useContext(AlertDialogContext)
  if (!context) throw new Error('AlertDialog compound components must be used within an AlertDialog component')
  return context
}

interface AlertDialogProps {
  children: JSX.Element
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export const AlertDialog: Component<AlertDialogProps> = (props) => {
  const [local, _] = splitProps(props, ['children', 'open', 'defaultOpen', 'onOpenChange'])
  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? false)

  const isControlled = () => local.open !== undefined
  const open = () => isControlled() ? local.open! : internalOpen()

  const handleOpenChange = (next: boolean) => {
    if (!isControlled()) setInternalOpen(next)
    local.onOpenChange?.(next)
  }

  return (
    <AlertDialogContext.Provider value={{ open, setOpen: handleOpenChange }}>
      {local.children}
    </AlertDialogContext.Provider>
  )
}

/* Trigger */
interface AlertDialogTriggerProps {
  children: JSX.Element
  class?: string
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const AlertDialogTrigger: Component<AlertDialogTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  const { setOpen } = useAlertDialogContext()

  const openDialog = () => setOpen(true)

  return (
    <button
      ref={local.ref}
      type="button"
      onClick={openDialog}
      class={cn('cursor-pointer', local.class)}
      {...others}
    >
      {local.children}
    </button>
  )
}

/* Overlay */
interface AlertDialogOverlayProps {
  class?: string
  state?: 'open' | 'closed'
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const AlertDialogOverlay: Component<AlertDialogOverlayProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'state', 'ref'])
  
  return (
    <div
      ref={local.ref}
      class={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        local.class
      )}
      data-state={local.state ?? 'open'}
      {...others}
    />
  )
}

/* Content */
interface AlertDialogContentProps {
  children: JSX.Element
  class?: string
  closeOnEscape?: boolean
  closeOnBackdropClick?: boolean
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const AlertDialogContent: Component<AlertDialogContentProps> = (props) => {
  const [local, _] = splitProps(props, ['children', 'class', 'closeOnEscape', 'closeOnBackdropClick', 'ref'])
  const { open, setOpen } = useAlertDialogContext()
  let contentRef: HTMLDivElement | undefined
  let lastActiveElement: HTMLElement | undefined

  createEffect(() => {
    if (!open()) return
    lastActiveElement = document.activeElement as HTMLElement

    if (local.closeOnEscape ?? false) {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setOpen(false)
      }

      document.addEventListener('keydown', onKeyDown)
      onCleanup(() => document.removeEventListener('keydown', onKeyDown))
    }
  })

  createEffect(() => {
    if (!open()) return
    document.body.style.overflow = 'hidden'
    onCleanup(() => {
      document.body.style.overflow = 'unset'
    })
  })

  createEffect(() => {
    if (!open()) return

    const node = contentRef
    if (!node) return

    const focusables = node.querySelectorAll<HTMLElement>(
      `button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])`
    )
    focusables[0]?.focus()

    onCleanup(() => {
      lastActiveElement?.focus?.()
    })
  })

  const state = () => 'open' as const

  return (
    <Show when={open()}>
      <Portal>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class="fixed inset-0"
            onMouseDown={(e) => {
              if (!(local.closeOnBackdropClick ?? false)) return
              if (e.target === e.currentTarget) setOpen(false)
            }}
          >
            <AlertDialogOverlay state={state()} />
          </div>

          <div
            ref={(el) => {
              contentRef = el
              if (typeof local.ref === 'function') local.ref(el)
              else if (local.ref) (local.ref as any) = el
            }}
            class={cn(
              'relative z-50 grid w-full max-w-lg gap-4 border bg-card p-6 shadow-lg duration-200 sm:rounded-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
              'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
              local.class
            )}
            role="alertdialog"
            aria-modal="true"
            data-state={state()}
          >
            {local.children}
          </div>
        </div>
      </Portal>
    </Show>
  )
}

/* Header */
interface AlertDialogHeaderProps {
  children: JSX.Element
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const AlertDialogHeader: Component<AlertDialogHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <div ref={local.ref} class={cn('flex flex-col space-y-2 text-center sm:text-left', local.class)} {...others}>
      {local.children}
    </div>
  )
}

/* Title */
interface AlertDialogTitleProps {
  children: JSX.Element
  class?: string
  ref?: HTMLHeadingElement | ((el: HTMLHeadingElement) => void)
}

export const AlertDialogTitle: Component<AlertDialogTitleProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <h2 ref={local.ref} class={cn('text-lg font-semibold', local.class)} {...others}>
      {local.children}
    </h2>
  )
}

/* Description */
interface AlertDialogDescriptionProps {
  children: JSX.Element
  class?: string
  ref?: HTMLParagraphElement | ((el: HTMLParagraphElement) => void)
}

export const AlertDialogDescription: Component<AlertDialogDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <p ref={local.ref} class={cn('text-sm text-muted-foreground', local.class)} {...others}>
      {local.children}
    </p>
  )
}

/* Footer */
interface AlertDialogFooterProps {
  children: JSX.Element
  class?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const AlertDialogFooter: Component<AlertDialogFooterProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <div ref={local.ref} class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', local.class)} {...others}>
      {local.children}
    </div>
  )
}

/* Action */
interface AlertDialogActionProps {
  children: JSX.Element
  class?: string
  onClick?: () => void
  disabled?: boolean
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const AlertDialogAction: Component<AlertDialogActionProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'onClick', 'disabled', 'ref'])
  const { setOpen } = useAlertDialogContext()

  const handle = () => {
    local.onClick?.()
    setOpen(false)
  }

  return (
    <button
      ref={local.ref}
      type="button"
      onClick={handle}
      disabled={local.disabled}
      class={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white ring-offset-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        local.class
      )}
      {...others}
    >
      {local.children}
    </button>
  )
}

/* Cancel */
interface AlertDialogCancelProps {
  children: JSX.Element
  class?: string
  onClick?: () => void
  disabled?: boolean
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const AlertDialogCancel: Component<AlertDialogCancelProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'onClick', 'disabled', 'ref'])
  const { setOpen } = useAlertDialogContext()

  const handle = () => {
    local.onClick?.()
    setOpen(false)
  }

  return (
    <button
      ref={local.ref}
      type="button"
      onClick={handle}
      disabled={local.disabled}
      class={cn(
        'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground ring-offset-white transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0',
        local.class
      )}
      {...others}
    >
      {local.children}
    </button>
  )
}
