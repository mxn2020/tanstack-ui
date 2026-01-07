// packages/ui/src/solid/components/List.tsx

import { Component, JSX, splitProps, Show, For } from 'solid-js';
import { cn } from '../lib/utils';
import type { DataTableColumn } from '../lib/types';

// List Item component
interface ListItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element;
  ref?: (el: HTMLDivElement) => void;
}

export const ListItem: Component<ListItemProps> = (props) => {
  const [local, divProps] = splitProps(props, ['children', 'class', 'ref']);

  return (
    <div
      ref={local.ref}
      class={cn(
        'border-b transition-colors hover:bg-surface/50 p-4',
        local.class
      )}
      {...divProps}
    >
      {local.children}
    </div>
  );
};

// List Container component
interface ListContainerProps {
  children: JSX.Element;
  class?: string;
  ref?: (el: HTMLDivElement) => void;
}

export const ListContainer: Component<ListContainerProps> = (props) => {
  return (
    <div
      ref={props.ref}
      class={cn('w-full border rounded-lg overflow-hidden', props.class)}
    >
      {props.children}
    </div>
  );
};

// Generic Data List Component
interface DataListProps<T> {
  data: T[];
  renderItem: (record: T, index: number) => JSX.Element;
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (record: T) => void;
  class?: string;
  itemClass?: string;
  virtualize?: boolean;
  virtualHeight?: number | string;
}

export function DataList<T extends Record<string, unknown>>(props: DataListProps<T>) {
  const loading = () => props.loading || false;
  const emptyMessage = () => props.emptyMessage || 'No data available';
  const virtualize = () => props.virtualize || false;
  const virtualHeight = () => props.virtualHeight || 600;

  const handleItemClick = (record: T) => {
    if (props.onItemClick) {
      props.onItemClick(record);
    }
  };

  return (
    <Show
      when={!loading()}
      fallback={
        <div class='w-full p-8 text-center'>
          <div class='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground'></div>
          <p class='mt-2 text-sm text-muted-foreground'>Loading...</p>
        </div>
      }
    >
      <Show
        when={props.data.length > 0}
        fallback={
          <div class='w-full p-8 text-center'>
            <p class='text-muted-foreground'>{emptyMessage()}</p>
          </div>
        }
      >
        <Show
          when={virtualize()}
          fallback={
            <ListContainer class={props.class}>
              <For each={props.data}>
                {(record, index) => {
                  const rowId = (record.id as string) || index();
                  return (
                    <ListItem
                      onClick={() => handleItemClick(record)}
                      class={cn(props.onItemClick && 'cursor-pointer', props.itemClass)}
                    >
                      {props.renderItem(record, index())}
                    </ListItem>
                  );
                }}
              </For>
            </ListContainer>
          }
        >
          <div
            class={cn('w-full border rounded-lg overflow-auto', props.class)}
            style={{ 
              'max-height': typeof virtualHeight() === 'number' 
                ? `${virtualHeight()}px` 
                : virtualHeight() as string
            }}
          >
            <For each={props.data}>
              {(record, index) => {
                const rowId = (record.id as string) || index();
                return (
                  <div
                    onClick={() => handleItemClick(record)}
                    class={cn(
                      'border-b hover:bg-surface/50 dark:hover:bg-surface',
                      props.onItemClick && 'cursor-pointer',
                      props.itemClass
                    )}
                  >
                    {props.renderItem(record, index())}
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </Show>
    </Show>
  );
}

// Compact List View Helper Component
interface CompactListViewProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (record: T) => void;
  class?: string;
  virtualize?: boolean;
  virtualHeight?: number | string;
}

export function CompactListView<T extends Record<string, unknown>>(props: CompactListViewProps<T>) {
  return (
    <DataList
      data={props.data}
      loading={props.loading}
      emptyMessage={props.emptyMessage}
      onItemClick={props.onItemClick}
      class={props.class}
      virtualize={props.virtualize}
      virtualHeight={props.virtualHeight}
      renderItem={(record) => (
        <div class='p-4'>
          <div class='space-y-2'>
            <For each={props.columns}>
              {(column) => {
                const value = record[column.key];
                const content = column.render
                  ? column.render(value, record)
                  : value?.toString() || '';

                return (
                  <div class='flex justify-between items-start'>
                    <span class='text-sm font-medium text-muted-foreground min-w-[120px]'>
                      {column.title}:
                    </span>
                    <span class='text-sm text-foreground flex-1 text-right'>
                      {content}
                    </span>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      )}
    />
  );
}
