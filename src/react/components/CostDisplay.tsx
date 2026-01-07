// packages/ui/src/react/components/CostDisplay.tsx

import { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface CostDisplayProps {
  cost: number;
  className?: string;
  showToggle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  labels?: Partial<{
    per100Calls: string;
    showActualCost: string;
    showPer100: string;
    multiplier100x: string;
    multiplier1x: string;
  }>;
}

export function CostDisplay({
  cost,
  className = '',
  showToggle = true,
  size = 'md',
  labels: labelOverrides,
}: CostDisplayProps) {
  const labels = {
    per100Calls: ' / 100 calls',
    showActualCost: 'Show actual cost',
    showPer100: 'Show cost per 100 calls',
    multiplier100x: 'x100',
    multiplier1x: 'x1',
    ...labelOverrides,
  }
  const [showPer100, setShowPer100] = useState(false);

  const formatCost = (amount: number, per100: boolean = false) => {
    if (amount === 0) return '$0.00';

    const displayAmount = per100 ? amount * 100 : amount;

    if (displayAmount < 0.01) {
      return `$${displayAmount.toFixed(6)}`;
    } else if (displayAmount < 1) {
      return `$${displayAmount.toFixed(4)}`;
    } else {
      return `$${displayAmount.toFixed(2)}`;
    }
  };

  const displayCost = formatCost(cost, showPer100);
  const suffix = showPer100 ? labels.per100Calls : '';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={sizeClasses[size]}>
        {displayCost}{suffix}
      </span>

      {showToggle && (
        <button
          onClick={() => setShowPer100(!showPer100)}
          className='flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors'
          title={showPer100 ? labels.showActualCost : labels.showPer100}
        >
          {showPer100 ? (
            <ToggleRight className='h-3 w-3' />
          ) : (
            <ToggleLeft className='h-3 w-3' />
          )}
          <span>{showPer100 ? labels.multiplier100x : labels.multiplier1x}</span>
        </button>
      )}
    </div>
  );
}

// Simple version without toggle for places where space is limited
export function SimpleCostDisplay({ cost, per100 = false }: { cost: number; per100?: boolean }) {
  const formatCost = (amount: number) => {
    if (amount === 0) return '$0.00';

    const displayAmount = per100 ? amount * 100 : amount;

    if (displayAmount < 0.01) {
      return `$${displayAmount.toFixed(6)}`;
    } else if (displayAmount < 1) {
      return `$${displayAmount.toFixed(4)}`;
    } else {
      return `$${displayAmount.toFixed(2)}`;
    }
  };

  return (
    <span>
      {formatCost(cost)}{per100 ? ' / 100 calls' : ''}
    </span>
  );
}
