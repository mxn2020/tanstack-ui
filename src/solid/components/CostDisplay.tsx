// packages/ui/src/solid/components/CostDisplay.tsx

import { Component, JSX, splitProps, createSignal, Show } from 'solid-js'
import { ToggleLeft, ToggleRight } from 'lucide-solid'

interface CostDisplayProps {
  cost: number
  class?: string
  showToggle?: boolean
  size?: 'sm' | 'md' | 'lg'
  labels?: Partial<{
    per100Calls: string
    showActualCost: string
    showPer100: string
    multiplier100x: string
    multiplier1x: string
  }>
}

export const CostDisplay: Component<CostDisplayProps> = (props) => {
  const [local, _] = splitProps(props, ['cost', 'class', 'showToggle', 'size', 'labels'])
  
  const labels = () => ({
    per100Calls: ' / 100 calls',
    showActualCost: 'Show actual cost',
    showPer100: 'Show cost per 100 calls',
    multiplier100x: 'x100',
    multiplier1x: 'x1',
    ...local.labels,
  })

  const [showPer100, setShowPer100] = createSignal(false)

  const formatCost = (amount: number, per100: boolean = false) => {
    if (amount === 0) return '$0.00'

    const displayAmount = per100 ? amount * 100 : amount

    if (displayAmount < 0.01) {
      return `$${displayAmount.toFixed(6)}`
    } else if (displayAmount < 1) {
      return `$${displayAmount.toFixed(4)}`
    } else {
      return `$${displayAmount.toFixed(2)}`
    }
  }

  const displayCost = () => formatCost(local.cost, showPer100())
  const suffix = () => showPer100() ? labels().per100Calls : ''

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  }

  return (
    <div class={`flex items-center space-x-2 ${local.class ?? ''}`}>
      <span class={sizeClasses[local.size ?? 'md']}>
        {displayCost()}{suffix()}
      </span>

      <Show when={local.showToggle ?? true}>
        <button
          onClick={() => setShowPer100(!showPer100())}
          class="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title={showPer100() ? labels().showActualCost : labels().showPer100}
        >
          <Show
            when={showPer100()}
            fallback={<ToggleLeft class="h-3 w-3" />}
          >
            <ToggleRight class="h-3 w-3" />
          </Show>
          <span>{showPer100() ? labels().multiplier100x : labels().multiplier1x}</span>
        </button>
      </Show>
    </div>
  )
}

// Simple version without toggle for places where space is limited
interface SimpleCostDisplayProps {
  cost: number
  per100?: boolean
}

export const SimpleCostDisplay: Component<SimpleCostDisplayProps> = (props) => {
  const formatCost = (amount: number) => {
    if (amount === 0) return '$0.00'

    const displayAmount = props.per100 ? amount * 100 : amount

    if (displayAmount < 0.01) {
      return `$${displayAmount.toFixed(6)}`
    } else if (displayAmount < 1) {
      return `$${displayAmount.toFixed(4)}`
    } else {
      return `$${displayAmount.toFixed(2)}`
    }
  }

  return (
    <span>
      {formatCost(props.cost)}{props.per100 ? ' / 100 calls' : ''}
    </span>
  )
}
