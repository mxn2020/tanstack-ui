// packages/ui/src/solid/components/Skeleton.tsx

import { type JSX, splitProps, mergeProps, For, Show } from 'solid-js';
import { cn } from '../lib/utils';

interface SkeletonProps {
  class?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
}

export function Skeleton(props: SkeletonProps) {
  const merged = mergeProps({ variant: 'default' as const, animate: true }, props);
  const [local, others] = splitProps(merged, ['class', 'variant', 'width', 'height', 'animate', 'ref']);

  const variantClasses = {
    default: 'rounded-md',
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };

  const style = (): JSX.CSSProperties => {
    const s: JSX.CSSProperties = {};
    if (local.width) s.width = typeof local.width === 'number' ? `${local.width}px` : local.width;
    if (local.height) s.height = typeof local.height === 'number' ? `${local.height}px` : local.height;
    return s;
  };

  return (
    <div
      ref={local.ref}
      class={cn(
        'bg-muted/80',
        local.animate && 'animate-pulse',
        variantClasses[local.variant],
        local.class
      )}
      style={style()}
      {...others}
    />
  );
}

// Skeleton Text - for text lines
interface SkeletonTextProps {
  lines?: number;
  class?: string;
  lineClass?: string;
  lastLineWidth?: string;
}

export function SkeletonText(props: SkeletonTextProps) {
  const merged = mergeProps({ lines: 3, lastLineWidth: '80%' }, props);
  const [local] = splitProps(merged, ['lines', 'class', 'lineClass', 'lastLineWidth']);

  return (
    <div class={cn('space-y-2', local.class)}>
      <For each={Array.from({ length: local.lines })}>
        {(_, index) => (
          <Skeleton
            variant="text"
            height={16}
            class={cn(
              'w-full',
              index() === local.lines - 1 && `w-[${local.lastLineWidth}]`,
              local.lineClass
            )}
          />
        )}
      </For>
    </div>
  );
}

// Skeleton Avatar - circular skeleton
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  class?: string;
}

export function SkeletonAvatar(props: SkeletonAvatarProps) {
  const merged = mergeProps({ size: 'md' as const }, props);
  const [local] = splitProps(merged, ['size', 'class']);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Skeleton
      variant="circular"
      class={cn(sizeClasses[local.size], local.class)}
    />
  );
}

// Skeleton Card - full card skeleton
interface SkeletonCardProps {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  class?: string;
}

export function SkeletonCard(props: SkeletonCardProps) {
  const merged = mergeProps({ hasImage: false, hasAvatar: false, lines: 3 }, props);
  const [local] = splitProps(merged, ['hasImage', 'hasAvatar', 'lines', 'class']);

  return (
    <div class={cn('space-y-4', local.class)}>
      {/* Image skeleton */}
      <Show when={local.hasImage}>
        <Skeleton class="w-full h-48" />
      </Show>

      {/* Header with optional avatar */}
      <div class="flex items-center space-x-3">
        <Show when={local.hasAvatar}>
          <SkeletonAvatar size="md" />
        </Show>
        <div class="flex-1 space-y-2">
          <Skeleton height={20} class="w-3/4" />
          <Skeleton height={16} class="w-1/2" />
        </div>
      </div>

      {/* Content lines */}
      <Show when={local.lines > 0}>
        <SkeletonText lines={local.lines} />
      </Show>
    </div>
  );
}

// Skeleton Table - table skeleton
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  class?: string;
}

export function SkeletonTable(props: SkeletonTableProps) {
  const merged = mergeProps({ rows: 5, columns: 4, hasHeader: true }, props);
  const [local] = splitProps(merged, ['rows', 'columns', 'hasHeader', 'class']);

  return (
    <div class={cn('space-y-3', local.class)}>
      {/* Header */}
      <Show when={local.hasHeader}>
        <div class="flex space-x-4">
          <For each={Array.from({ length: local.columns })}>
            {() => <Skeleton height={16} class="flex-1" />}
          </For>
        </div>
      </Show>

      {/* Rows */}
      <For each={Array.from({ length: local.rows })}>
        {() => (
          <div class="flex space-x-4">
            <For each={Array.from({ length: local.columns })}>
              {() => <Skeleton height={40} class="flex-1" />}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}

// Skeleton Grid - responsive grid of items
interface SkeletonGridProps {
  items?: number;
  columns?: 1 | 2 | 3 | 4 | 6;
  itemHeight?: number;
  gap?: number;
  class?: string;
  children?: (index: number) => JSX.Element;
}

export function SkeletonGrid(props: SkeletonGridProps) {
  const merged = mergeProps({ items: 6, columns: 3 as const, itemHeight: 200, gap: 4 }, props);
  const [local] = splitProps(merged, ['items', 'columns', 'itemHeight', 'gap', 'class', 'children']);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  const gapClass = () => `gap-${local.gap}`;

  return (
    <div class={cn('grid', gridCols[local.columns], gapClass(), local.class)}>
      <For each={Array.from({ length: local.items })}>
        {(_, index) => (
          <div>
            {local.children ? local.children(index()) : <Skeleton height={local.itemHeight} />}
          </div>
        )}
      </For>
    </div>
  );
}

// Skeleton Form - form skeleton
interface SkeletonFormProps {
  fields?: number;
  hasSubmit?: boolean;
  class?: string;
}

export function SkeletonForm(props: SkeletonFormProps) {
  const merged = mergeProps({ fields: 4, hasSubmit: true }, props);
  const [local] = splitProps(merged, ['fields', 'hasSubmit', 'class']);

  return (
    <div class={cn('space-y-4', local.class)}>
      <For each={Array.from({ length: local.fields })}>
        {() => (
          <div class="space-y-2">
            <Skeleton height={16} class="w-1/4" />
            <Skeleton height={40} class="w-full" />
          </div>
        )}
      </For>

      <Show when={local.hasSubmit}>
        <Skeleton height={40} class="w-32" />
      </Show>
    </div>
  );
}

// Skeleton Metric Card - dashboard metric card
interface SkeletonMetricCardProps {
  hasIcon?: boolean;
  hasTrend?: boolean;
  class?: string;
}

export function SkeletonMetricCard(props: SkeletonMetricCardProps) {
  const merged = mergeProps({ hasIcon: true, hasTrend: true }, props);
  const [local] = splitProps(merged, ['hasIcon', 'hasTrend', 'class']);

  return (
    <div class={cn('space-y-4', local.class)}>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3 flex-1">
          <Show when={local.hasIcon}>
            <Skeleton variant="rectangular" class="w-12 h-12 rounded-lg" />
          </Show>
          <div class="flex-1 space-y-2">
            <Skeleton height={16} class="w-2/3" />
            <Skeleton height={24} class="w-1/2" />
          </div>
        </div>
        <Show when={local.hasTrend}>
          <Skeleton variant="circular" class="w-8 h-8" />
        </Show>
      </div>

      <div class="space-y-2">
        <Skeleton height={12} class="w-full" />
      </div>
    </div>
  );
}

// Skeleton List - list of items
interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  hasSecondary?: boolean;
  class?: string;
}

export function SkeletonList(props: SkeletonListProps) {
  const merged = mergeProps({ items: 5, hasAvatar: false, hasSecondary: true }, props);
  const [local] = splitProps(merged, ['items', 'hasAvatar', 'hasSecondary', 'class']);

  return (
    <div class={cn('space-y-3', local.class)}>
      <For each={Array.from({ length: local.items })}>
        {() => (
          <div class="flex items-center space-x-3">
            <Show when={local.hasAvatar}>
              <SkeletonAvatar size="md" />
            </Show>
            <div class="flex-1 space-y-2">
              <Skeleton height={16} class="w-3/4" />
              <Show when={local.hasSecondary}>
                <Skeleton height={12} class="w-1/2" />
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
