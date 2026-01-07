// packages/ui/src/solid/components/DropdownMenu.tsx

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
import { cn } from '../lib/utils'

// Context for managing dropdown state
interface DropdownMenuContextValue {
  open: () => boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = createContext<DropdownMenuContextValue>()

const useDropdownMenuContext = () => {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error(
      'DropdownMenu compound components must be used within a DropdownMenu component'
    )
  }
  return context
}

// Root DropdownMenu component
interface DropdownMenuProps {
  children: JSX.Element
}

export const DropdownMenu: ParentComponent<DropdownMenuProps> = (props) => {
  const [open, setOpen] = createSignal(false)

  const handleSetOpen = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen: handleSetOpen }}>
      <div class='relative inline-block text-left'>{props.children}</div>
    </DropdownMenuContext.Provider>
  )
}

// DropdownMenuTrigger component
interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: JSX.Element
  class?: string
}

export const DropdownMenuTrigger: Component<DropdownMenuTriggerProps> = (
  props
) => {
  const [local, others] = splitProps(props, ['asChild', 'children', 'class'])
  const { open, setOpen } = useDropdownMenuContext()

  const handleClick = () => {
    setOpen(!open())
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
        type='button'
        onClick={handleClick}
        class={cn(
          'inline-flex justify-center w-full rounded-md border border-border shadow-sm px-4 py-2 bg-card text-sm font-medium text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer',
          local.class
        )}
        aria-expanded={open()}
        aria-haspopup='true'
      >
        {local.children}
      </button>
    </Show>
  )
}

// DropdownMenuContent component
interface DropdownMenuContentProps {
  children: JSX.Element
  align?: 'start' | 'center' | 'end'
  class?: string
}

export const DropdownMenuContent: Component<DropdownMenuContentProps> = (
  props
) => {
  const [local, others] = splitProps(props, ['children', 'align', 'class'])
  const { open, setOpen } = useDropdownMenuContext()

  let contentRef: HTMLDivElement | undefined

  // Close dropdown when clicking outside
  createEffect(() => {
    if (open()) {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef && !contentRef.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      onCleanup(() => {
        document.removeEventListener('mousedown', handleClickOutside)
      })
    }
  })

  // Close dropdown on Escape key
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

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  }

  return (
    <Show when={open()}>
      <div
        ref={contentRef}
        class={cn(
          'absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 focus:outline-none',
          alignmentClasses[local.align || 'end'],
          local.class
        )}
        role='menu'
        aria-orientation='vertical'
      >
        <div class='py-1' role='none'>
          {local.children}
        </div>
      </div>
    </Show>
  )
}

// DropdownMenuItem component
interface DropdownMenuItemProps {
  children: JSX.Element
  onClick?: () => void
  disabled?: boolean
  class?: string
  asChild?: boolean
}

export const DropdownMenuItem: Component<DropdownMenuItemProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'onClick',
    'disabled',
    'class',
    'asChild',
  ])
  const { setOpen } = useDropdownMenuContext()

  const handleClick = () => {
    if (local.disabled) return
    local.onClick?.()
    setOpen(false)
  }

  return (
    <Show
      when={!local.asChild}
      fallback={
        <div
          role='menuitem'
          onClick={handleClick}
          class={cn(
            'w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-surface hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
            local.class
          )}
        >
          {local.children}
        </div>
      }
    >
      <button
        type='button'
        onClick={handleClick}
        disabled={local.disabled}
        class={cn(
          'w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-surface hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          local.class
        )}
        role='menuitem'
      >
        {local.children}
      </button>
    </Show>
  )
}

// DropdownMenuSeparator component
interface DropdownMenuSeparatorProps {
  class?: string
}

export const DropdownMenuSeparator: Component<DropdownMenuSeparatorProps> = (
  props
) => {
  return <div class={cn('h-px bg-border my-1', props.class)} role='separator' />
}

// DropdownMenuLabel component
interface DropdownMenuLabelProps {
  children: JSX.Element
  class?: string
}

export const DropdownMenuLabel: Component<DropdownMenuLabelProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class'])

  return (
    <div
      class={cn('px-4 py-2 text-sm font-semibold text-foreground', local.class)}
      role='none'
    >
      {local.children}
    </div>
  )
}

// DropdownMenuCheckboxItem component
interface DropdownMenuCheckboxItemProps {
  children: JSX.Element
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  class?: string
}

export const DropdownMenuCheckboxItem: Component<
  DropdownMenuCheckboxItemProps
> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'checked',
    'onCheckedChange',
    'disabled',
    'class',
  ])

  const handleClick = () => {
    if (!local.disabled && local.onCheckedChange) {
      local.onCheckedChange(!local.checked)
    }
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={local.disabled}
      class={cn(
        'w-full text-left flex items-center px-4 py-2 text-sm text-foreground hover:bg-surface hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        local.class
      )}
      role='menuitemcheckbox'
      aria-checked={local.checked}
    >
      <span class='mr-2 flex h-3.5 w-3.5 items-center justify-center'>
        <Show when={local.checked}>
          <svg
            class='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </Show>
      </span>
      {local.children}
    </button>
  )
}
