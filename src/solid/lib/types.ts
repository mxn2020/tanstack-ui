// packages/ui/src/solid/lib/types.ts

import type { JSX } from 'solid-js'

export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'destructive'
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'danger' | 'destructive' | 'ghost' | 'outline' | 'link'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'default'
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'destructive' | 'info' | 'outline' | 'error'
export type BadgeSize = 'sm' | 'md' | 'lg'
export type InputSize = 'sm' | 'md' | 'lg'
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent'

export type VariantClasses<T extends string> = Record<T, string>

export interface FormComponentProps {
  error?: string
  helpText?: string
  disabled?: boolean
}

export interface StyledComponentProps {
  variant?: ComponentVariant
  size?: ComponentSize
}

export type DataAlignment = 'left' | 'center' | 'right'

export interface DataTableColumn<T> {
  key: keyof T extends string ? keyof T : string
  title: JSX.Element
  render?: (value: T[keyof T] | unknown, record: T) => JSX.Element
  width?: string | number
  align?: DataAlignment
}

export interface DataTableOptions<T> {
  data: T[]
  columns: Array<DataTableColumn<T>>
  loading?: boolean
  emptyMessage?: string
  variant?: 'default' | 'striped'
  onRowClick?: (record: T) => void
  selectedRows?: string[]
  onSelectionChange?: (ids: string[]) => void
}
