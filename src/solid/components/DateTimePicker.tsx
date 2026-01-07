// packages/ui/src/solid/components/DateTimePicker.tsx
/**
 * DateTimePicker Component
 *
 * A comprehensive date and time picker component that extends the DatePicker
 * with time selection functionality.
 *
 * @example Basic Usage
 * ```tsx
 * <DateTimePicker
 *   value={selectedDateTime()}
 *   onChange={(date) => setSelectedDateTime(date)}
 *   placeholder='Select date and time'
 *   label='Appointment'
 *   required
 * />
 * ```
 *
 * @example With Min/Max Dates
 * ```tsx
 * <DateTimePicker
 *   value={deadline()}
 *   onChange={(date) => setDeadline(date)}
 *   min={new Date()} // Can't select dates in the past
 *   max={new Date('2025-12-31')} // Can't select dates after 2025
 * />
 * ```
 *
 * Features:
 * - Date and time selection in one component
 * - Clearable with X button
 * - Min/Max date validation
 * - Custom disabled dates function
 * - Form integration (label, error, helpText)
 * - 12-hour or 24-hour time format
 * - Keyboard accessible
 * - Responsive design
 */
import {
  createSignal,
  createMemo,
  createUniqueId,
  Show,
  type Component,
  type JSX,
  splitProps,
} from 'solid-js'
import { cn } from '../lib/utils'
import { Calendar as CalendarIcon, X, Clock } from 'lucide-solid'
import { Calendar } from './Calendar'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'
import type { InputSize, FormComponentProps } from '../lib/types'

// Date/Time formatting utilities
const formatDateTime = (date: Date, format24Hour: boolean = false): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')

  if (format24Hour) {
    const hoursStr = hours.toString().padStart(2, '0')
    return `${month}/${day}/${year} ${hoursStr}:${minutes}`
  } else {
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`
  }
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

interface DateTimePickerProps extends Omit<FormComponentProps, 'disabled'> {
  value?: Date
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
  size?: InputSize
  class?: string
  id?: string
  disabled?: boolean | ((date: Date) => boolean)
  required?: boolean
  min?: Date
  max?: Date
  defaultMonth?: Date
  clearable?: boolean
  format24Hour?: boolean
  copy?: Partial<{
    placeholder: string
    clearDateTime: string
    hourPlaceholder: string
    minutePlaceholder: string
    done: string
  }>
  ref?: (el: HTMLButtonElement) => void
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-3 py-2 text-sm h-10',
  lg: 'px-4 py-3 text-base h-12',
}

export const DateTimePicker: Component<DateTimePickerProps> = (props) => {
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
    'min',
    'max',
    'defaultMonth',
    'clearable',
    'format24Hour',
    'value',
    'onChange',
    'copy',
    'ref',
  ])

  const labels = createMemo(() => ({
    placeholder: 'Select date and time',
    clearDateTime: 'Clear date and time',
    hourPlaceholder: 'HH',
    minutePlaceholder: 'MM',
    done: 'Done',
    ...local.copy,
  }))

  const defaultPlaceholder = createMemo(
    () => local.placeholder || labels().placeholder
  )

  const generatedId = createUniqueId()
  const inputId = createMemo(() => local.id || generatedId)
  const hasError = createMemo(() => Boolean(local.error))
  const [open, setOpen] = createSignal(false)

  // Local state for time inputs
  const [hours, setHours] = createSignal<string>((() => {
    if (!local.value) return local.format24Hour ? '00' : '12'
    const h = local.value.getHours()
    return local.format24Hour
      ? h.toString().padStart(2, '0')
      : ((h % 12) || 12).toString()
  })())

  const [minutes, setMinutes] = createSignal<string>((() => {
    if (!local.value) return '00'
    return local.value.getMinutes().toString().padStart(2, '0')
  })())

  const [ampm, setAmpm] = createSignal<'AM' | 'PM'>((() => {
    if (!local.value || local.format24Hour) return 'AM'
    return local.value.getHours() >= 12 ? 'PM' : 'AM'
  })())

  // Determine if the entire component is disabled
  const isComponentDisabled = createMemo(() =>
    typeof local.disabled === 'boolean' ? local.disabled : false
  )

  // Determine the disabled function for calendar
  const calendarDisabled = createMemo(() => {
    if (typeof local.disabled === 'function') return local.disabled

    // Create disabled function based on min/max
    if (local.min || local.max) {
      return (date: Date) => {
        if (local.min && date < local.min && !isSameDay(date, local.min))
          return true
        if (local.max && date > local.max && !isSameDay(date, local.max))
          return true
        return false
      }
    }

    return undefined
  })

  // Get display value
  const displayValue = createMemo(() => {
    return local.value ? formatDateTime(local.value, local.format24Hour) : ''
  })

  // Handle calendar selection
  const handleCalendarSelect = (selectedDate: Date | Date[] | undefined) => {
    if (selectedDate instanceof Date) {
      // Create a new date with current time values
      const newDate = new Date(selectedDate)

      if (local.format24Hour) {
        const h = parseInt(hours()) || 0
        newDate.setHours(h)
      } else {
        let h = parseInt(hours()) || 12
        if (ampm() === 'PM' && h !== 12) h += 12
        if (ampm() === 'AM' && h === 12) h = 0
        newDate.setHours(h)
      }

      newDate.setMinutes(parseInt(minutes()) || 0)
      newDate.setSeconds(0)
      newDate.setMilliseconds(0)

      local.onChange?.(newDate)
      // Don't close popover yet - let user set time
    } else if (selectedDate === undefined) {
      local.onChange?.(undefined)
    }
  }

  // Handle time change
  const handleTimeChange = () => {
    if (!local.value) return

    const newDate = new Date(local.value)

    if (local.format24Hour) {
      const h = parseInt(hours()) || 0
      newDate.setHours(Math.max(0, Math.min(23, h)))
    } else {
      let h = parseInt(hours()) || 12
      if (ampm() === 'PM' && h !== 12) h += 12
      if (ampm() === 'AM' && h === 12) h = 0
      newDate.setHours(h)
    }

    const m = parseInt(minutes()) || 0
    newDate.setMinutes(Math.max(0, Math.min(59, m)))
    newDate.setSeconds(0)
    newDate.setMilliseconds(0)

    local.onChange?.(newDate)
  }

  // Update time when inputs change
  const handleHoursChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    e
  ) => {
    const val = e.currentTarget.value.replace(/\D/g, '')
    const max = local.format24Hour ? 23 : 12
    const num = parseInt(val) || 0
    setHours(val)

    if (val.length === 2 && num >= 0 && num <= max) {
      handleTimeChange()
    }
  }

  const handleMinutesChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    e
  ) => {
    const val = e.currentTarget.value.replace(/\D/g, '')
    const num = parseInt(val) || 0
    setMinutes(val)

    if (val.length === 2 && num >= 0 && num <= 59) {
      handleTimeChange()
    }
  }

  const handleAmPmToggle = () => {
    setAmpm((prev) => {
      const newAmPm = prev === 'AM' ? 'PM' : 'AM'

      // Update the time immediately
      if (local.value) {
        const newDate = new Date(local.value)
        let h = parseInt(hours()) || 12

        if (newAmPm === 'PM' && h !== 12) h += 12
        if (newAmPm === 'AM' && h === 12) h = 0

        newDate.setHours(h)
        local.onChange?.(newDate)
      }

      return newAmPm
    })
  }

  // Handle clear
  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    local.onChange?.(undefined)
    setHours(local.format24Hour ? '00' : '12')
    setMinutes('00')
    setAmpm('AM')
  }

  // Get the default month for calendar
  const calendarDefaultMonth = createMemo(() => {
    if (local.defaultMonth) return local.defaultMonth
    if (local.value) return local.value
    return new Date()
  })

  const showClearButton = createMemo(
    () => local.clearable && displayValue() && !isComponentDisabled()
  )

  return (
    <div class='w-full'>
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
            <span class='text-red-500 ml-1'>*</span>
          </Show>
        </label>
      </Show>

      <Popover open={open()} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            ref={local.ref}
            id={inputId()}
            type='button'
            disabled={isComponentDisabled()}
            class={cn(
              'flex items-center justify-between w-full border border-border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-surface disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors bg-card',
              sizeClasses[local.size || 'md'],
              hasError() &&
                'border-red-300 focus:ring-red-500 focus:border-red-500',
              local.class
            )}
            aria-invalid={hasError()}
              aria-describedby={
                local.error
                  ? `${inputId()}-error`
                  : local.helpText
                  ? `${inputId()}-help`
                  : undefined
              }
            >
              <span
                class={cn(
                  'flex items-center gap-2 flex-1 text-left',
                  !displayValue() && 'text-muted-foreground'
                )}
              >
                <CalendarIcon class='h-4 w-4 text-muted-foreground flex-shrink-0' />
                <span class='truncate'>
                  {displayValue() || defaultPlaceholder()}
                </span>
              </span>

              <Show when={showClearButton()}>
                <button
                  type='button'
                  onClick={handleClear}
                  class='flex-shrink-0 ml-2 p-0.5 hover:bg-surface rounded transition-colors'
                  aria-label={labels().clearDateTime}
                >
                  <X class='h-3.5 w-3.5 text-muted-foreground hover:text-muted-foreground' />
                </button>
              </Show>
            </button>
        </PopoverTrigger>

        <PopoverContent align='start' class='w-auto p-0' sideOffset={8}>
          <div>
            <Calendar
              mode='single'
              selected={local.value}
              onSelect={handleCalendarSelect}
              disabled={calendarDisabled()}
              fromDate={local.min}
              toDate={local.max}
              defaultMonth={calendarDefaultMonth()}
              numberOfMonths={1}
            />

            {/* Time picker section */}
            <div class='border-t border-border p-4 bg-surface'>
              <div class='flex items-center justify-center gap-2'>
                <div class='flex items-center gap-1'>
                  <Clock class='h-4 w-4 text-muted-foreground' />
                  <input
                    type='text'
                    value={hours()}
                    onInput={handleHoursChange}
                    onBlur={() => {
                      const max = local.format24Hour ? 23 : 12
                      const min = local.format24Hour ? 0 : 1
                      let num = parseInt(hours()) || min
                      num = Math.max(min, Math.min(max, num))
                      setHours(num.toString().padStart(2, '0'))
                      handleTimeChange()
                    }}
                    class='w-12 px-2 py-1 text-center border border-border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder={labels().hourPlaceholder}
                    maxLength={2}
                  />
                  <span class='text-muted-foreground'>:</span>
                  <input
                    type='text'
                    value={minutes()}
                    onInput={handleMinutesChange}
                    onBlur={() => {
                      let num = parseInt(minutes()) || 0
                      num = Math.max(0, Math.min(59, num))
                      setMinutes(num.toString().padStart(2, '0'))
                      handleTimeChange()
                    }}
                    class='w-12 px-2 py-1 text-center border border-border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder={labels().minutePlaceholder}
                    maxLength={2}
                  />
                </div>

                <Show when={!local.format24Hour}>
                  <button
                    type='button'
                    onClick={handleAmPmToggle}
                    class='px-3 py-1 text-sm font-medium border border-border rounded bg-card hover:bg-surface focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                  >
                    {ampm()}
                  </button>
                </Show>
              </div>

              <div class='mt-2 flex justify-end'>
                <button
                  type='button'
                  onClick={() => setOpen(false)}
                  class='px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors'
                >
                  {labels().done}
                </button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Show when={local.error}>
        <p id={`${inputId()}-error`} class='mt-1 text-sm text-red-600'>
          {local.error}
        </p>
      </Show>

      <Show when={local.helpText && !local.error}>
        <p id={`${inputId()}-help`} class='mt-1 text-sm text-muted-foreground'>
          {local.helpText}
        </p>
      </Show>
    </div>
  )
}
