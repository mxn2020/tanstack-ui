// packages/ui/src/components/List.tsx

import { forwardRef, ReactNode, memo } from 'react';
import { cn } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/utils';
import type { DataTableColumn } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/types';

// List Item component
interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const ListItem = memo(forwardRef<HTMLDivElement, ListItemProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-surface/50 p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
));
ListItem.displayName = 'ListItem';

// List Container component
interface ListContainerProps {
  children: ReactNode;
  className?: string;
}

export const ListContainer = memo(forwardRef<HTMLDivElement, ListContainerProps>(
  ({ children, className }, ref) => (
    <div
      ref={ref}
      className={cn('w-full border rounded-lg overflow-hidden', className)}
    >
      {children}
    </div>
  )
));
ListContainer.displayName = 'ListContainer';

// Generic Data List Component
interface DataListProps<T> {
  data: T[];
  renderItem: (record: T, index: number) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (record: T) => void;
  className?: string;
  itemClassName?: string;
  virtualize?: boolean;
  virtualHeight?: number | string;
}

export function DataList<T extends Record<string, unknown>>({
  data,
  renderItem,
  loading = false,
  emptyMessage = 'No data available',
  onItemClick,
  className,
  itemClassName,
  virtualize = false,
  virtualHeight = 600,
}: DataListProps<T>) {
  if (loading) {
    return (
      <div className='w-full p-8 text-center'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground'></div>
        <p className='mt-2 text-sm text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='w-full p-8 text-center'>
        <p className='text-muted-foreground'>{emptyMessage}</p>
      </div>
    );
  }

  const handleItemClick = (record: T) => {
    if (onItemClick) {
      onItemClick(record);
    }
  };

  const content = data.map((record, index) => {
    const rowId = (record.id as string) || index;
    const sharedProps = {
      onClick: () => handleItemClick(record),
      className: cn(onItemClick && 'cursor-pointer', itemClassName),
    }

    if (virtualize) {
      return (
        <div
          key={rowId}
          {...sharedProps}
          className={cn('border-b hover:bg-surface/50 dark:hover:bg-surface', sharedProps.className)}
        >
          {renderItem(record, index)}
        </div>
      )
    }

    return (
      <ListItem
        key={rowId}
        {...sharedProps}
      >
        {renderItem(record, index)}
      </ListItem>
    )
  })

  if (virtualize) {
    const maxHeight = typeof virtualHeight === 'number' ? `${virtualHeight}px` : virtualHeight
    return (
      <div
        className={cn('w-full border rounded-lg overflow-auto', className)}
        style={{ maxHeight }}
      >
        {content}
      </div>
    )
  }

  return (
    <ListContainer className={className}>
      {content}
    </ListContainer>
  );
}

// Compact List View Helper Component
interface CompactListViewProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (record: T) => void;
  className?: string;
  virtualize?: boolean;
  virtualHeight?: number | string;
}

export function CompactListView<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onItemClick,
  className,
  virtualize = false,
  virtualHeight = 600,
}: CompactListViewProps<T>) {
  return (
    <DataList
      data={data}
      loading={loading}
      emptyMessage={emptyMessage}
      onItemClick={onItemClick}
      className={className}
      virtualize={virtualize}
      virtualHeight={virtualHeight}
      renderItem={(record) => (
        <div className='p-4'>
          <div className='space-y-2'>
            {columns.map((column) => {
              const value = record[column.key];
              const content = column.render
                ? column.render(value, record)
                : value?.toString() || '';

              return (
                <div key={column.key} className='flex justify-between items-start'>
                  <span className='text-sm font-medium text-muted-foreground min-w-[120px]'>
                    {column.title}:
                  </span>
                  <span className='text-sm text-foreground flex-1 text-right'>
                    {content}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    />
  );
}
