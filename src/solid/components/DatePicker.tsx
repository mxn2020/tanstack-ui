// packages/ui/src/solid/components/DatePicker.tsx
/**
 * DatePicker Component
 *
 * A comprehensive date picker component that supports both single date selection and date ranges.
 * Built on top of the Calendar and Popover components.
 *
 * @example Single Date Mode
 * ```tsx
 * <DatePicker
 *   mode='single'
 *   label='Hire Date'
 *   value={selectedDate()}
 *   onChange={(date) => setSelectedDate(date)}
 *   placeholder='Select a date'
 *   fromDate={new Date()} // Disable dates before today
 *   required
 * />
 * ```
 *
 * @example Date Range Mode
 * ```tsx
 * <DatePicker
 *   mode='range'
 *   label='Vacation Period'
 *   value={dateRange()} // { start: Date, end: Date }
 *   onChange={(range) => setDateRange(range)}
 *   placeholder='Select date range'
 * />
 * ```
 *
 * Features:
 * - Single date or date range selection
 * - Clearable dates with X button
 * - Date validation (fromDate, toDate)
 * - Custom disabled dates function
 * - Form integration (label, error, helpText)
 * - Keyboard accessible
 * - Responsive design
 */
import { Component, JSX, splitProps, createSignal, createMemo, Show, createUniqueId } from 'solid-js'
import { cn } from '../lib/utils'
import { Calendar as CalendarIcon, X } from 'lucide-solid'
import { Calendar } from './Calendar'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import type { InputSize, FormComponentProps } from '../lib/types'

// Date formatting utilities
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

const formatDateRange = (start: Date, end: Date): string => {
  return `${formatDate(start)} - ${formatDate(end)}`
}

// Single date picker props
interface SingleDatePickerProps extends Omit<FormComponentProps, 'disabled'> {
  mode: 'single'
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  size?: InputSize
  class?: string
  id?: string
  disabled?: boolean | ((date: Date) => boolean)
  required?: boolean
  fromDate?: Date
  toDate?: Date
  defaultMonth?: Date
  clearable?: boolean
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

// Date range picker props
interface RangeDatePickerProps extends Omit<FormComponentProps, 'disabled'> {
  mode: 'range'
  value?: { start: Date; end: Date }
  onChange?: (range: { start: Date; end: Date } | undefined) => void
  label?: string
  placeholder?: string
  size?: InputSize
  class?: string
  id?: string
  disabled?: boolean | ((date: Date) => boolean)
  required?: boolean
  fromDate?: Date
  toDate?: Date
  defaultMonth?: Date
  clearable?: boolean
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void)
}

type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-3 py-2 text-sm h-10',
  lg: 'px-4 py-3 text-base h-12'
}

export const DatePicker: Component<DatePickerProps> = (props) => {
  const [local, others] = splitProps(props, [
    'label',
    'error',
    'helpText',
    'size',
    'class',
    'id',
    'disabled',
    'required',
    'placeholder',
    'fromDate',
    'toDate',
    'defaultMonth',
    'clearable',
    'mode',
    'value',
    'onChange',
    'ref'
  ])

  const generatedId = createUniqueId()
  const inputId = () => local.id || generatedId
  const hasError = () => Boolean(local.error)
  const [open, setOpen] = createSignal(false)

  // Determine if the entire component is disabled
  const isComponentDisabled = () => typeof local.disabled === 'boolean' ? local.disabled : false

  // Determine the disabled function for calendar
  const calendarDisabled = createMemo(() => {
    return typeof local.disabled === 'function' ? local.disabled : undefined
  })

  // Get display value
  const displayValue = createMemo(() => {
    if (local.mode === 'single') {
      return local.value && local.value instanceof Date ? formatDate(local.value) : ''
    } else {
      if (local.value && typeof local.value === 'object' && 'start' in local.value && 'end' in local.value) {
        return formatDateRange(local.value.start, local.value.end)
      }
      return ''
    }
  })

  // Handle calendar selection
  const handleCalendarSelect = (date: Date | Date[] | undefined) => {
    if (local.mode === 'single') {
      if (date instanceof Date) {
        (local.onChange as ((date: Date | undefined) => void) | undefined)?.(date)
        setOpen(false)
      } else if (date === undefined) {
        (local.onChange as ((date: Date | undefined) => void) | undefined)?.(undefined)
        setOpen(false)
      }
    } else {
      // Range mode
      if (Array.isArray(date) && date.length === 2) {
        const start = date[0]
        const end = date[1]
        if (start && end) {
          (local.onChange as ((range: { start: Date; end: Date } | undefined) => void) | undefined)?.({ start, end })
          setOpen(false)
        }
      } else if (date === undefined) {
        (local.onChange as ((range: { start: Date; end: Date } | undefined) => void) | undefined)?.(undefined)
      }
    }
  }

  // Handle clear
  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    if (local.mode === 'single') {
      local.onChange?.(undefined)
    } else {
      local.onChange?.(undefined)
    }
  }

  // Prepare calendar selected value
  const calendarSelected = createMemo(() => {
    if (local.mode === 'single') {
      return local.value instanceof Date ? local.value : undefined
    } else {
      if (local.value && typeof local.value === 'object' && 'start' in local.value && 'end' in local.value) {
        return [local.value.start, local.value.end]
      }
      return undefined
    }
  })

  // Get the default month for calendar
  const calendarDefaultMonth = createMemo(() => {
    if (local.defaultMonth) return local.defaultMonth

    if (local.mode === 'single' && local.value instanceof Date) {
      return local.value
    }

    if (local.mode === 'range' && local.value && typeof local.value === 'object' && 'start' in local.value) {
      return local.value.start
    }

    return new Date()
  })

  const showClearButton = () => (local.clearable ?? true) && displayValue() && !isComponentDisabled()

  return (
    <div class="w-full">
      <Show when={local.label}>
        <label
          for={inputId()}
          class={cn(
            'block text-sm font-medium text-foreground mb-1',
            isComponentDisabled() && 'opacity-50'
          )}
        >
          {local.label}
          <Show when={local.required}>
            <span class="text-red-500 ml-1">*</span>
          </Show>
        </label>
      </Show>

      <Popover open={open()} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            ref={local.ref}
            id={inputId()}
            type="button"
            disabled={isComponentDisabled()}
            class={cn(
              'flex items-center justify-between w-full border border-border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-surface disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors bg-card',
              sizeClasses[local.size ?? 'md'],
              hasError() && 'border-red-300 focus:ring-red-500 focus:border-red-500',
              local.class
            )}
            aria-invalid={hasError()}
            aria-describedby={
              local.error ? `${inputId()}-error` :
              local.helpText ? `${inputId()}-help` : undefined
            }
          >
            <span class={cn(
              'flex items-center gap-2 flex-1 text-left',
              !displayValue() && 'text-muted-foreground'
            )}>
              <CalendarIcon class="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span class="truncate">
                {displayValue() || local.placeholder || 'Select date...'}
              </span>
            </span>

            <Show when={showClearButton()}>
              <button
                type="button"
                onClick={handleClear}
                class="flex-shrink-0 ml-2 p-0.5 hover:bg-surface rounded transition-colors"
                aria-label="Clear date"
              >
                <X class="h-3.5 w-3.5 text-muted-foreground hover:text-muted-foreground" />
              </button>
            </Show>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          class="w-auto p-0"
          sideOffset={8}
        >
          <Calendar
            mode={local.mode}
            selected={calendarSelected()}
            onSelect={handleCalendarSelect}
            disabled={calendarDisabled()}
            fromDate={local.fromDate}
            toDate={local.toDate}
            defaultMonth={calendarDefaultMonth()}
            numberOfMonths={local.mode === 'range' ? 2 : 1}
          />
        </PopoverContent>
      </Popover>

      <Show when={local.error}>
        <p id={`${inputId()}-error`} class="mt-1 text-sm text-red-600">
          {local.error}
        </p>
      </Show>

      <Show when={local.helpText && !local.error}>
        <p id={`${inputId()}-help`} class="mt-1 text-sm text-muted-foreground">
          {local.helpText}
        </p>
      </Show>
    </div>
  )
}
