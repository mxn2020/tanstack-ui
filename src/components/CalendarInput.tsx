// packages/ui/src/components/CalendarInput.tsx

import {
  useMemo,
  useState,
  useCallback,
  useId,
  useEffect,
  forwardRef,
  useRef,
} from 'react'
import type { ElementRef } from 'react'
import { cn } from '../lib/utils'
import {
  CalendarClock,
  CalendarDays,
  Clock,
  Keyboard,
  Zap,
  X,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './Popover'
import { Calendar } from './Calendar'
import type { FormComponentProps, InputSize } from '../lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select'

type PickerMode = 'date' | 'time' | 'datetime'

export interface CalendarValueWithTimezone {
  timestamp?: number
  timezone: string
  offsetMinutes: number
  offsetString: string
  isoStringWithOffset?: string
}

interface CalendarInputProps extends Omit<FormComponentProps, 'disabled'> {
  mode?: PickerMode
  value?: CalendarValueWithTimezone
  onChange?: (value: CalendarValueWithTimezone | undefined) => void
  label?: string
  required?: boolean
  placeholder?: string
  size?: InputSize
  className?: string
  id?: string
  disabled?: boolean | ((date: Date) => boolean)
  min?: Date
  max?: Date
  defaultMonth?: Date
  clearable?: boolean
  format24Hour?: boolean
  onFormat24HourChange?: (format24Hour: boolean) => void
  timeStepMinutes?: number
  showQuickSelections?: boolean
  showTips?: boolean
  timezoneSelector?: boolean
  timezoneOptions?: { label: string; value: string; offsetMinutes?: number; offsetString?: string }[]
  displayTimezone?: string
  defaultTimezone?: string
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-9',
  md: 'px-3 py-2 text-sm h-10',
  lg: 'px-4 py-3 text-base h-12',
}

const pad = (n: number): string => n.toString().padStart(2, '0')

export const formatDate = (date: Date): string => {
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`
}

export const formatTime = (date: Date, format24Hour: boolean): string => {
  const minutes = pad(date.getMinutes())
  if (format24Hour) return `${pad(date.getHours())}:${minutes}`
  const hours = date.getHours()
  const displayHours = hours % 12 || 12
  const suffix = hours >= 12 ? 'PM' : 'AM'
  return `${displayHours}:${minutes} ${suffix}`
}

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const addMinutes = (date: Date, minutes: number): Date => {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + minutes)
  return next
}

const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const defaultUserTimezone = (): string => {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat === 'undefined') return 'UTC'
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

const MAJOR_TIMEZONES = [
  'UTC',
  'Pacific/Midway',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Caracas',
  'America/Sao_Paulo',
  'America/St_Johns',
  'Atlantic/Azores',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Athens',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Adelaide',
  'Australia/Sydney',
  'Pacific/Noumea',
  'Pacific/Auckland',
  'Pacific/Chatham',
  'Pacific/Kiritimati',
]

const getSupportedTimezones = (): string[] => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sup = (Intl as any).supportedValuesOf?.('timeZone')
    if (Array.isArray(sup) && sup.length) {
      const set = new Set(MAJOR_TIMEZONES)
      const filtered = (sup as string[]).filter(tz => set.has(tz))
      const missing = MAJOR_TIMEZONES.filter(tz => !filtered.includes(tz))
      return filtered.concat(missing)
    }
  } catch {
    // ignore
  }
  return MAJOR_TIMEZONES
}

const toOffsetString = (minutes: number): string => {
  const sign = minutes >= 0 ? '+' : '-'
  const abs = Math.abs(minutes)
  const hh = Math.floor(abs / 60).toString().padStart(2, '0')
  const mm = (abs % 60).toString().padStart(2, '0')
  return `${sign}${hh}:${mm}`
}

const getOffsetMinutes = (date: Date, timeZone: string): number => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = dtf.formatToParts(date)
  const map: Record<string, number> = {}
  for (const { type, value } of parts) {
    if (type === 'literal') continue
    map[type] = parseInt(value, 10)
  }

  const asUTC = Date.UTC(
    map.year || 1970,
    (map.month || 1) - 1,
    map.day || 1,
    map.hour || 0,
    map.minute || 0,
    map.second || 0
  )

  return Math.round((asUTC - date.getTime()) / 60000)
}

const buildDateFromParts = (
  parts: { year: number; month: number; day: number; hour: number; minute: number },
  timeZone: string
): CalendarValueWithTimezone => {
  const localMs = Date.UTC(parts.year, parts.month, parts.day, parts.hour, parts.minute, 0, 0)
  const dateForOffset = new Date(localMs)
  const offsetMinutes = getOffsetMinutes(dateForOffset, timeZone)
  const offsetString = toOffsetString(offsetMinutes)
  const timestamp = localMs - offsetMinutes * 60_000
  const isoStringWithOffset = `${parts.year.toString().padStart(4, '0')}-${pad(parts.month + 1)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:00.000${offsetString}`

  return { timestamp, timezone: timeZone, offsetMinutes, offsetString, isoStringWithOffset }
}

const getTimePartsInZone = (timestamp: number, timeZone: string, format24Hour: boolean) => {
  const date = new Date(timestamp)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !format24Hour,
  })
  const parts = formatter.formatToParts(date)
  const map: Record<string, string> = {}
  for (const { type, value } of parts) map[type] = value

  const hoursVal = parseInt(map.hour || '0', 10)
  const minutesVal = parseInt(map.minute || '0', 10)
  const meridiem = (map.dayPeriod || '').toLowerCase() === 'pm' ? 'PM' : 'AM'

  if (format24Hour) return { hours: pad(hoursVal), minutes: pad(minutesVal), meridiem: 'AM' as 'AM' | 'PM' }

  const twelveHour = hoursVal === 0 ? 12 : hoursVal
  return { hours: twelveHour.toString(), minutes: pad(minutesVal), meridiem: meridiem as 'AM' | 'PM' }
}

const getDateInZone = (timestamp: number, timeZone: string): Date => {
  const date = new Date(timestamp)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const map: Record<string, number> = {}
  for (const { type, value } of parts) {
    if (type === 'literal') continue
    map[type] = parseInt(value, 10)
  }

  return new Date(map.year || 1970, (map.month || 1) - 1, map.day || 1, map.hour || 0, map.minute || 0, map.second || 0)
}

export const buildTimezoneOptions = (timezones?: string[]) => {
  const now = new Date()
  const zones = (timezones && timezones.length > 0) ? timezones : getSupportedTimezones()
  const seen = new Set<string>()

  const options = zones.map(z => {
    try {
      const offset = getOffsetMinutes(now, z)
      const offsetStr = toOffsetString(offset)
      return { value: z, offset, offsetStr }
    } catch {
      return null
    }
  })

  const unique = options.filter((opt): opt is { value: string; offset: number; offsetStr: string } => {
    if (!opt) return false
    if (seen.has(opt.offsetStr)) return false
    seen.add(opt.offsetStr)
    return true
  })

  unique.sort((a, b) => a.offset - b.offset || a.value.localeCompare(b.value))

  return unique.map(opt => ({
    label: `${opt.value} (UTC${opt.offsetStr})`,
    value: opt.value,
    offsetMinutes: opt.offset,
    offsetString: opt.offsetStr,
  }))
}

const formatDisplayFromParts = (
  date: Date,
  parts: { hours: string; minutes: string; meridiem: 'AM' | 'PM' },
  mode: PickerMode,
  format24Hour: boolean
) => {
  const dateStr = formatDate(date)
  if (mode === 'date') return dateStr

  let timeStr: string
  if (format24Hour) timeStr = `${parts.hours}:${parts.minutes}`
  else timeStr = `${parts.hours.padStart(2, '0')}:${parts.minutes} ${parts.meridiem}`

  return mode === 'time' ? timeStr : `${dateStr} ${timeStr}`
}

const parseDateInput = (value: string): Date | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const slashParts = trimmed.split(/[/-]/)
  if (slashParts.length === 3) {
    const [mm, dd, yyyy] = slashParts
    const month = parseInt(mm || '0', 10) - 1
    const day = parseInt(dd || '0', 10)
    const year = parseInt(yyyy || '0', 10)
    const parsed = new Date(year, month, day)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(trimmed)
  return isNaN(parsed.getTime()) ? null : parsed
}

const parseTimeInput = (value: string, format24Hour: boolean): { hours: number; minutes: number } | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const compact = trimmed.replace(/[\s:]/g, '')
  const compactMatch = compact.match(/^(\d{3,4})(am|pm)?$/i)
  if (compactMatch) {
    const [, numeric, meridiem] = compactMatch
    const minutes = parseInt((numeric || '').slice(-2), 10)
    let hours = parseInt((numeric || '').slice(0, -2), 10)

    if (!format24Hour) {
      if (hours === 12) hours = meridiem?.toLowerCase() === 'am' ? 0 : 12
      else if (meridiem?.toLowerCase() === 'pm') hours += 12
    }

    if (hours > 23 || minutes > 59) return null
    return { hours, minutes }
  }

  const match = trimmed.match(/^(\d{1,2})(?::?(\d{2}))?\s*(am|pm)?$/i)
  if (!match) return null

  const [, rawHours, rawMinutes, meridiem] = match
  let hours = parseInt(rawHours ?? '0', 10)
  const minutes = parseInt(rawMinutes ?? '0', 10)

  if (!format24Hour) {
    if (hours === 12) hours = meridiem?.toLowerCase() === 'am' ? 0 : 12
    else if (meridiem?.toLowerCase() === 'pm') hours += 12
  }

  if (hours > 23 || minutes > 59) return null

  return { hours, minutes }
}

const parseDateTimeInput = (value: string, format24Hour: boolean): Date | null => {
  const trimmed = value.trim()
  if (!trimmed) return null

  const parts = trimmed.split(/\s+/)
  const datePart = parts.shift()
  const timePart = parts.join(' ').trim()

  const parsedDate = datePart ? parseDateInput(datePart) : null

  if (timePart) {
    const parsedTime = parseTimeInput(timePart, format24Hour)
    if (parsedDate && parsedTime) {
      const combined = new Date(parsedDate)
      combined.setHours(parsedTime.hours, parsedTime.minutes, 0, 0)
      return combined
    }
  }

  const fallback = new Date(trimmed)
  return isNaN(fallback.getTime()) ? parsedDate : fallback
}

export const CalendarInput = forwardRef<ElementRef<'input'>, CalendarInputProps>((props, ref) => {
  const {
    mode = 'datetime',
    value,
    onChange,
    label,
    placeholder,
    required = false,
    size = 'md',
    className,
    id,
    disabled,
    error,
    helpText,
    min,
    max,
    defaultMonth,
    clearable = true,
    format24Hour = false,
    onFormat24HourChange,
    timeStepMinutes = 15,
    showQuickSelections = true,
    showTips = true,
    timezoneSelector = false,
    timezoneOptions,
    displayTimezone,
    defaultTimezone,
  } = props

  const generatedId = useId()
  const inputId = id || generatedId
  const componentDisabled = typeof disabled === 'boolean' ? disabled : false
  const [open, setOpen] = useState(false)
  const [activePane, setActivePane] = useState<'date' | 'time'>(() => (mode === 'time' ? 'time' : 'date'))

  const resolvedDefaultTimezone = defaultTimezone || defaultUserTimezone()
  const activeDisplayTimezone = displayTimezone || value?.timezone || resolvedDefaultTimezone

  const [cursorDate, setCursorDate] = useState<Date>(() => {
    if (value?.timestamp) return getDateInZone(value.timestamp, activeDisplayTimezone)
    return defaultMonth || new Date()
  })

  const [activeTimezone, setActiveTimezone] = useState<string>(activeDisplayTimezone)

  const toTimeParts = useCallback(
    (timestamp: number, tz: string) => getTimePartsInZone(timestamp, tz, format24Hour),
    [format24Hour]
  )

  const [timeParts, setTimeParts] = useState(() => {
    if (value?.timestamp) return toTimeParts(value.timestamp, activeDisplayTimezone)
    return { hours: format24Hour ? '12' : '12', minutes: '00', meridiem: 'PM' as 'AM' | 'PM' }
  })

  const [inputValue, setInputValue] = useState<string>(() => {
    if (!value?.timestamp) return ''
    const parts = getTimePartsInZone(value.timestamp, activeDisplayTimezone, format24Hour)
    const displayDate = getDateInZone(value.timestamp, activeDisplayTimezone)
    return formatDisplayFromParts(displayDate, parts, mode, format24Hour)
  })

  const hourInputRef = useRef<HTMLInputElement>(null)

  const timezoneChoices = useMemo(() => {
    if (timezoneOptions && timezoneOptions.length > 0) {
      const now = new Date()
      const seen = new Set<string>()
      const enriched = timezoneOptions
        .map(opt => {
          try {
            const offsetMinutes = typeof opt.offsetMinutes === 'number' ? opt.offsetMinutes : getOffsetMinutes(now, opt.value)
            const offsetString = opt.offsetString ?? toOffsetString(offsetMinutes)
            return { value: opt.value, label: opt.label ?? opt.value, offset: offsetMinutes, offsetString }
          } catch {
            return null
          }
        })
        .filter((opt): opt is { value: string; label: string; offset: number; offsetString: string } => {
          if (!opt) return false
          if (seen.has(opt.offsetString)) return false
          seen.add(opt.offsetString)
          return true
        })
        .sort((a, b) => a.offset - b.offset || a.value.localeCompare(b.value))

      return enriched.map(opt => ({
        value: opt.value,
        label: `${opt.label} (UTC${opt.offsetString})`,
      }))
    }

    return buildTimezoneOptions()
  }, [timezoneOptions])

  // Keep state in sync when external value or display timezone changes
  useEffect(() => {
    if (value?.timestamp) {
      const tz = displayTimezone || value.timezone || resolvedDefaultTimezone
      const displayDate = getDateInZone(value.timestamp, tz)
      const parts = getTimePartsInZone(value.timestamp, tz, format24Hour)

      setCursorDate(displayDate)
      setTimeParts(parts)
      setInputValue(formatDisplayFromParts(displayDate, parts, mode, format24Hour))
      setActiveTimezone(tz)
    } else {
      setInputValue('')
      setActiveTimezone(displayTimezone || resolvedDefaultTimezone)

      // reset time parts predictably (keep current clock in that tz)
      const now = Date.now()
      setTimeParts(getTimePartsInZone(now, displayTimezone || resolvedDefaultTimezone, format24Hour))
    }
  }, [value, displayTimezone, mode, format24Hour, resolvedDefaultTimezone])

  const blockDate = useCallback(
    (date: Date): boolean => {
      if (typeof disabled === 'function' && disabled(date)) return true
      if (min && date.getTime() < min.getTime()) return true
      if (max && date.getTime() > max.getTime()) return true
      return false
    },
    [disabled, min, max]
  )

  const mergeWithTime = useCallback(
    (base: Date, tz: string): CalendarValueWithTimezone => {
      const hoursInt = parseInt(timeParts.hours, 10)
      const minutesInt = parseInt(timeParts.minutes, 10) || 0

      let resolvedHours: number
      if (format24Hour) {
        resolvedHours = Math.min(23, Math.max(0, isNaN(hoursInt) ? 0 : hoursInt))
      } else {
        let hours = isNaN(hoursInt) ? 12 : hoursInt
        if (timeParts.meridiem === 'PM' && hours !== 12) hours += 12
        if (timeParts.meridiem === 'AM' && hours === 12) hours = 0
        resolvedHours = hours
      }

      const resolvedMinutes = Math.min(59, Math.max(0, minutesInt))

      return buildDateFromParts(
        {
          year: base.getFullYear(),
          month: base.getMonth(),
          day: base.getDate(),
          hour: resolvedHours,
          minute: resolvedMinutes,
        },
        tz
      )
    },
    [timeParts, format24Hour]
  )

  const emitValue = useCallback(
    (payload?: CalendarValueWithTimezone, nextCursor?: Date, nextParts?: { hours: string; minutes: string; meridiem: 'AM' | 'PM' }) => {
      if (payload?.timestamp) {
        const checkDate = new Date(payload.timestamp)
        if (blockDate(checkDate)) return
      }

      onChange?.(payload)

      if (payload?.timestamp) {
        const displayDate = getDateInZone(payload.timestamp, activeTimezone)
        const parts = nextParts || getTimePartsInZone(payload.timestamp, activeTimezone, format24Hour)

        setCursorDate(nextCursor || displayDate)
        setTimeParts(parts)
        setInputValue(formatDisplayFromParts(nextCursor || displayDate, parts, mode, format24Hour))
      } else {
        setInputValue('')
      }
    },
    [activeTimezone, blockDate, format24Hour, mode, onChange]
  )

  const handleTimezoneChange = useCallback((tz: string) => {
    setActiveTimezone(tz)
  }, [])

  useEffect(() => {
    if (!timezoneSelector) return
    if (!timezoneChoices.some(opt => opt.value === activeTimezone) && timezoneChoices[0]) {
      setActiveTimezone(timezoneChoices[0].value)
    }
  }, [activeTimezone, timezoneChoices, timezoneSelector])

  const handleCalendarSelect = useCallback(
    (selected: Date | Date[] | undefined) => {
      if (!(selected instanceof Date)) return
      const payload =
        mode === 'date'
          ? buildDateFromParts(
              { year: selected.getFullYear(), month: selected.getMonth(), day: selected.getDate(), hour: 0, minute: 0 },
              activeTimezone
            )
          : mergeWithTime(selected, activeTimezone)

      emitValue(payload, selected)

      if (mode !== 'datetime') setOpen(false)
    },
    [activeTimezone, emitValue, mergeWithTime, mode]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const parseAndCommit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) {
        emitValue(undefined)
        return
      }

      let payload: CalendarValueWithTimezone | null = null
      let nextCursor: Date | undefined
      let nextParts: { hours: string; minutes: string; meridiem: 'AM' | 'PM' } | undefined

      if (mode === 'date') {
        const parsed = parseDateInput(trimmed)
        if (parsed) {
          nextCursor = parsed
          payload = buildDateFromParts(
            { year: parsed.getFullYear(), month: parsed.getMonth(), day: parsed.getDate(), hour: 0, minute: 0 },
            activeTimezone
          )
          nextParts = getTimePartsInZone(payload.timestamp!, activeTimezone, format24Hour)
        }
      } else if (mode === 'time') {
        const parsedTime = parseTimeInput(trimmed, format24Hour)
        if (parsedTime) {
          const base = value?.timestamp ? getDateInZone(value.timestamp, activeTimezone) : new Date()
          nextCursor = new Date(base)
          payload = buildDateFromParts(
            { year: base.getFullYear(), month: base.getMonth(), day: base.getDate(), hour: parsedTime.hours, minute: parsedTime.minutes },
            activeTimezone
          )
          nextParts = getTimePartsInZone(payload.timestamp!, activeTimezone, format24Hour)
        }
      } else {
        const parsed = parseDateTimeInput(trimmed, format24Hour)
        if (parsed) {
          nextCursor = parsed
          payload = buildDateFromParts(
            { year: parsed.getFullYear(), month: parsed.getMonth(), day: parsed.getDate(), hour: parsed.getHours(), minute: parsed.getMinutes() },
            activeTimezone
          )
          nextParts = getTimePartsInZone(payload.timestamp!, activeTimezone, format24Hour)
        }
      }

      if (payload?.timestamp && !blockDate(new Date(payload.timestamp))) {
        emitValue(payload, nextCursor, nextParts)
        return
      }

      // revert display if invalid
      if (value?.timestamp) {
        const displayDate = getDateInZone(value.timestamp, activeTimezone)
        const parts = getTimePartsInZone(value.timestamp, activeTimezone, format24Hour)
        setInputValue(formatDisplayFromParts(displayDate, parts, mode, format24Hour))
      } else {
        setInputValue('')
      }
    },
    [activeTimezone, blockDate, emitValue, format24Hour, mode, value]
  )

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        parseAndCommit(inputValue)
        setOpen(false)
      }
    },
    [inputValue, parseAndCommit]
  )

  const adjustTime = useCallback(
    (minutesDelta: number) => {
      const baseTimestamp = value?.timestamp || Date.now()
      const baseDate = getDateInZone(baseTimestamp, activeTimezone)
      const next = addMinutes(baseDate, minutesDelta)
      const payload = buildDateFromParts(
        { year: next.getFullYear(), month: next.getMonth(), day: next.getDate(), hour: next.getHours(), minute: next.getMinutes() },
        activeTimezone
      )
      emitValue(payload, next)
    },
    [activeTimezone, emitValue, value]
  )

  const applyTemplateTime = useCallback(
    (template: Date) => {
      const nextCursor = new Date(cursorDate)
      nextCursor.setHours(template.getHours(), template.getMinutes(), 0, 0)

      const payload = buildDateFromParts(
        { year: nextCursor.getFullYear(), month: nextCursor.getMonth(), day: nextCursor.getDate(), hour: template.getHours(), minute: template.getMinutes() },
        activeTimezone
      )

      const parts = getTimePartsInZone(payload.timestamp!, activeTimezone, format24Hour)
      emitValue(payload, nextCursor, parts)
    },
    [activeTimezone, cursorDate, emitValue, format24Hour]
  )

  useEffect(() => {
    if (open && activePane === 'time') {
      requestAnimationFrame(() => {
        hourInputRef.current?.focus()
        hourInputRef.current?.select()
      })
    }
  }, [open, activePane])

  const handleTimePartChange = useCallback(
    (field: 'hours' | 'minutes') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const onlyDigits = e.target.value.replace(/\D/g, '')
      setTimeParts(prev => ({ ...prev, [field]: onlyDigits.slice(0, 2) }))
    },
    []
  )

  const normalizeTimeInput = useCallback(
    (_field: 'hours' | 'minutes') => () => {
      const base = value?.timestamp ? getDateInZone(value.timestamp, activeTimezone) : cursorDate

      const hoursInt = parseInt(timeParts.hours, 10)
      const minutesInt = parseInt(timeParts.minutes, 10)

      let hours = isNaN(hoursInt) ? (format24Hour ? 0 : 12) : hoursInt
      let minutes = isNaN(minutesInt) ? 0 : minutesInt

      if (format24Hour) hours = Math.min(23, Math.max(0, hours))
      else hours = Math.min(12, Math.max(1, hours))

      minutes = Math.min(59, Math.max(0, minutes))

      // build resolved 24h hours
      let resolvedHours = hours
      if (!format24Hour) {
        if (timeParts.meridiem === 'PM' && resolvedHours !== 12) resolvedHours += 12
        if (timeParts.meridiem === 'AM' && resolvedHours === 12) resolvedHours = 0
      }

      const payload = buildDateFromParts(
        { year: base.getFullYear(), month: base.getMonth(), day: base.getDate(), hour: resolvedHours, minute: minutes },
        activeTimezone
      )

      const nextParts = getTimePartsInZone(payload.timestamp!, activeTimezone, format24Hour)
      setTimeParts(nextParts)
      emitValue(payload, base, nextParts)
    },
    [activeTimezone, cursorDate, emitValue, format24Hour, timeParts.hours, timeParts.minutes, timeParts.meridiem, value]
  )

  const toggleTimeFormat = useCallback(() => {
    const newFormat = !format24Hour
    onFormat24HourChange?.(newFormat)

    // We only update UI parts here; value will re-sync from parent if parent controls format24Hour.
    setTimeParts(prev => {
      const hoursInt = parseInt(prev.hours, 10) || 0
      if (newFormat) {
        // 12h -> 24h
        let hours24 = hoursInt
        if (prev.meridiem === 'PM' && hoursInt !== 12) hours24 = hoursInt + 12
        if (prev.meridiem === 'AM' && hoursInt === 12) hours24 = 0
        return { ...prev, hours: pad(hours24), meridiem: 'AM' }
      } else {
        // 24h -> 12h
        const hours12 = hoursInt === 0 ? 12 : hoursInt > 12 ? hoursInt - 12 : hoursInt
        const meridiem = hoursInt >= 12 ? 'PM' : 'AM'
        return { ...prev, hours: hours12.toString(), meridiem }
      }
    })
  }, [format24Hour, onFormat24HourChange])

  const toggleMeridiem = useCallback(() => {
    if (format24Hour) return

    const base = value?.timestamp ? getDateInZone(value.timestamp, activeTimezone) : cursorDate
    const hours12 = Math.min(12, Math.max(1, parseInt(timeParts.hours, 10) || 12))
    const minutes = Math.min(59, Math.max(0, parseInt(timeParts.minutes, 10) || 0))

    const nextMeridiem = timeParts.meridiem === 'AM' ? 'PM' : 'AM'
    let resolvedHours = hours12
    if (nextMeridiem === 'AM' && hours12 === 12) resolvedHours = 0
    if (nextMeridiem === 'PM' && hours12 < 12) resolvedHours = hours12 + 12

    const payload = buildDateFromParts(
      { year: base.getFullYear(), month: base.getMonth(), day: base.getDate(), hour: resolvedHours, minute: minutes },
      activeTimezone
    )

    const parts = getTimePartsInZone(payload.timestamp!, activeTimezone, format24Hour)
    setTimeParts(parts)
    emitValue(payload, base, parts)
  }, [activeTimezone, cursorDate, emitValue, format24Hour, timeParts.hours, timeParts.meridiem, timeParts.minutes, value])

  const buildPayloadFromState = useCallback((): CalendarValueWithTimezone | undefined => {
    const base = cursorDate || new Date()
    if (mode === 'date') {
      return buildDateFromParts(
        { year: base.getFullYear(), month: base.getMonth(), day: base.getDate(), hour: 0, minute: 0 },
        activeTimezone
      )
    }

    const hoursInt = parseInt(timeParts.hours, 10)
    let hours = isNaN(hoursInt) ? 0 : hoursInt
    if (!format24Hour) {
      if (timeParts.meridiem === 'PM' && hours !== 12) hours += 12
      if (timeParts.meridiem === 'AM' && hours === 12) hours = 0
    }

    const minutes = parseInt(timeParts.minutes, 10) || 0
    return buildDateFromParts(
      { year: base.getFullYear(), month: base.getMonth(), day: base.getDate(), hour: hours, minute: minutes },
      activeTimezone
    )
  }, [activeTimezone, cursorDate, format24Hour, mode, timeParts.hours, timeParts.meridiem, timeParts.minutes])

  const quickDateOptions = useMemo(
    () => [
      { label: 'Today', date: new Date() },
      { label: 'Tomorrow', date: addDays(new Date(), 1) },
      { label: 'Next Week', date: addDays(new Date(), 7) },
      { label: 'Next Month', date: addDays(new Date(), 30) },
    ],
    []
  )

  const quickTimeOptions = useMemo(() => {
    const steps = Array.from(new Set([0, timeStepMinutes, timeStepMinutes * 2, 60, 120])).filter(n => n >= 0)
    const now = new Date()
    return steps.map(step => ({ label: step === 0 ? 'Now' : `+${step}m`, date: addMinutes(now, step) }))
  }, [timeStepMinutes])

  const showDatePane = mode !== 'time'
  const showTimePane = mode !== 'date'
  const showClear = clearable && !!inputValue && !componentDisabled

  const handleContentKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }

    if (activePane === 'date') {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' ? -7 : 7
        setCursorDate(prev => addDays(prev, delta))
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        const payload = mode === 'date'
          ? buildDateFromParts(
              { year: cursorDate.getFullYear(), month: cursorDate.getMonth(), day: cursorDate.getDate(), hour: 0, minute: 0 },
              activeTimezone
            )
          : mergeWithTime(cursorDate, activeTimezone)

        emitValue(payload, cursorDate)

        if (mode === 'datetime') setActivePane('time')
        else setOpen(false)
      }
    } else if (activePane === 'time') {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        adjustTime(timeStepMinutes)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        adjustTime(-timeStepMinutes)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        setOpen(false)
      }
    }
  }, [activePane, activeTimezone, adjustTime, cursorDate, emitValue, mergeWithTime, mode, timeStepMinutes])

  return (
    <div className='w-full'>
      {label && (
        <label
          className={cn('block text-sm font-medium text-foreground mb-1', componentDisabled && 'opacity-50')}
          htmlFor={inputId}
        >
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild toggle={false}>
          <div
            className={cn(
              'flex items-center gap-2 w-full border border-border rounded-lg bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary',
              'transition-colors',
              componentDisabled && 'opacity-60 cursor-not-allowed bg-surface',
              error && 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500',
              className
            )}
            onClick={() => !componentDisabled && setOpen(true)}
          >
            <input
              ref={ref}
              id={inputId}
              type='text'
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => !componentDisabled && setOpen(true)}
              placeholder={
                placeholder ||
                (mode === 'date'
                  ? 'MM/DD/YYYY'
                  : mode === 'time'
                    ? (format24Hour ? 'HH:MM' : 'HH:MM AM')
                    : 'MM/DD/YYYY HH:MM')
              }
              disabled={componentDisabled}
              required={required}
              className={cn(
                'flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground',
                sizeClasses[size]
              )}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
            />

            {showClear && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation()
                  emitValue(undefined)
                }}
                className='p-1 text-muted-foreground hover:text-foreground focus:outline-none'
              >
                <X className='h-4 w-4' />
                <span className='sr-only'>Clear</span>
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent
          sideOffset={8}
          className='p-0 w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border shadow-lg origin-top data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-1 data-[state=closed]:slide-out-to-top-1'
          align='start'
        >
          <div className='bg-card rounded-lg' onKeyDown={handleContentKeyDown} tabIndex={-1}>
            <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-surface'>
              <div className='flex items-center gap-2'>
                <CalendarClock className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-foreground'>Quick calendar</p>
                  {showTips && (
                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                      <Keyboard className='h-3 w-3' />
                      Arrows to move, Enter to commit{showTimePane ? ', ↑/↓ to adjust time' : ''}
                    </p>
                  )}
                </div>
              </div>

              {mode === 'datetime' && (
                <div className='flex gap-1 rounded-md bg-muted p-1'>
                  <button
                    type='button'
                    onClick={() => setActivePane('date')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      activePane === 'date' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Date
                  </button>
                  <button
                    type='button'
                    onClick={() => setActivePane('time')}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                      activePane === 'time' ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Time
                  </button>
                </div>
              )}
            </div>

            {timezoneSelector && (
              <div className='px-4 py-3 border-b border-border flex items-center gap-2 bg-card'>
                <span className='text-xs font-medium text-muted-foreground'>Timezone</span>
                <Select value={activeTimezone} onValueChange={handleTimezoneChange}>
                  <SelectTrigger className='w-72 h-9'>
                    <SelectValue placeholder='Select timezone' />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneChoices.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showDatePane && activePane === 'date' && (
              <div className='p-3'>
                <Calendar
                  mode='single'
                  selected={cursorDate}
                  onSelect={handleCalendarSelect}
                  disabled={blockDate}
                  fromDate={min}
                  toDate={max}
                  defaultMonth={cursorDate}
                  month={cursorDate}
                  onMonthChange={(next) =>
                    setCursorDate(prev => {
                      const daysInNext = getDaysInMonth(next)
                      const safeDay = Math.min(prev.getDate(), daysInNext)
                      const updated = new Date(next)
                      updated.setDate(safeDay)
                      updated.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds(), prev.getMilliseconds())
                      return updated
                    })
                  }
                  numberOfMonths={1}
                  autoFocus={open}
                  focusDate={new Date()}
                />

                {showQuickSelections && (
                  <div className='mt-3 grid grid-cols-2 gap-2'>
                    {quickDateOptions.map(option => (
                      <button
                        key={option.label}
                        type='button'
                        onClick={() => {
                          const payload =
                            mode === 'date'
                              ? buildDateFromParts(
                                  { year: option.date.getFullYear(), month: option.date.getMonth(), day: option.date.getDate(), hour: 0, minute: 0 },
                                  activeTimezone
                                )
                              : mergeWithTime(option.date, activeTimezone)

                          emitValue(payload, option.date)
                          if (mode !== 'datetime') setOpen(false)
                        }}
                        className='flex items-center justify-between px-3 py-2 text-sm border border-border rounded-md bg-surface hover:border-primary hover:text-primary transition-colors'
                      >
                        <span>{option.label}</span>
                        <CalendarDays className='h-4 w-4 text-muted-foreground' />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showTimePane && activePane === 'time' && (
              <div className='p-4 space-y-4 bg-surface border-t border-border'>
                <div className='flex items-center justify-between pb-2 border-b border-border'>
                  <span className='text-sm font-medium text-foreground'>Time</span>
                  <button
                    type='button'
                    onClick={toggleTimeFormat}
                    className='px-2 py-1 text-xs font-medium border border-border rounded-md bg-card hover:bg-surface transition-colors'
                  >
                    {format24Hour ? '24h' : '12h'}
                  </button>
                </div>

                <div className='flex items-center justify-center gap-3'>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                  <div className='flex items-center gap-2'>
                    <input
                      type='text'
                      inputMode='numeric'
                      ref={hourInputRef}
                      value={timeParts.hours}
                      onChange={handleTimePartChange('hours')}
                      onBlur={normalizeTimeInput('hours')}
                      className='w-12 px-2 py-2 text-center border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-sm'
                      maxLength={2}
                      placeholder={format24Hour ? 'HH' : 'HH'}
                    />
                    <span className='text-muted-foreground'>:</span>
                    <input
                      type='text'
                      inputMode='numeric'
                      value={timeParts.minutes}
                      onChange={handleTimePartChange('minutes')}
                      onBlur={normalizeTimeInput('minutes')}
                      className='w-12 px-2 py-2 text-center border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-sm'
                      maxLength={2}
                      placeholder='MM'
                    />
                    {!format24Hour && (
                      <button
                        type='button'
                        onClick={toggleMeridiem}
                        className='px-3 py-2 text-xs font-semibold border border-border rounded-md bg-card hover:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-colors'
                      >
                        {timeParts.meridiem}
                      </button>
                    )}
                  </div>
                </div>

                {showQuickSelections && (
                  <div className='grid grid-cols-3 gap-2'>
                    {quickTimeOptions.map(option => (
                      <button
                        key={option.label}
                        type='button'
                        onClick={() => {
                          applyTemplateTime(option.date)
                          if (mode !== 'datetime') setOpen(false)
                        }}
                        className='flex items-center justify-between px-3 py-2 text-sm border border-border rounded-md bg-card hover:border-primary hover:text-primary transition-colors'
                      >
                        <span>{option.label}</span>
                        <Zap className='h-4 w-4 text-muted-foreground' />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className='flex items-center justify-between px-4 py-3 border-t border-border bg-card'>
              {showTips ? (
                <div className='text-xs text-muted-foreground'>
                  Fast typing: enter dates as `12/31/2025` or times as `930a`, `18:00`
                </div>
              ) : (
                <span />
              )}

              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    emitValue(undefined)
                    setOpen(false)
                  }}
                  className='px-3 py-1.5 text-sm border border-border rounded-md hover:bg-surface transition-colors'
                >
                  Clear
                </button>
                <button
                  type='button'
                  onClick={() => {
                    const payload = buildPayloadFromState()
                    if (payload) emitValue(payload)
                    setOpen(false)
                  }}
                  className='px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {error && (
        <p id={`${inputId}-error`} className='mt-1 text-sm text-red-600'>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${inputId}-help`} className='mt-1 text-sm text-muted-foreground'>
          {helpText}
        </p>
      )}
    </div>
  )
})

CalendarInput.displayName = 'CalendarInput'
