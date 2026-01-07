// packages/ui/src/solid/components/ToggleGroup.tsx

import { createContext, useContext, Component, JSX, splitProps } from 'solid-js'
import { cn } from '../lib/utils'

// Context for managing toggle group state
interface ToggleGroupContextValue {
  value: () => string | string[]
  onValueChange: (value: string) => void
  type: 'single' | 'multiple'
  disabled?: boolean
}

const ToggleGroupContext = createContext<ToggleGroupContextValue>()

const useToggleGroupContext = () => {
  const context = useContext(ToggleGroupContext)
  if (!context) {
    throw new Error('ToggleGroupItem must be used within a ToggleGroup component')
  }
  return context
}

// Root ToggleGroup component
interface ToggleGroupProps {
  children: JSX.Element
  type: 'single' | 'multiple'
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  disabled?: boolean
  class?: string
  orientation?: 'horizontal' | 'vertical'
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const ToggleGroup: Component<ToggleGroupProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'type',
    'value',
    'onValueChange',
    'disabled',
    'class',
    'orientation',
    'ref'
  ])

  const value = () => local.value ?? (local.type === 'single' ? '' : [])

  const handleValueChange = (itemValue: string) => {
    if (local.disabled ?? false) return

    if (local.type === 'single') {
      local.onValueChange?.(itemValue)
    } else {
      const currentValue = Array.isArray(value()) ? value() as string[] : []
      const newValue = currentValue.includes(itemValue)
        ? currentValue.filter(v => v !== itemValue)
        : [...currentValue, itemValue]
      local.onValueChange?.(newValue)
    }
  }

  return (
    <ToggleGroupContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        type: local.type,
        disabled: local.disabled
      }}
    >
      <div
        ref={local.ref}
        class={cn(
          'inline-flex rounded-md shadow-sm',
          local.orientation === 'vertical' ? 'flex-col' : 'flex-row',
          local.disabled && 'opacity-50 cursor-not-allowed',
          local.class
        )}
        role="group"
        {...others}
      >
        {local.children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

// ToggleGroupItem component
interface ToggleGroupItemProps {
  children: JSX.Element
  value: string
  disabled?: boolean
  class?: string
  'aria-label'?: string
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const ToggleGroupItem: Component<ToggleGroupItemProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'value',
    'disabled',
    'class',
    'aria-label',
    'ref'
  ])

  const { value: groupValue, onValueChange, type, disabled: groupDisabled } = useToggleGroupContext()

  const isDisabled = () => (groupDisabled ?? false) || (local.disabled ?? false)

  const isSelected = () => type === 'single'
    ? groupValue() === local.value
    : Array.isArray(groupValue()) && (groupValue() as string[]).includes(local.value)

  const handleClick = () => {
    if (!isDisabled()) {
      onValueChange(local.value)
    }
  }

  const handleKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled()) {
      e.preventDefault()
      onValueChange(local.value)
    }
  }

  return (
    <button
      ref={local.ref}
      type="button"
      role="button"
      aria-pressed={isSelected()}
      aria-label={local['aria-label']}
      disabled={isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      class={cn(
        'inline-flex items-center justify-center px-4 py-2 text-sm font-medium cursor-pointer',
        'border border-border transition-colors duration-200',
        'focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
        'first:rounded-l-md last:rounded-r-md',
        '-ml-px first:ml-0',
        isSelected()
          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
          : 'bg-card text-foreground hover:bg-surface',
        isDisabled() && 'cursor-not-allowed opacity-50',
        local.class
      )}
      {...others}
    >
      {local.children}
    </button>
  )
}
