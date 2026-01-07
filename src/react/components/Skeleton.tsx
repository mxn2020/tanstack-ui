// packages/ui/src/react/components/Skeleton.tsx

import { memo, forwardRef } from 'react';
import { cn } from '../lib/utils';
import type { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export const Skeleton = memo(forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', width, height, animate = true }, ref) => {
    const variantClasses = {
      default: 'rounded-md',
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none'
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-muted/80',
          animate && 'animate-pulse',
          variantClasses[variant],
          className
        )}
        style={style}
      />
    );
  }
));
Skeleton.displayName = 'Skeleton';

// Skeleton Text - for text lines
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
  lastLineWidth?: string;
}

export const SkeletonText = memo(({
  lines = 3,
  className,
  lineClassName,
  lastLineWidth = '80%'
}: SkeletonTextProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant='text'
          height={16}
          className={cn(
            'w-full',
            index === lines - 1 && `w-[${lastLineWidth}]`,
            lineClassName
          )}
        />
      ))}
    </div>
  );
});
SkeletonText.displayName = 'SkeletonText';

// Skeleton Avatar - circular skeleton
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SkeletonAvatar = memo(({ size = 'md', className }: SkeletonAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Skeleton
      variant='circular'
      className={cn(sizeClasses[size], className)}
    />
  );
});
SkeletonAvatar.displayName = 'SkeletonAvatar';

// Skeleton Card - full card skeleton
interface SkeletonCardProps {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard = memo(({
  hasImage = false,
  hasAvatar = false,
  lines = 3,
  className
}: SkeletonCardProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Image skeleton */}
      {hasImage && <Skeleton className='w-full h-48' />}

      {/* Header with optional avatar */}
      <div className='flex items-center space-x-3'>
        {hasAvatar && <SkeletonAvatar size='md' />}
        <div className='flex-1 space-y-2'>
          <Skeleton height={20} className='w-3/4' />
          <Skeleton height={16} className='w-1/2' />
        </div>
      </div>

      {/* Content lines */}
      {lines > 0 && <SkeletonText lines={lines} />}
    </div>
  );
});
SkeletonCard.displayName = 'SkeletonCard';

// Skeleton Table - table skeleton
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string;
}

export const SkeletonTable = memo(({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className
}: SkeletonTableProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      {hasHeader && (
        <div className='flex space-x-4'>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height={16} className='flex-1' />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className='flex space-x-4'>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height={40} className='flex-1' />
          ))}
        </div>
      ))}
    </div>
  );
});
SkeletonTable.displayName = 'SkeletonTable';

// Skeleton Grid - responsive grid of items
interface SkeletonGridProps {
  items?: number;
  columns?: 1 | 2 | 3 | 4 | 6;
  itemHeight?: number;
  gap?: number;
  className?: string;
  children?: (index: number) => ReactNode;
}

export const SkeletonGrid = memo(({
  items = 6,
  columns = 3,
  itemHeight = 200,
  gap = 4,
  className,
  children
}: SkeletonGridProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={cn('grid', gridCols[columns], gapClass, className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index}>
          {children ? children(index) : <Skeleton height={itemHeight} />}
        </div>
      ))}
    </div>
  );
});
SkeletonGrid.displayName = 'SkeletonGrid';

// Skeleton Form - form skeleton
interface SkeletonFormProps {
  fields?: number;
  hasSubmit?: boolean;
  className?: string;
}

export const SkeletonForm = memo(({
  fields = 4,
  hasSubmit = true,
  className
}: SkeletonFormProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className='space-y-2'>
          <Skeleton height={16} className='w-1/4' />
          <Skeleton height={40} className='w-full' />
        </div>
      ))}

      {hasSubmit && (
        <Skeleton height={40} className='w-32' />
      )}
    </div>
  );
});
SkeletonForm.displayName = 'SkeletonForm';

// Skeleton Metric Card - dashboard metric card
interface SkeletonMetricCardProps {
  hasIcon?: boolean;
  hasTrend?: boolean;
  className?: string;
}

export const SkeletonMetricCard = memo(({
  hasIcon = true,
  hasTrend = true,
  className
}: SkeletonMetricCardProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3 flex-1'>
          {hasIcon && <Skeleton variant='rectangular' className='w-12 h-12 rounded-lg' />}
          <div className='flex-1 space-y-2'>
            <Skeleton height={16} className='w-2/3' />
            <Skeleton height={24} className='w-1/2' />
          </div>
        </div>
        {hasTrend && <Skeleton variant='circular' className='w-8 h-8' />}
      </div>

      <div className='space-y-2'>
        <Skeleton height={12} className='w-full' />
      </div>
    </div>
  );
});
SkeletonMetricCard.displayName = 'SkeletonMetricCard';

// Skeleton List - list of items
interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  hasSecondary?: boolean;
  className?: string;
}

export const SkeletonList = memo(({
  items = 5,
  hasAvatar = false,
  hasSecondary = true,
  className
}: SkeletonListProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className='flex items-center space-x-3'>
          {hasAvatar && <SkeletonAvatar size='md' />}
          <div className='flex-1 space-y-2'>
            <Skeleton height={16} className='w-3/4' />
            {hasSecondary && <Skeleton height={12} className='w-1/2' />}
          </div>
        </div>
      ))}
    </div>
  );
});
SkeletonList.displayName = 'SkeletonList';
