// packages/ui/src/solid/components/Table.tsx

import { Component, JSX, splitProps, For, Show } from 'solid-js'
import { cn } from '../lib/utils'
import type { DataTableOptions } from '../lib/types'

// Root Table component
interface TableProps {
  children: JSX.Element
  class?: string
  containerClass?: string
  containerRef?: HTMLDivElement | ((el: HTMLDivElement) => void)
  ref?: HTMLTableElement | ((el: HTMLTableElement) => void)
}

export const Table: Component<TableProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'containerClass', 'containerRef', 'ref'])
  
  return (
    <div ref={local.containerRef} class={cn('relative w-full overflow-auto', local.containerClass)}>
      <table
        ref={local.ref}
        class={cn('w-full caption-bottom text-sm', local.class)}
        {...others}
      >
        {local.children}
      </table>
    </div>
  )
}

// TableHeader component
interface TableHeaderProps {
  children: JSX.Element
  class?: string
  ref?: HTMLTableSectionElement | ((el: HTMLTableSectionElement) => void)
}

export const TableHeader: Component<TableHeaderProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <thead ref={local.ref} class={cn('[&_tr]:border-b', local.class)} {...others}>
      {local.children}
    </thead>
  )
}

// TableBody component
interface TableBodyProps {
  children: JSX.Element
  class?: string
  ref?: HTMLTableSectionElement | ((el: HTMLTableSectionElement) => void)
}

export const TableBody: Component<TableBodyProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <tbody ref={local.ref} class={cn('[&_tr:last-child]:border-0', local.class)} {...others}>
      {local.children}
    </tbody>
  )
}

// TableFooter component
interface TableFooterProps {
  children: JSX.Element
  class?: string
  ref?: HTMLTableSectionElement | ((el: HTMLTableSectionElement) => void)
}

export const TableFooter: Component<TableFooterProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <tfoot
      ref={local.ref}
      class={cn(
        'border-t border-border bg-surface font-medium [&>tr]:last:border-b-0',
        local.class
      )}
      {...others}
    >
      {local.children}
    </tfoot>
  )
}

// TableRow component
interface TableRowProps extends JSX.HTMLAttributes<HTMLTableRowElement> {
  children: JSX.Element
  class?: string
  ref?: HTMLTableRowElement | ((el: HTMLTableRowElement) => void)
}

export const TableRow: Component<TableRowProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <tr
      ref={local.ref}
      class={cn(
        'border-b border-border transition-colors hover:bg-surface data-[state=selected]:bg-surface',
        local.class
      )}
      {...others}
    >
      {local.children}
    </tr>
  )
}

// TableHead component
interface TableHeadProps extends JSX.ThHTMLAttributes<HTMLTableCellElement> {
  children: JSX.Element
  class?: string
  ref?: HTMLTableCellElement | ((el: HTMLTableCellElement) => void)
}

export const TableHead: Component<TableHeadProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <th
      ref={local.ref}
      class={cn(
        'h-12 px-4 text-left align-middle font-medium text-foreground/60 [&:has([role=checkbox])]:pr-0',
        local.class
      )}
      {...others}
    >
      {local.children}
    </th>
  )
}

// TableCell component
interface TableCellProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
  children: JSX.Element
  class?: string
  ref?: HTMLTableCellElement | ((el: HTMLTableCellElement) => void)
}

export const TableCell: Component<TableCellProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <td
      ref={local.ref}
      class={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', local.class)}
      {...others}
    >
      {local.children}
    </td>
  )
}

// TableCaption component
interface TableCaptionProps {
  children: JSX.Element
  class?: string
  ref?: HTMLTableCaptionElement | ((el: HTMLTableCaptionElement) => void)
}

export const TableCaption: Component<TableCaptionProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'ref'])
  
  return (
    <caption
      ref={local.ref}
      class={cn('mt-4 text-sm text-foreground/60', local.class)}
      {...others}
    >
      {local.children}
    </caption>
  )
}

// Generic Data Table Component
interface DataTableProps<T> extends DataTableOptions<T> {
  class?: string
}

export function DataTable<T extends Record<string, unknown>>(props: DataTableProps<T>) {
  const hasSelection = () => props.onSelectionChange !== undefined
  const selectedRows = () => props.selectedRows ?? []
  const loading = () => props.loading ?? false
  const emptyMessage = () => props.emptyMessage ?? 'No data available'
  const variant = () => props.variant ?? 'default'

  const handleRowClick = (record: T) => {
    props.onRowClick?.(record)
  }

  const handleSelectAll = () => {
    if (props.onSelectionChange) {
      if (selectedRows().length === props.data.length) {
        props.onSelectionChange([])
      } else {
        props.onSelectionChange(props.data.map(item => item.id as string))
      }
    }
  }

  const handleSelectRow = (id: string) => {
    if (props.onSelectionChange) {
      const current = selectedRows()
      if (current.includes(id)) {
        props.onSelectionChange(current.filter(rowId => rowId !== id))
      } else {
        props.onSelectionChange([...current, id])
      }
    }
  }

  return (
    <Show
      when={!loading()}
      fallback={
        <div class="w-full p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-border" />
          <p class="mt-2 text-sm text-foreground/60">Loading...</p>
        </div>
      }
    >
      <Show
        when={props.data.length > 0}
        fallback={
          <div class="w-full p-8 text-center">
            <p class="text-foreground/60">{emptyMessage()}</p>
          </div>
        }
      >
        <Table class={props.class}>
          <TableHeader>
            <TableRow>
              <Show when={hasSelection()}>
                <TableHead class="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows().length === props.data.length && props.data.length > 0}
                    onChange={handleSelectAll}
                    class="rounded border-border bg-card"
                  />
                </TableHead>
              </Show>
              <For each={props.columns}>
                {(column) => {
                  const widthStyle = column.width
                    ? { width: typeof column.width === 'number' ? `${column.width}px` : column.width }
                    : undefined

                  return (
                    <TableHead
                      style={widthStyle}
                      class={cn(
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.title}
                    </TableHead>
                  )
                }}
              </For>
            </TableRow>
          </TableHeader>
          <TableBody>
            <For each={props.data}>
              {(record, rowIndex) => {
                const rowId = record.id as string
                const isSelected = () => selectedRows().includes(rowId)

                return (
                  <TableRow
                    onClick={() => handleRowClick(record)}
                    class={cn(
                      variant() === 'striped' && rowIndex() % 2 === 0 && 'bg-surface',
                      props.onRowClick && 'cursor-pointer',
                      isSelected() && 'bg-accent/10'
                    )}
                  >
                    <Show when={hasSelection()}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected()}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectRow(rowId)
                          }}
                          class="rounded border-border bg-card"
                        />
                      </TableCell>
                    </Show>
                    <For each={props.columns}>
                      {(column) => {
                        const value = record[column.key]
                        const content = column.render
                          ? column.render(value, record)
                          : value?.toString() || ''

                        return (
                          <TableCell
                            class={cn(
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {content}
                          </TableCell>
                        )
                      }}
                    </For>
                  </TableRow>
                )
              }}
            </For>
          </TableBody>
        </Table>
      </Show>
    </Show>
  )
}
