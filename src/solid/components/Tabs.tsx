// packages/ui/src/solid/components/Tabs.tsx

import { createContext, useContext, createSignal, Component, JSX, splitProps, Show } from 'solid-js'
import { cn } from '../lib/utils'

// Context for managing tab state
interface TabsContextValue {
  value: () => string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue>()

const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within a Tabs component')
  }
  return context
}

// Root Tabs component
interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  class?: string
  children: JSX.Element
}

export const Tabs: Component<TabsProps> = (props) => {
  const [local, others] = splitProps(props, ['value', 'defaultValue', 'onValueChange', 'class', 'children'])
  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? '')
  
  const isControlled = () => local.value !== undefined
  const value = () => isControlled() ? local.value! : internalValue()
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled()) {
      setInternalValue(newValue)
    }
    local.onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div class={local.class} {...others}>
        {local.children}
      </div>
    </TabsContext.Provider>
  )
}

// TabsList component - container for tab triggers
interface TabsListProps {
  class?: string
  children: JSX.Element
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const TabsList: Component<TabsListProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children', 'ref'])
  
  return (
    <div 
      ref={local.ref}
      class={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-surface p-1 text-muted-foreground',
        local.class
      )}
      role="tablist"
      {...others}
    >
      {local.children}
    </div>
  )
}

// TabsTrigger component - individual tab button
interface TabsTriggerProps {
  value: string
  class?: string
  disabled?: boolean
  children: JSX.Element
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

export const TabsTrigger: Component<TabsTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['value', 'class', 'disabled', 'children', 'ref'])
  const { value: selectedValue, onValueChange } = useTabsContext()
  const isSelected = () => selectedValue() === local.value

  const handleClick = () => {
    if (!(local.disabled ?? false)) {
      onValueChange(local.value)
    }
  }

  return (
    <button
      ref={local.ref}
      type="button"
      role="tab"
      aria-selected={isSelected()}
      aria-controls={`tabpanel-${local.value}`}
      disabled={local.disabled}
      onClick={handleClick}
      class={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        isSelected()
          ? 'bg-card text-popover-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-card/50 hover:text-foreground',
        local.class
      )}
      {...others}
    >
      {local.children}
    </button>
  )
}

// TabsContent component - content panel for each tab
interface TabsContentProps {
  value: string
  class?: string
  children: JSX.Element
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const TabsContent: Component<TabsContentProps> = (props) => {
  const [local, others] = splitProps(props, ['value', 'class', 'children', 'ref'])
  const { value: selectedValue } = useTabsContext()
  const isSelected = () => selectedValue() === local.value

  return (
    <Show when={isSelected()}>
      <div
        ref={local.ref}
        role="tabpanel"
        id={`tabpanel-${local.value}`}
        aria-labelledby={`tab-${local.value}`}
        class={cn(
          'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          local.class
        )}
        tabIndex={0}
        {...others}
      >
        {local.children}
      </div>
    </Show>
  )
}
