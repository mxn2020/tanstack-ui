// packages/ui/src/components/Table.tsx

import { forwardRef, ReactNode, memo } from 'react';
import type { ThHTMLAttributes } from 'react';
import { cn } from '../lib/utils';
import type { DataTableOptions } from '../lib/types';

// Root Table component
interface TableProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const Table = memo(forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, containerClassName, containerRef }, ref) => (
    <div ref={containerRef} className={cn('relative w-full overflow-auto', containerClassName)}>
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm',
          className
        )}
      >
        {children}
      </table>
    </div>
  )
));
Table.displayName = 'Table';

// TableHeader component
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export const TableHeader = memo(forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)}>
      {children}
    </thead>
  )
));
TableHeader.displayName = 'TableHeader';

// TableBody component
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export const TableBody = memo(forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className }, ref) => (
    <tbody
      ref={ref}
      className={cn('[&_tr:last-child]:border-0', className)}
    >
      {children}
    </tbody>
  )
));
TableBody.displayName = 'TableBody';

// TableFooter component
interface TableFooterProps {
  children: ReactNode;
  className?: string;
}

export const TableFooter = memo(forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, className }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        'border-t border-border bg-surface font-medium [&>tr]:last:border-b-0',
        className
      )}
    >
      {children}
    </tfoot>
  )
));
TableFooter.displayName = 'TableFooter';

// TableRow component
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
}

export const TableRow = memo(forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border transition-colors hover:bg-surface data-[state=selected]:bg-surface',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
));
TableRow.displayName = 'TableRow';

// TableHead component
interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
}

export const TableHead = memo(forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-foreground/60 [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
));
TableHead.displayName = 'TableHead';

// TableCell component
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export const TableCell = memo(forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        'p-4 align-middle [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
));
TableCell.displayName = 'TableCell';

// TableCaption component
interface TableCaptionProps {
  children: ReactNode;
  className?: string;
}

export const TableCaption = memo(forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ children, className }, ref) => (
    <caption
      ref={ref}
      className={cn('mt-4 text-sm text-foreground/60', className)}
    >
      {children}
    </caption>
  )
));
TableCaption.displayName = 'TableCaption';

// Generic Data Table Component
interface DataTableProps<T> extends DataTableOptions<T> {
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  variant = 'default',
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  className
}: DataTableProps<T>) {
  const hasSelection = onSelectionChange !== undefined;

  const handleRowClick = (record: T) => {
    if (onRowClick) {
      onRowClick(record);
    }
  };

  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectedRows.length === data.length) {
        onSelectionChange([]);
      } else {
        onSelectionChange(data.map(item => item.id as string));
      }
    }
  };

  const handleSelectRow = (id: string) => {
    if (onSelectionChange) {
      if (selectedRows.includes(id)) {
        onSelectionChange(selectedRows.filter(rowId => rowId !== id));
      } else {
        onSelectionChange([...selectedRows, id]);
      }
    }
  };

  if (loading) {
    return (
      <div className='w-full p-8 text-center'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-border'></div>
        <p className='mt-2 text-sm text-foreground/60'>Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='w-full p-8 text-center'>
        <p className='text-foreground/60'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {hasSelection && (
            <TableHead className='w-12'>
              <input
                type='checkbox'
                checked={selectedRows.length === data.length && data.length > 0}
                onChange={handleSelectAll}
                className='rounded border-border bg-card'
              />
            </TableHead>
          )}
          {columns.map((column) => {
            const widthStyle = column.width
              ? { width: typeof column.width === 'number' ? `${column.width}px` : column.width }
              : undefined

            return (
              <TableHead
                key={column.key as string}
                style={widthStyle}
                className={cn(
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {column.title}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((record, rowIndex) => {
          const rowId = record.id as string;
          const isSelected = selectedRows.includes(rowId);

          return (
            <TableRow
              key={rowId || rowIndex}
              onClick={() => handleRowClick(record)}
              className={cn(
                variant === 'striped' && rowIndex % 2 === 0 && 'bg-surface',
                onRowClick && 'cursor-pointer',
                isSelected && 'bg-accent/10'
              )}
            >
              {hasSelection && (
                <TableCell>
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectRow(rowId);
                    }}
                    className='rounded border-border bg-card'
                  />
                </TableCell>
              )}
              {columns.map((column) => {
                const value = record[column.key];
                const content = column.render
                  ? column.render(value, record)
                  : value?.toString() || '';

                return (
                  <TableCell
                    key={`${rowId || rowIndex}-${column.key}`}
                    className={cn(
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {content}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
