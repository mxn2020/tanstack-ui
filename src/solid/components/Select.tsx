// packages/ui/src/solid/components/Select.tsx

import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  createMemo,
  mergeProps,
  Show,
  For,
  type JSX,
  type Accessor,
  type Setter,
  splitProps,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { cn } from '../lib/utils'
import { ChevronDown, Check, ChevronUp } from 'lucide-solid'
import { clamp, composeEventHandlers, getPortalContainer, mergeRefs } from '../lib/helpers'

type Side = 'bottom' | 'top'
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
  else y = triggerRect.top - contentRect.height - sideOffset

  if (align === 'start') x = triggerRect.left
  if (align === 'center') x = triggerRect.left + (triggerRect.width - contentRect.width) / 2
  if (align === 'end') x = triggerRect.right - contentRect.width

  x += alignOffset

  const pad = collisionPadding
  x = clamp(x, pad, Math.max(pad, vw - contentRect.width - pad))
  y = clamp(y, pad, Math.max(pad, vh - contentRect.height - pad))

  return { x, y }
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------------------------------- */

interface SelectContextValue {
  open: Accessor<boolean>
  setOpen: Setter<boolean>

  value: Accessor<string>
  onValueChange: (value: string) => void

  disabled: boolean

  rootRef: HTMLDivElement | undefined
  setRootRef: Setter<HTMLDivElement | undefined>
  triggerRef: HTMLElement | undefined
  setTriggerRef: Setter<HTMLElement | undefined>
  contentRef: HTMLDivElement | undefined
  setContentRef: Setter<HTMLDivElement | undefined>
  viewportRef: HTMLDivElement | undefined
  setViewportRef: Setter<HTMLDivElement | undefined>

  labelMap: Map<string, string>
  selectedLabel: Accessor<string>
  setSelectedLabel: Setter<string>
  registerLabel: (value: string, label: string) => void
  unregisterLabel: (value: string) => void

  activeValue: Accessor<string | null>
  setActiveValue: Setter<string | null>

  itemsOrder: string[]
  registerItem: (value: string) => void
  unregisterItem: (value: string) => void

  onTypeaheadChar: (char: string) => void
}

const SelectContext = createContext<SelectContextValue>()

function useSelectContext() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Select compound components must be used within a Select component')
  return ctx
}

/* -------------------------------------------------------------------------------------------------
 * Root Select
 * ------------------------------------------------------------------------------------------------- */

interface SelectProps {
  children: JSX.Element
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  label?: string
  required?: boolean
}

export function Select(props: SelectProps) {
  const merged = mergeProps({ defaultValue: '', disabled: false, required: false }, props)

  const [internalValue, setInternalValue] = createSignal(merged.defaultValue)
  const [selectedLabel, setSelectedLabel] = createSignal('')
  const [open, setOpenState] = createSignal(false)

  const isControlled = () => merged.value !== undefined
  const value = () => (isControlled() ? merged.value! : internalValue())

  const [rootRef, setRootRef] = createSignal<HTMLDivElement>()
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement>()
  const [contentRef, setContentRef] = createSignal<HTMLDivElement>()
  const [viewportRef, setViewportRef] = createSignal<HTMLDivElement>()

  let labelMap = new Map<string, string>()
  let itemsOrder: string[] = []
  const [activeValue, setActiveValue] = createSignal<string | null>(null)

  let typeahead = { query: '', timer: null as number | null }

  const setOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    if (merged.disabled) return
    const nextValue = typeof next === 'function' ? next(open()) : next
    setOpenState(nextValue)
    if (!nextValue) {
      setActiveValue(null)
      triggerRef()?.focus?.()
    }
  }

  const registerLabel = (itemValue: string, labelStr: string) => {
    labelMap.set(itemValue, labelStr)
    if (itemValue === value()) setSelectedLabel(labelStr)
  }

  const unregisterLabel = (itemValue: string) => {
    labelMap.delete(itemValue)
  }

  const registerItem = (itemValue: string) => {
    if (!itemsOrder.includes(itemValue)) itemsOrder.push(itemValue)
  }

  const unregisterItem = (itemValue: string) => {
    itemsOrder = itemsOrder.filter(v => v !== itemValue)
  }

  const handleValueChange = (newValue: string) => {
    if (!isControlled()) setInternalValue(newValue)
    merged.onValueChange?.(newValue)
    const l = labelMap.get(newValue)
    if (l) setSelectedLabel(l)
    setOpen(false)
  }

  createEffect(() => {
    const val = value()
    if (!val) {
      if (selectedLabel()) setSelectedLabel('')
      return
    }
    const l = labelMap.get(val)
    if (l && l !== selectedLabel()) setSelectedLabel(l)
  })

  const onTypeaheadChar = (char: string) => {
    if (!open()) return
    const q = (typeahead.query + char).toLowerCase()
    typeahead.query = q
    if (typeahead.timer) window.clearTimeout(typeahead.timer)

    typeahead.timer = window.setTimeout(() => {
      typeahead.query = ''
      typeahead.timer = null
    }, 500)

    if (!itemsOrder.length) return

    const startIndex = activeValue() ? Math.max(0, itemsOrder.indexOf(activeValue()!)) : 0
    const candidates = itemsOrder.slice(startIndex).concat(itemsOrder.slice(0, startIndex))

    const hit = candidates.find(v => (labelMap.get(v) || v).toLowerCase().startsWith(q))
    if (hit) setActiveValue(hit)
  }

  const ctx: SelectContextValue = {
    open,
    setOpen,
    value,
    onValueChange: handleValueChange,
    disabled: merged.disabled,

    rootRef: rootRef(),
    setRootRef,
    triggerRef: triggerRef(),
    setTriggerRef,
    contentRef: contentRef(),
    setContentRef,
    viewportRef: viewportRef(),
    setViewportRef,

    labelMap,
    selectedLabel,
    setSelectedLabel,
    registerLabel,
    unregisterLabel,

    activeValue,
    setActiveValue,

    itemsOrder,
    registerItem,
    unregisterItem,

    onTypeaheadChar,
  }

  const wrapped = (
    <SelectContext.Provider value={ctx}>
      <div ref={setRootRef} class='relative'>
        {merged.children}
      </div>
    </SelectContext.Provider>
  )

  return (
    <Show when={merged.label} fallback={wrapped}>
      <div class='w-full'>
        <label class='block text-sm font-medium text-foreground mb-1'>
          {merged.label}
          <Show when={merged.required}>
            <span class='text-red-500 ml-1'>*</span>
          </Show>
        </label>
        <div class={cn(merged.disabled && 'opacity-50 cursor-not-allowed')}>{wrapped}</div>
      </div>
    </Show>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

interface SelectTriggerProps {
  children?: JSX.Element
  class?: string
  placeholder?: string
  ref?: (el: HTMLButtonElement) => void
}

export function SelectTrigger(props: SelectTriggerProps) {
  const [local, others] = splitProps(props, ['children', 'class', 'placeholder', 'ref'])
  const ctx = useSelectContext()

  const displayText = () =>
    ctx.selectedLabel() ||
    (ctx.value() ? ctx.selectedLabel() || String(local.children ?? '') : local.placeholder || 'Select an option...')

  const onClick = () => {
    if (ctx.disabled) return
    ctx.setOpen(!ctx.open())
    if (!ctx.open()) ctx.setActiveValue(ctx.value() || null)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (ctx.disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      ctx.setOpen(true)
      ctx.setActiveValue(ctx.value() || null)
      return
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      ctx.onTypeaheadChar(e.key)
    }
  }

  const baseClass = () =>
    cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground',
      'ring-offset-surface placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      local.class
    )

  return (
    <button
      ref={mergeRefs(ctx.setTriggerRef, local.ref)}
      type='button'
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={ctx.disabled}
      class={baseClass()}
      aria-expanded={ctx.open()}
      aria-haspopup='listbox'
      data-state={ctx.open() ? 'open' : 'closed'}
      {...others}
    >
      <span class={cn('block truncate', !ctx.value() && 'text-muted-foreground')}>{displayText()}</span>
      <ChevronDown class={cn('h-4 w-4 opacity-50 transition-transform', ctx.open() && 'rotate-180')} />
    </button>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Value
 * ------------------------------------------------------------------------------------------------- */

interface SelectValueProps {
  placeholder?: string
  class?: string
  ref?: (el: HTMLSpanElement) => void
}

export function SelectValue(props: SelectValueProps) {
  const [local, others] = splitProps(props, ['placeholder', 'class', 'ref'])
  const ctx = useSelectContext()
  const display = () => ctx.selectedLabel() || ctx.value() || local.placeholder

  return (
    <span ref={local.ref} class={local.class} {...others}>
      {display()}
    </span>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

interface SelectContentProps {
  children: JSX.Element
  class?: string
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  container?: HTMLElement
  ref?: (el: HTMLDivElement) => void
}

export function SelectContent(props: SelectContentProps) {
  const merged = mergeProps(
    {
      side: 'bottom' as Side,
      align: 'start' as Align,
      sideOffset: 6,
      alignOffset: 0,
      collisionPadding: 8,
    },
    props
  )
  const [local, others] = splitProps(merged, [
    'children',
    'class',
    'side',
    'align',
    'sideOffset',
    'alignOffset',
    'collisionPadding',
    'container',
    'ref',
  ])

  const ctx = useSelectContext()

  const [mounted, setMounted] = createSignal(false)
  const [pos, setPos] = createSignal<{ x: number; y: number } | null>(null)

  const portalContainer = () => local.container ?? getPortalContainer()

  onMount(() => setMounted(true))
  onCleanup(() => setMounted(false))

  const updatePosition = () => {
    const triggerEl = ctx.triggerRef
    const contentEl = ctx.contentRef
    if (!triggerEl || !contentEl) return
    const triggerRect = triggerEl.getBoundingClientRect()
    const contentRect = contentEl.getBoundingClientRect()
    setPos(
      computePosition({
        triggerRect,
        contentRect,
        side: local.side,
        align: local.align,
        sideOffset: local.sideOffset,
        alignOffset: local.alignOffset,
        collisionPadding: local.collisionPadding,
      })
    )
  }

  createEffect(() => {
    if (!ctx.open()) return
    setPos(null)
    requestAnimationFrame(updatePosition)
  })

  createEffect(() => {
    if (!ctx.open()) return
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
    if (!ctx.open()) return
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedRoot = !!ctx.rootRef && ctx.rootRef.contains(target)
      const clickedContent = !!ctx.contentRef && ctx.contentRef.contains(target)
      if (!clickedRoot && !clickedContent) {
        ctx.setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    onCleanup(() => document.removeEventListener('mousedown', onMouseDown))
  })

  createEffect(() => {
    if (!ctx.open()) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        ctx.setOpen(false)
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const order = ctx.itemsOrder
        if (!order.length) return
        const idx = ctx.activeValue() ? order.indexOf(ctx.activeValue()!) : -1
        const delta = event.key === 'ArrowDown' ? 1 : -1
        const nextIndex = idx === -1 ? (delta === 1 ? 0 : order.length - 1) : (idx + delta + order.length) % order.length
        const nextValue = order[nextIndex]
        if (nextValue) {
          ctx.setActiveValue(nextValue)
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        const v = ctx.activeValue()
        if (!v) return
        const el = document.querySelector<HTMLElement>(`[data-select-item='${CSS.escape(v)}']`)
        el?.click()
        return
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        ctx.onTypeaheadChar(event.key)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    onCleanup(() => document.removeEventListener('keydown', onKeyDown))
  })

  createEffect(() => {
    if (!ctx.open() || !ctx.activeValue()) return
    const viewport = ctx.viewportRef
    if (!viewport) return
    const itemEl = viewport.querySelector<HTMLElement>(`[data-select-item='${CSS.escape(ctx.activeValue()!)}']`)
    itemEl?.scrollIntoView({ block: 'nearest' })
  })

  const style = (): JSX.CSSProperties => ({
    position: 'fixed',
    left: pos() ? `${pos()!.x}px` : '-9999px',
    top: pos() ? `${pos()!.y}px` : '-9999px',
    width: ctx.triggerRef?.getBoundingClientRect().width ? `${ctx.triggerRef.getBoundingClientRect().width}px` : undefined,
  })

  return (
    <Show when={ctx.open()}>
      <Show when={mounted() && portalContainer()}>
        <Portal mount={portalContainer()!}>
          <div
            ref={mergeRefs(ctx.setContentRef, local.ref)}
            style={style()}
            class={cn(
              'z-50 max-h-72 overflow-hidden rounded-md border border-border bg-card shadow-lg',
              'origin-top data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              local.class
            )}
            role='listbox'
            data-state='open'
            {...others}
          >
            <SelectScrollUpButton />

            <div ref={ctx.setViewportRef} class='max-h-72 overflow-auto p-1'>
              {local.children}
            </div>

            <SelectScrollDownButton />
          </div>
        </Portal>
      </Show>
    </Show>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Group / Label / Separator
 * ------------------------------------------------------------------------------------------------- */

interface SelectGroupProps {
  children: JSX.Element
  class?: string
}

export function SelectGroup(props: SelectGroupProps) {
  return <div class={props.class}>{props.children}</div>
}

interface SelectLabelProps {
  children: JSX.Element
  class?: string
  ref?: (el: HTMLDivElement) => void
}

export function SelectLabel(props: SelectLabelProps) {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  return (
    <div ref={local.ref} class={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', local.class)} {...others}>
      {local.children}
    </div>
  )
}

interface SelectSeparatorProps {
  class?: string
  ref?: (el: HTMLDivElement) => void
}

export function SelectSeparator(props: SelectSeparatorProps) {
  const [local, others] = splitProps(props, ['class', 'ref'])
  return <div ref={local.ref} class={cn('my-1 h-px bg-border', local.class)} {...others} />
}

/* -------------------------------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------------------------------- */

interface SelectItemProps {
  children: JSX.Element
  value: string
  disabled?: boolean
  class?: string
  label?: string
  ref?: (el: HTMLDivElement) => void
}

export function SelectItem(props: SelectItemProps) {
  const merged = mergeProps({ disabled: false }, props)
  const [local, others] = splitProps(merged, ['children', 'value', 'disabled', 'class', 'label', 'ref'])

  const ctx = useSelectContext()

  const isSelected = () => ctx.value() === local.value
  const isActive = () => ctx.activeValue() === local.value

  const label = () =>
    local.label ||
    (typeof local.children === 'string' || typeof local.children === 'number' ? String(local.children) : local.value)

  onMount(() => {
    ctx.registerLabel(local.value, label())
    ctx.registerItem(local.value)
    if (isSelected()) ctx.setSelectedLabel(label())
  })

  onCleanup(() => {
    ctx.unregisterLabel(local.value)
    ctx.unregisterItem(local.value)
  })

  createEffect(() => {
    ctx.registerLabel(local.value, label())
    if (isSelected()) ctx.setSelectedLabel(label())
  })

  const commit = () => {
    if (local.disabled) return
    ctx.onValueChange(local.value)
    ctx.setSelectedLabel(label())
  }

  const onMouseEnter = () => {
    if (local.disabled) return
    ctx.setActiveValue(local.value)
  }

  return (
    <div
      ref={local.ref}
      role='option'
      aria-selected={isSelected()}
      aria-disabled={local.disabled}
      tabIndex={-1}
      data-select-item={local.value}
      onMouseEnter={onMouseEnter}
      onClick={commit}
      class={cn(
        'relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-foreground outline-none',
        local.disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-surface',
        isActive() && !local.disabled && 'bg-surface',
        local.class
      )}
      {...others}
    >
      <span class='absolute left-2 flex h-4 w-4 items-center justify-center'>
        <Show when={isSelected()}>
          <Check class='h-4 w-4' />
        </Show>
      </span>
      <span class='block truncate'>{local.children}</span>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Scroll buttons
 * ------------------------------------------------------------------------------------------------- */

function useCanScroll(ref: Accessor<HTMLDivElement | undefined>, dir: 'up' | 'down') {
  const [can, setCan] = createSignal(false)

  const update = () => {
    const el = ref()
    if (!el) return
    if (dir === 'up') setCan(el.scrollTop > 0)
    else setCan(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }

  createEffect(() => {
    update()
    const el = ref()
    if (!el) return
    const onScroll = () => update()
    el.addEventListener('scroll', onScroll)
    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    onCleanup(() => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    })
  })

  return can
}

function SelectScrollUpButton() {
  const ctx = useSelectContext()
  const canScrollUp = useCanScroll(() => ctx.viewportRef, 'up')

  return (
    <Show when={canScrollUp()}>
      <button
        type='button'
        class='flex w-full items-center justify-center py-1 text-muted-foreground hover:text-foreground'
        onMouseDown={(e) => {
          e.preventDefault()
          ctx.viewportRef?.scrollBy({ top: -48, behavior: 'smooth' })
        }}
        aria-hidden
        tabIndex={-1}
      >
        <ChevronUp class='h-4 w-4' />
      </button>
    </Show>
  )
}

function SelectScrollDownButton() {
  const ctx = useSelectContext()
  const canScrollDown = useCanScroll(() => ctx.viewportRef, 'down')

  return (
    <Show when={canScrollDown()}>
      <button
        type='button'
        class='flex w-full items-center justify-center py-1 text-muted-foreground hover:text-foreground'
        onMouseDown={(e) => {
          e.preventDefault()
          ctx.viewportRef?.scrollBy({ top: 48, behavior: 'smooth' })
        }}
        aria-hidden
        tabIndex={-1}
      >
        <ChevronDown class='h-4 w-4' />
      </button>
    </Show>
  )
}

/* -------------------------------------------------------------------------------------------------
 * SimpleSelect (native)
 * ------------------------------------------------------------------------------------------------- */

interface SimpleSelectProps {
  label?: string
  value?: string
  defaultValue?: string
  onChange?: (e: Event & { currentTarget: HTMLSelectElement; target: HTMLSelectElement }) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  helpText?: string
  error?: string
  disabled?: boolean
  required?: boolean
  class?: string
  id?: string
  name?: string
  ref?: (el: HTMLSelectElement) => void
}

export function SimpleSelect(props: SimpleSelectProps) {
  const merged = mergeProps(
    {
      placeholder: 'Select an option...',
      disabled: false,
      required: false,
    },
    props
  )
  const [local, others] = splitProps(merged, [
    'label',
    'value',
    'defaultValue',
    'onChange',
    'options',
    'placeholder',
    'helpText',
    'error',
    'disabled',
    'required',
    'class',
    'id',
    'name',
    'ref',
  ])

  const selectId = () => local.id || local.name || local.label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div class='w-full'>
      <Show when={local.label}>
        <label for={selectId()} class='block text-sm font-medium text-foreground mb-1'>
          {local.label}
          <Show when={local.required}>
            <span class='text-red-500 ml-1'>*</span>
          </Show>
        </label>
      </Show>
      <div class='relative'>
        <select
          ref={local.ref}
          id={selectId()}
          name={local.name}
          value={local.value}
          onChange={local.onChange}
          disabled={local.disabled}
          required={local.required}
          class={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground',
            'ring-offset-surface placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface',
            'pr-10 appearance-none',
            local.error && 'border-red-300 focus-visible:ring-red-500',
            local.class
          )}
          {...others}
        >
          <Show when={local.placeholder && !local.value}>
            <option value='' disabled>
              {local.placeholder}
            </option>
          </Show>
          <For each={local.options}>
            {(option) => <option value={option.value}>{option.label}</option>}
          </For>
        </select>
        <div class='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
          <ChevronDown class='h-4 w-4 opacity-50' />
        </div>
      </div>

      <Show when={local.helpText && !local.error}>
        <p class='mt-1 text-sm text-muted-foreground'>{local.helpText}</p>
      </Show>
      <Show when={local.error}>
        <p class='mt-1 text-sm text-red-600'>{local.error}</p>
      </Show>
    </div>
  )
}
