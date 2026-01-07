// packages/ui/src/react/components/Select.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  forwardRef,
  memo,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils'
import { ChevronDown, Check, ChevronUp } from 'lucide-react'
import { clamp, composeEventHandlers, getPortalContainer, mergeRefs, setRef } from '../lib/helpers'

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
  open: boolean
  setOpen: (open: boolean) => void

  value: string
  onValueChange: (value: string) => void

  disabled: boolean

  rootRef: MutableRefObject<HTMLDivElement | null>
  triggerRef: MutableRefObject<HTMLElement | null>
  contentRef: MutableRefObject<HTMLDivElement | null>
  viewportRef: MutableRefObject<HTMLDivElement | null>

  labelMap: MutableRefObject<Map<string, string>>
  selectedLabel: string
  setSelectedLabel: (label: string) => void
  registerLabel: (value: string, label: string) => void
  unregisterLabel: (value: string) => void

  activeValue: string | null
  setActiveValue: (v: string | null) => void

  itemsOrder: MutableRefObject<string[]>
  registerItem: (value: string) => void
  unregisterItem: (value: string) => void

  onTypeaheadChar: (char: string) => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error('Select compound components must be used within a Select component')
  return ctx
}

/* -------------------------------------------------------------------------------------------------
 * Root Select
 * ------------------------------------------------------------------------------------------------- */

interface SelectProps {
  children: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  label?: string
  required?: boolean
}

const Select = memo(function Select({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  disabled = false,
  label,
  required = false,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [open, setOpenState] = useState(false)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const labelMap = useRef(new Map<string, string>())
  const itemsOrder = useRef<string[]>([])
  const [activeValue, setActiveValue] = useState<string | null>(null)

  const typeahead = useRef<{ query: string; timer: number | null }>({ query: '', timer: null })

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled) return
      setOpenState(next)
      if (!next) {
        setActiveValue(null)
        triggerRef.current?.focus?.()
      }
    },
    [disabled]
  )

  const registerLabel = useCallback(
    (itemValue: string, labelStr: string) => {
      labelMap.current.set(itemValue, labelStr)
      if (itemValue === value) setSelectedLabel(labelStr)
    },
    [value]
  )

  const unregisterLabel = useCallback((itemValue: string) => {
    labelMap.current.delete(itemValue)
  }, [])

  const registerItem = useCallback((itemValue: string) => {
    const arr = itemsOrder.current
    if (!arr.includes(itemValue)) arr.push(itemValue)
  }, [])

  const unregisterItem = useCallback((itemValue: string) => {
    itemsOrder.current = itemsOrder.current.filter(v => v !== itemValue)
  }, [])

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (!isControlled) setInternalValue(newValue)
      onValueChange?.(newValue)
      const l = labelMap.current.get(newValue)
      if (l) setSelectedLabel(l)
      setOpen(false)
    },
    [isControlled, onValueChange, setOpen]
  )

  useEffect(() => {
    if (!value) {
      if (selectedLabel) setSelectedLabel('')
      return
    }
    const l = labelMap.current.get(value)
    if (l && l !== selectedLabel) setSelectedLabel(l)
  }, [value, selectedLabel])

  const onTypeaheadChar = useCallback(
    (char: string) => {
      if (!open) return
      const q = (typeahead.current.query + char).toLowerCase()
      typeahead.current.query = q
      if (typeahead.current.timer) window.clearTimeout(typeahead.current.timer)

      typeahead.current.timer = window.setTimeout(() => {
        typeahead.current.query = ''
        typeahead.current.timer = null
      }, 500)

      const order = itemsOrder.current
      if (!order.length) return

      const startIndex = activeValue ? Math.max(0, order.indexOf(activeValue)) : 0
      const candidates = order.slice(startIndex).concat(order.slice(0, startIndex))
      const labels = labelMap.current

      const hit = candidates.find(v => (labels.get(v) || v).toLowerCase().startsWith(q))
      if (hit) setActiveValue(hit)
    },
    [activeValue, open]
  )

  const ctx = useMemo<SelectContextValue>(
    () => ({
      open,
      setOpen,
      value,
      onValueChange: handleValueChange,
      disabled,

      rootRef,
      triggerRef,
      contentRef,
      viewportRef,

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
    }),
    [
      open,
      setOpen,
      value,
      handleValueChange,
      disabled,
      selectedLabel,
      registerLabel,
      unregisterLabel,
      activeValue,
      onTypeaheadChar,
      registerItem,
      unregisterItem,
    ]
  )

  const wrapped = (
    <SelectContext.Provider value={ctx}>
      <div ref={rootRef} className='relative'>
        {children}
      </div>
    </SelectContext.Provider>
  )

  if (!label) return wrapped

  return (
    <div className='w-full'>
      <label className='block text-sm font-medium text-foreground mb-1'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      <div className={cn(disabled && 'opacity-50 cursor-not-allowed')}>{wrapped}</div>
    </div>
  )
})

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

interface SelectTriggerProps {
  children?: ReactNode
  className?: string
  placeholder?: string
  asChild?: boolean
}

const SelectTrigger = memo(
  forwardRef<HTMLButtonElement, SelectTriggerProps>(({ children, className, placeholder, asChild = false }, ref) => {
    const { open, setOpen, value, selectedLabel, disabled, triggerRef, onTypeaheadChar, setActiveValue } = useSelectContext()

    const displayText =
      selectedLabel ||
      (value ? selectedLabel || String(children ?? '') : placeholder || 'Select an option...')

    const onClick = useCallback(() => {
      if (disabled) return
      setOpen(!open)
      if (!open) setActiveValue(value || null)
    }, [disabled, open, setOpen, setActiveValue, value])

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
          return
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setOpen(true)
          setActiveValue(value || null)
          return
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          onTypeaheadChar(e.key)
        }
      },
      [disabled, onClick, onTypeaheadChar, setActiveValue, setOpen, value]
    )

    const baseClass = cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground',
      'ring-offset-surface placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement
      const childProps = child.props as {
        onClick?: React.MouseEventHandler
        onKeyDown?: React.KeyboardEventHandler
        className?: string
      }
      // TypeScript can't infer props when cloning with ref, so we assert the type is correct
      return React.cloneElement(child, {
        ref: mergeRefs(setRef(triggerRef), ref), // ✅ no child.ref
        onClick: composeEventHandlers(childProps.onClick, () => onClick()),
        onKeyDown: composeEventHandlers(childProps.onKeyDown, onKeyDown),
        className: cn(childProps.className, baseClass),
        'aria-expanded': open,
        'aria-haspopup': 'listbox',
        'data-state': open ? 'open' : 'closed',
      } as Record<string, unknown>)
    }

    return (
      <button
        ref={mergeRefs(setRef(triggerRef as React.MutableRefObject<HTMLButtonElement | null>), ref)}
        type='button'
        onClick={onClick}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={baseClass}
        aria-expanded={open}
        aria-haspopup='listbox'
        data-state={open ? 'open' : 'closed'}
      >
        <span className={cn('block truncate', !value && 'text-muted-foreground')}>{displayText}</span>
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
    )
  })
)
SelectTrigger.displayName = 'SelectTrigger'

/* -------------------------------------------------------------------------------------------------
 * Value
 * ------------------------------------------------------------------------------------------------- */

interface SelectValueProps {
  placeholder?: string
  className?: string
}

const SelectValue = memo(
  forwardRef<HTMLSpanElement, SelectValueProps>(({ placeholder, className }, ref) => {
    const { value, selectedLabel } = useSelectContext()
    const display = selectedLabel || value || placeholder
    return (
      <span ref={ref} className={className}>
        {display}
      </span>
    )
  })
)
SelectValue.displayName = 'SelectValue'

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

interface SelectContentProps {
  children: ReactNode
  className?: string
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  collisionPadding?: number
  container?: HTMLElement
}

const SelectContent = memo(
  forwardRef<HTMLDivElement, SelectContentProps>(
    (
      {
        children,
        className,
        side = 'bottom',
        align = 'start',
        sideOffset = 6,
        alignOffset = 0,
        collisionPadding = 8,
        container,
      },
      ref
    ) => {
      const {
        open,
        setOpen,
        triggerRef,
        contentRef,
        rootRef,
        viewportRef,
        onTypeaheadChar,
        activeValue,
        setActiveValue,
        itemsOrder,
      } = useSelectContext()

      const [mounted, setMounted] = useState(false)
      const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

      const portalContainer = container ?? getPortalContainer()

      useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
      }, [])

      const updatePosition = useCallback(() => {
        const triggerEl = triggerRef.current
        const contentEl = contentRef.current
        if (!triggerEl || !contentEl) return
        const triggerRect = triggerEl.getBoundingClientRect()
        const contentRect = contentEl.getBoundingClientRect()
        setPos(
          computePosition({
            triggerRect,
            contentRect,
            side,
            align,
            sideOffset,
            alignOffset,
            collisionPadding,
          })
        )
      }, [align, alignOffset, collisionPadding, side, sideOffset, triggerRef, contentRef])

      useLayoutEffect(() => {
        if (!open) return
        setPos(null)
        requestAnimationFrame(updatePosition)
      }, [open, updatePosition])

      useEffect(() => {
        if (!open) return
        const onResize = () => updatePosition()
        const onScroll = () => updatePosition()
        window.addEventListener('resize', onResize)
        window.addEventListener('scroll', onScroll, true)
        return () => {
          window.removeEventListener('resize', onResize)
          window.removeEventListener('scroll', onScroll, true)
        }
      }, [open, updatePosition])

      useEffect(() => {
        if (!open) return
        const onMouseDown = (event: MouseEvent) => {
          const target = event.target as Node
          const clickedRoot = !!rootRef.current && rootRef.current.contains(target)
          const clickedContent = !!contentRef.current && contentRef.current.contains(target)
          if (!clickedRoot && !clickedContent) {
            setOpen(false)
          }
        }
        document.addEventListener('mousedown', onMouseDown)
        return () => document.removeEventListener('mousedown', onMouseDown)
      }, [open, rootRef, contentRef, setOpen])

      useEffect(() => {
        if (!open) return

        const onKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            setOpen(false)
            return
          }

          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const order = itemsOrder.current
            if (!order.length) return
            const idx = activeValue ? order.indexOf(activeValue) : -1
            const delta = event.key === 'ArrowDown' ? 1 : -1
            const nextIndex = idx === -1 ? (delta === 1 ? 0 : order.length - 1) : (idx + delta + order.length) % order.length
            const nextValue = order[nextIndex]
            if (nextValue) {
              setActiveValue(nextValue)
            }
            return
          }

          if (event.key === 'Enter' || event.key === ' ') {
            const v = activeValue
            if (!v) return
            const el = document.querySelector<HTMLElement>(`[data-select-item='${CSS.escape(v)}']`)
            el?.click()
            return
          }

          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            onTypeaheadChar(event.key)
          }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
      }, [open, activeValue, itemsOrder, onTypeaheadChar, setActiveValue, setOpen])

      useEffect(() => {
        if (!open || !activeValue) return
        const viewport = viewportRef.current
        if (!viewport) return
        const itemEl = viewport.querySelector<HTMLElement>(`[data-select-item='${CSS.escape(activeValue)}']`)
        itemEl?.scrollIntoView({ block: 'nearest' })
      }, [open, activeValue, viewportRef])

      if (!open) return <div className='hidden' aria-hidden>{children}</div>
      if (!mounted || !portalContainer) return null

      const style: CSSProperties = {
        position: 'fixed',
        left: pos ? pos.x : -9999,
        top: pos ? pos.y : -9999,
        width: triggerRef.current?.getBoundingClientRect().width,
      }

      return createPortal(
        <div
          ref={mergeRefs(setRef(contentRef), ref)} // ✅ correct content ref type
          style={style}
          className={cn(
            'z-50 max-h-72 overflow-hidden rounded-md border border-border bg-card shadow-lg',
            'origin-top data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className
          )}
          role='listbox'
          data-state='open'
        >
          <SelectScrollUpButton />

          <div ref={setRef(viewportRef)} className='max-h-72 overflow-auto p-1'>
            {children}
          </div>

          <SelectScrollDownButton />
        </div>,
        portalContainer
      )
    }
  )
)
SelectContent.displayName = 'SelectContent'

/* -------------------------------------------------------------------------------------------------
 * Group / Label / Separator
 * ------------------------------------------------------------------------------------------------- */

interface SelectGroupProps {
  children: ReactNode
  className?: string
}
const SelectGroup = memo(function SelectGroup({ children, className }: SelectGroupProps) {
  return <div className={className}>{children}</div>
})

interface SelectLabelProps {
  children: ReactNode
  className?: string
}
const SelectLabel = memo(
  forwardRef<HTMLDivElement, SelectLabelProps>(({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}>
        {children}
      </div>
    )
  })
)
SelectLabel.displayName = 'SelectLabel'

interface SelectSeparatorProps {
  className?: string
}
const SelectSeparator = memo(
  forwardRef<HTMLDivElement, SelectSeparatorProps>(({ className }, ref) => {
    return <div ref={ref} className={cn('my-1 h-px bg-border', className)} />
  })
)
SelectSeparator.displayName = 'SelectSeparator'

/* -------------------------------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------------------------------- */

interface SelectItemProps {
  children: ReactNode
  value: string
  disabled?: boolean
  className?: string
  label?: string
}

const SelectItem = memo(
  forwardRef<HTMLDivElement, SelectItemProps>(({ children, value, disabled = false, className, label: labelProp }, ref) => {
    const {
      value: selectedValue,
      onValueChange,
      setSelectedLabel,
      registerLabel,
      unregisterLabel,
      registerItem,
      unregisterItem,
      activeValue,
      setActiveValue,
    } = useSelectContext()

    const isSelected = selectedValue === value
    const isActive = activeValue === value

    const label =
      labelProp ||
      (typeof children === 'string' || typeof children === 'number' ? String(children) : value)

    useEffect(() => {
      registerLabel(value, label)
      registerItem(value)
      if (isSelected) setSelectedLabel(label)
      return () => {
        unregisterLabel(value)
        unregisterItem(value)
      }
    }, [value, label, isSelected, registerLabel, unregisterLabel, registerItem, unregisterItem, setSelectedLabel])

    const commit = useCallback(() => {
      if (disabled) return
      onValueChange(value)
      setSelectedLabel(label)
    }, [disabled, label, onValueChange, setSelectedLabel, value])

    const onMouseEnter = useCallback(() => {
      if (disabled) return
      setActiveValue(value)
    }, [disabled, setActiveValue, value])

    return (
      <div
        ref={ref}
        role='option'
        aria-selected={isSelected}
        aria-disabled={disabled}
        tabIndex={-1}
        data-select-item={value}
        onMouseEnter={onMouseEnter}
        onClick={commit}
        className={cn(
          'relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-foreground outline-none',
          disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-surface',
          isActive && !disabled && 'bg-surface',
          className
        )}
      >
        <span className='absolute left-2 flex h-4 w-4 items-center justify-center'>
          {isSelected && <Check className='h-4 w-4' />}
        </span>
        <span className='block truncate'>{children}</span>
      </div>
    )
  })
)
SelectItem.displayName = 'SelectItem'

/* -------------------------------------------------------------------------------------------------
 * Scroll buttons (fixed typing)
 * ------------------------------------------------------------------------------------------------- */

function useCanScroll(ref: React.RefObject<HTMLDivElement | null>, dir: 'up' | 'down') {
  const [can, setCan] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (dir === 'up') setCan(el.scrollTop > 0)
    else setCan(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [dir, ref])

  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    const onScroll = () => update()
    el.addEventListener('scroll', onScroll)
    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [ref, update])

  return can
}

const SelectScrollUpButton = memo(function SelectScrollUpButton() {
  const { viewportRef } = useSelectContext()
  const canScrollUp = useCanScroll(viewportRef, 'up')

  if (!canScrollUp) return null

  return (
    <button
      type='button'
      className='flex w-full items-center justify-center py-1 text-muted-foreground hover:text-foreground'
      onMouseDown={(e) => {
        e.preventDefault()
        viewportRef.current?.scrollBy({ top: -48, behavior: 'smooth' })
      }}
      aria-hidden
      tabIndex={-1}
    >
      <ChevronUp className='h-4 w-4' />
    </button>
  )
})

const SelectScrollDownButton = memo(function SelectScrollDownButton() {
  const { viewportRef } = useSelectContext()
  const canScrollDown = useCanScroll(viewportRef, 'down')

  if (!canScrollDown) return null

  return (
    <button
      type='button'
      className='flex w-full items-center justify-center py-1 text-muted-foreground hover:text-foreground'
      onMouseDown={(e) => {
        e.preventDefault()
        viewportRef.current?.scrollBy({ top: 48, behavior: 'smooth' })
      }}
      aria-hidden
      tabIndex={-1}
    >
      <ChevronDown className='h-4 w-4' />
    </button>
  )
})

/* -------------------------------------------------------------------------------------------------
 * SimpleSelect (native)
 * ------------------------------------------------------------------------------------------------- */

interface SimpleSelectProps {
  label?: string
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  helpText?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
  name?: string
}

const SimpleSelect = memo(
  forwardRef<HTMLSelectElement, SimpleSelectProps>(
    (
      {
        label,
        value,
        defaultValue,
        onChange,
        options,
        placeholder = 'Select an option...',
        helpText,
        error,
        disabled = false,
        required = false,
        className,
        id,
        name,
      },
      ref
    ) => {
      const selectId = id || name || label?.toLowerCase().replace(/\s+/g, '-')

      return (
        <div className='w-full'>
          {label && (
            <label htmlFor={selectId} className='block text-sm font-medium text-foreground mb-1'>
              {label}
              {required && <span className='text-red-500 ml-1'>*</span>}
            </label>
          )}
          <div className='relative'>
            <select
              ref={ref}
              id={selectId}
              name={name}
              value={value}
              defaultValue={defaultValue}
              onChange={onChange}
              disabled={disabled}
              required={required}
              className={cn(
                'flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground',
                'ring-offset-surface placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface',
                'pr-10 appearance-none',
                error && 'border-red-300 focus-visible:ring-red-500',
                className
              )}
            >
              {placeholder && !value && (
                <option value='' disabled>
                  {placeholder}
                </option>
              )}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </div>
          </div>

          {helpText && !error && <p className='mt-1 text-sm text-muted-foreground'>{helpText}</p>}
          {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
        </div>
      )
    }
  )
)
SimpleSelect.displayName = 'SimpleSelect'

/* -------------------------------------------------------------------------------------------------
 * Exports
 * ------------------------------------------------------------------------------------------------- */

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SimpleSelect,
}
