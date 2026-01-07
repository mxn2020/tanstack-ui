// packages/ui/src/solid/components/Calendar.tsx

import { Component, JSX, splitProps, createSignal, createEffect, For, Show, createMemo, onMount } from 'solid-js'
import { cn } from '../lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-solid'

const getDaysInMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
const getFirstDayOfMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const isToday = (date: Date): boolean => isSameDay(date, new Date())
const isSameMonth = (a: Date, b: Date): boolean => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

interface CalendarProps {
  selected?: Date | Date[]
  onSelect?: (date: Date | Date[] | undefined) => void
  mode?: 'single' | 'multiple' | 'range'
  disabled?: (date: Date) => boolean
  class?: string
  showOutsideDays?: boolean
  numberOfMonths?: number
  defaultMonth?: Date
  fromDate?: Date
  toDate?: Date
  fixedWeeks?: boolean
  month?: Date
  onMonthChange?: (month: Date) => void
  autoFocus?: boolean
  focusDate?: Date
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

const navBtn =
  'inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card p-0 transition-colors'
const navBtnEnabled =
  'opacity-80 hover:opacity-100 hover:bg-surface focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
const navBtnDisabled = 'opacity-40 cursor-not-allowed'

const dayBase =
  'flex h-7 w-7 items-center justify-center rounded-md text-xs font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

export const Calendar: Component<CalendarProps> = (props) => {
  const [local, others] = splitProps(props, [
    'selected',
    'onSelect',
    'mode',
    'disabled',
    'class',
    'showOutsideDays',
    'numberOfMonths',
    'defaultMonth',
    'fromDate',
    'toDate',
    'fixedWeeks',
    'month',
    'onMonthChange',
    'autoFocus',
    'focusDate',
    'ref',
  ])

  let containerRef: HTMLDivElement | undefined

  const [currentMonth, setCurrentMonth] = createSignal<Date>((() => {
    const base =
      local.defaultMonth ||
      (Array.isArray(local.selected) && local.selected.length > 0
        ? local.selected[0]
        : !Array.isArray(local.selected) && local.selected
          ? local.selected
          : undefined)

    if (base) return new Date(base.getFullYear(), base.getMonth(), 1)
    return startOfMonth(new Date())
  })())

  createEffect(() => {
    if (!local.month) return
    const normalized = startOfMonth(local.month)
    if (!isSameMonth(normalized, currentMonth())) setCurrentMonth(normalized)
  })

  const updateMonth = (next: Date) => {
    const normalized = startOfMonth(next)
    setCurrentMonth(normalized)
    local.onMonthChange?.(normalized)
  }

  onMount(() => {
    if (!local.autoFocus || !containerRef) return

    const target = local.focusDate || (Array.isArray(local.selected) ? local.selected[0] : local.selected) || new Date()
    const key = toDateKey(target)
    const el = containerRef.querySelector<HTMLButtonElement>(`button[data-date='${key}']`)
    if (el) return void el.focus()

    const todayEl = containerRef.querySelector<HTMLButtonElement>('button[data-today="true"]')
    if (todayEl) return void todayEl.focus()

    containerRef.querySelector<HTMLButtonElement>('button[data-date]')?.focus()
  })

  const handlePreviousMonth = () => updateMonth(addMonths(currentMonth(), -1))
  const handleNextMonth = () => updateMonth(addMonths(currentMonth(), 1))

  const handleDateSelect = (date: Date) => {
    if (local.disabled?.(date)) return
    if (!local.onSelect) return

    const mode = local.mode ?? 'single'

    if (mode === 'single') {
      local.onSelect(date)
      return
    }

    if (mode === 'multiple') {
      const arr = Array.isArray(local.selected) ? local.selected : []
      const exists = arr.some(d => isSameDay(d, date))
      local.onSelect(exists ? arr.filter(d => !isSameDay(d, date)) : [...arr, date])
      return
    }

    // range
    const arr = Array.isArray(local.selected) ? local.selected : []
    if (arr.length === 0) local.onSelect([date])
    else if (arr.length === 1) {
      const start = arr[0]
      if (start) {
        local.onSelect(date < start ? [date, start] : [start, date])
      } else {
        local.onSelect([date])
      }
    } else local.onSelect([date])
  }

  const isDateSelected = (date: Date): boolean => {
    if (!local.selected) return false
    return Array.isArray(local.selected)
      ? local.selected.some(d => isSameDay(d, date))
      : isSameDay(local.selected, date)
  }

  const getRangeSorted = (): [Date, Date] | null => {
    const mode = local.mode ?? 'single'
    if (mode !== 'range' || !Array.isArray(local.selected) || local.selected.length !== 2) return null
    const a = local.selected[0]
    const b = local.selected[1]
    if (!a || !b) return null
    return a.getTime() <= b.getTime() ? [a, b] : [b, a]
  }

  const isDateInRange = (date: Date): boolean => {
    const range = getRangeSorted()
    if (!range) return false
    const [start, end] = range
    return date >= start && date <= end
  }

  const isDateRangeStart = (date: Date): boolean => {
    const range = getRangeSorted()
    if (!range) return false
    const [start] = range
    return isSameDay(date, start)
  }

  const isDateRangeEnd = (date: Date): boolean => {
    const range = getRangeSorted()
    if (!range) return false
    const [, end] = range
    return isSameDay(date, end)
  }

  const renderMonth = (monthDate: Date, monthIndex: number) => {
    const daysInMonth = getDaysInMonth(monthDate)
    const firstDay = getFirstDayOfMonth(monthDate)
    const days: (Date | null)[] = []

    const showOutside = local.showOutsideDays ?? true

    // leading days
    if (showOutside && firstDay > 0) {
      const prev = addMonths(monthDate, -1)
      const prevDays = getDaysInMonth(prev)
      for (let i = firstDay - 1; i >= 0; i--) {
        days.push(new Date(prev.getFullYear(), prev.getMonth(), prevDays - i))
      }
    } else {
      for (let i = 0; i < firstDay; i++) days.push(null)
    }

    // month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d))
    }

    // trailing
    const fixedWeeks = local.fixedWeeks ?? false
    const totalCells = fixedWeeks ? 42 : Math.ceil(days.length / 7) * 7
    const remaining = totalCells - days.length

    if (showOutside && remaining > 0) {
      const next = addMonths(monthDate, 1)
      for (let d = 1; d <= remaining; d++) {
        days.push(new Date(next.getFullYear(), next.getMonth(), d))
      }
    } else {
      for (let i = 0; i < remaining; i++) days.push(null)
    }

    const weeks: (Date | null)[][] = []
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

    const prevMonthStart = startOfMonth(addMonths(currentMonth(), -1))
    const nextMonthStart = startOfMonth(addMonths(currentMonth(), 1))

    const fromMonthStart = local.fromDate ? startOfMonth(local.fromDate) : undefined
    const toMonthStart = local.toDate ? startOfMonth(local.toDate) : undefined

    const prevDisabled = !!(fromMonthStart && prevMonthStart < fromMonthStart)
    const nextDisabled = !!(toMonthStart && nextMonthStart > toMonthStart)

    const numberOfMonths = local.numberOfMonths ?? 1

    return (
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <Show when={monthIndex === 0} fallback={<div class="h-7 w-7" />}>
            <button
              type="button"
              onClick={handlePreviousMonth}
              class={cn(navBtn, prevDisabled ? navBtnDisabled : navBtnEnabled)}
              disabled={prevDisabled}
            >
              <ChevronLeft class="h-4 w-4" />
              <span class="sr-only">Previous month</span>
            </button>
          </Show>

          <div class="text-sm font-medium text-foreground">
            {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
          </div>

          <Show when={monthIndex === numberOfMonths - 1} fallback={<div class="h-7 w-7" />}>
            <button
              type="button"
              onClick={handleNextMonth}
              class={cn(navBtn, nextDisabled ? navBtnDisabled : navBtnEnabled)}
              disabled={nextDisabled}
            >
              <ChevronRight class="h-4 w-4" />
              <span class="sr-only">Next month</span>
            </button>
          </Show>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <For each={dayNames}>
            {(d) => (
              <div class="flex h-7 w-7 items-center justify-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            )}
          </For>

          <For each={weeks}>
            {(week) => (
              <For each={week}>
                {(date) => {
                  if (!date)
                    return <div class="h-7 w-7" />

                  const isCurrent = date.getMonth() === monthDate.getMonth()
                  const selectedDay = isDateSelected(date)
                  const inRange = isDateInRange(date)
                  const rangeStart = isDateRangeStart(date)
                  const rangeEnd = isDateRangeEnd(date)
                  const today = isToday(date)

                  const blocked =
                    !!local.disabled?.(date) ||
                    !!(local.fromDate && date < local.fromDate) ||
                    !!(local.toDate && date > local.toDate)

                  const outside = !isCurrent

                  const selectedCls = 'bg-[color:var(--primary)] text-primary-foreground hover:opacity-90'
                  const rangeCls = 'bg-[color-mix(in_oklab,var(--primary)_16%,transparent)]'
                  const todayCls = 'bg-surface font-semibold'
                  const outsideCls = 'text-muted-foreground'
                  const enabledHover = 'hover:bg-surface'
                  const disabledCls = 'opacity-50 cursor-not-allowed hover:bg-transparent'

                  return (
                    <button
                      type="button"
                      onClick={() => handleDateSelect(date)}
                      disabled={blocked}
                      class={cn(
                        dayBase,
                        enabledHover,
                        outside ? outsideCls : 'text-foreground',
                        today && todayCls,
                        inRange && !selectedDay && rangeCls,
                        (rangeStart || rangeEnd) && selectedCls,
                        selectedDay && selectedCls,
                        blocked && disabledCls
                      )}
                      data-date={toDateKey(date)}
                      data-today={today ? 'true' : undefined}
                      aria-selected={selectedDay}
                    >
                      {date.getDate()}
                    </button>
                  )
                }}
              </For>
            )}
          </For>
        </div>
      </div>
    )
  }

  const numberOfMonths = () => local.numberOfMonths ?? 1

  return (
    <div
      ref={(el) => {
        containerRef = el
        if (typeof local.ref === 'function') local.ref(el)
        else if (local.ref) (local.ref as any) = el
      }}
      class={cn('p-3', local.class)}
      {...others}
    >
      <div class={cn('grid gap-4', numberOfMonths() === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
        <For each={Array.from({ length: numberOfMonths() }, (_, i) => i)}>
          {(i) => renderMonth(addMonths(currentMonth(), i), i)}
        </For>
      </div>
    </div>
  )
}
