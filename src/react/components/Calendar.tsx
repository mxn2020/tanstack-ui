// packages/ui/src/components/Calendar.tsx

import { useState, useCallback, forwardRef, useEffect, useRef, memo } from 'react'
import { cn } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  className?: string
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
}

const navBtn =
  'inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card p-0 transition-colors'
const navBtnEnabled =
  'opacity-80 hover:opacity-100 hover:bg-surface focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
const navBtnDisabled = 'opacity-40 cursor-not-allowed'

const dayBase =
  'flex h-7 w-7 items-center justify-center rounded-md text-xs font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

export const Calendar = memo(
  forwardRef<HTMLDivElement, CalendarProps>(
    (
      {
        selected,
        onSelect,
        mode = 'single',
        disabled,
        className,
        showOutsideDays = true,
        numberOfMonths = 1,
        defaultMonth,
        fromDate,
        toDate,
        fixedWeeks = false,
        month,
        onMonthChange,
        autoFocus = false,
        focusDate,
      },
      ref
    ) => {
      const containerRef = useRef<HTMLDivElement | null>(null)

      const [currentMonth, setCurrentMonth] = useState<Date>(() => {
        const base =
          defaultMonth ||
          (Array.isArray(selected) && selected.length > 0 ? selected[0] : (!Array.isArray(selected) && selected) || undefined)

        if (base) return new Date(base.getFullYear(), base.getMonth(), 1)
        return startOfMonth(new Date())
      })

      useEffect(() => {
        if (!month) return
        const normalized = startOfMonth(month)
        if (!isSameMonth(normalized, currentMonth)) setCurrentMonth(normalized)
      }, [month, currentMonth])

      const updateMonth = useCallback(
        (next: Date) => {
          const normalized = startOfMonth(next)
          setCurrentMonth(normalized)
          onMonthChange?.(normalized)
        },
        [onMonthChange]
      )

      useEffect(() => {
        if (!autoFocus || !containerRef.current) return

        const target = focusDate || (Array.isArray(selected) ? selected[0] : selected) || new Date()
        const key = toDateKey(target)
        const el = containerRef.current.querySelector<HTMLButtonElement>(`button[data-date='${key}']`)
        if (el) return void el.focus()

        const todayEl = containerRef.current.querySelector<HTMLButtonElement>('button[data-today=`true`]')
        if (todayEl) return void todayEl.focus()

        containerRef.current.querySelector<HTMLButtonElement>('button[data-date]')?.focus()
      }, [autoFocus, focusDate, selected, currentMonth])

      const handlePreviousMonth = useCallback(() => updateMonth(addMonths(currentMonth, -1)), [currentMonth, updateMonth])
      const handleNextMonth = useCallback(() => updateMonth(addMonths(currentMonth, 1)), [currentMonth, updateMonth])

      const handleDateSelect = useCallback(
        (date: Date) => {
          if (disabled?.(date)) return
          if (!onSelect) return

          if (mode === 'single') {
            onSelect(date)
            return
          }

          if (mode === 'multiple') {
            const arr = Array.isArray(selected) ? selected : []
            const exists = arr.some(d => isSameDay(d, date))
            onSelect(exists ? arr.filter(d => !isSameDay(d, date)) : [...arr, date])
            return
          }

          // range
          const arr = Array.isArray(selected) ? selected : []
          if (arr.length === 0) onSelect([date])
          else if (arr.length === 1) {
            const start = arr[0]
            if (start) {
              onSelect(date < start ? [date, start] : [start, date])
            } else {
              onSelect([date])
            }
          } else onSelect([date])
        },
        [disabled, onSelect, mode, selected]
      )

      const isDateSelected = useCallback(
        (date: Date): boolean => {
          if (!selected) return false
          return Array.isArray(selected) ? selected.some(d => isSameDay(d, date)) : isSameDay(selected, date)
        },
        [selected]
      )

      const getRangeSorted = useCallback((): [Date, Date] | null => {
        if (mode !== 'range' || !Array.isArray(selected) || selected.length !== 2) return null
        const a = selected[0]
        const b = selected[1]
        if (!a || !b) return null
        return a.getTime() <= b.getTime() ? [a, b] : [b, a]
      }, [mode, selected])

      const isDateInRange = useCallback(
        (date: Date): boolean => {
          const range = getRangeSorted()
          if (!range) return false
          const [start, end] = range
          return date >= start && date <= end
        },
        [getRangeSorted]
      )

      const isDateRangeStart = useCallback(
        (date: Date): boolean => {
          const range = getRangeSorted()
          if (!range) return false
          const [start] = range
          return isSameDay(date, start)
        },
        [getRangeSorted]
      )

      const isDateRangeEnd = useCallback(
        (date: Date): boolean => {
          const range = getRangeSorted()
          if (!range) return false
          const [, end] = range
          return isSameDay(date, end)
        },
        [getRangeSorted]
      )

      const renderMonth = (monthDate: Date, monthIndex: number) => {
        const daysInMonth = getDaysInMonth(monthDate)
        const firstDay = getFirstDayOfMonth(monthDate)
        const days: (Date | null)[] = []

        // leading days
        if (showOutsideDays && firstDay > 0) {
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
        const totalCells = fixedWeeks ? 42 : Math.ceil(days.length / 7) * 7
        const remaining = totalCells - days.length

        if (showOutsideDays && remaining > 0) {
          const next = addMonths(monthDate, 1)
          for (let d = 1; d <= remaining; d++) {
            days.push(new Date(next.getFullYear(), next.getMonth(), d))
          }
        } else {
          for (let i = 0; i < remaining; i++) days.push(null)
        }

        const weeks: (Date | null)[][] = []
        for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

        // Compare month starts against month starts for stable nav disabling
        const prevMonthStart = startOfMonth(addMonths(currentMonth, -1))
        const nextMonthStart = startOfMonth(addMonths(currentMonth, 1))

        const fromMonthStart = fromDate ? startOfMonth(fromDate) : undefined
        const toMonthStart = toDate ? startOfMonth(toDate) : undefined

        const prevDisabled = !!(fromMonthStart && prevMonthStart < fromMonthStart)
        const nextDisabled = !!(toMonthStart && nextMonthStart > toMonthStart)

        return (
          <div key={monthIndex} className='space-y-4'>
            <div className='flex items-center justify-between'>
              {monthIndex === 0 ? (
                <button
                  type='button'
                  onClick={handlePreviousMonth}
                  className={cn(navBtn, prevDisabled ? navBtnDisabled : navBtnEnabled)}
                  disabled={prevDisabled}
                >
                  <ChevronLeft className='h-4 w-4' />
                  <span className='sr-only'>Previous month</span>
                </button>
              ) : (
                <div className='h-7 w-7' />
              )}

              <div className='text-sm font-medium text-foreground'>
                {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
              </div>

              {monthIndex === numberOfMonths - 1 ? (
                <button
                  type='button'
                  onClick={handleNextMonth}
                  className={cn(navBtn, nextDisabled ? navBtnDisabled : navBtnEnabled)}
                  disabled={nextDisabled}
                >
                  <ChevronRight className='h-4 w-4' />
                  <span className='sr-only'>Next month</span>
                </button>
              ) : (
                <div className='h-7 w-7' />
              )}
            </div>

            <div className='grid grid-cols-7 gap-1'>
              {dayNames.map(d => (
                <div key={d} className='flex h-7 w-7 items-center justify-center text-xs font-medium text-muted-foreground'>
                  {d}
                </div>
              ))}

              {weeks.map((week, wi) =>
                week.map((date, di) => {
                  if (!date) return <div key={`${wi}-${di}`} className='h-7 w-7' />

                  const isCurrent = date.getMonth() === monthDate.getMonth()
                  const selectedDay = isDateSelected(date)
                  const inRange = isDateInRange(date)
                  const rangeStart = isDateRangeStart(date)
                  const rangeEnd = isDateRangeEnd(date)
                  const today = isToday(date)

                  const blocked =
                    !!disabled?.(date) ||
                    !!(fromDate && date < fromDate) ||
                    !!(toDate && date > toDate)

                  const outside = !isCurrent

                  const selectedCls =
                    'bg-[color:var(--primary)] text-primary-foreground hover:opacity-90'
                  const rangeCls =
                    'bg-[color-mix(in_oklab,var(--primary)_16%,transparent)]'
                  const todayCls =
                    'bg-surface font-semibold'
                  const outsideCls =
                    'text-muted-foreground'
                  const enabledHover =
                    'hover:bg-surface'
                  const disabledCls =
                    'opacity-50 cursor-not-allowed hover:bg-transparent'

                  return (
                    <button
                      key={`${wi}-${di}`}
                      type='button'
                      onClick={() => handleDateSelect(date)}
                      disabled={blocked}
                      className={cn(
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
                })
              )}
            </div>
          </div>
        )
      }

      return (
        <div
          ref={(node) => {
            containerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) (ref as { current: HTMLDivElement | null }).current = node
          }}
          className={cn('p-3', className)}
        >
          <div className={cn('grid gap-4', numberOfMonths === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
            {Array.from({ length: numberOfMonths }, (_, i) => renderMonth(addMonths(currentMonth, i), i))}
          </div>
        </div>
      )
    }
  )
)

Calendar.displayName = 'Calendar'
