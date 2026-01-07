// packages/ui/src/solid/components/Slider.tsx

import { Component, createSignal, createEffect, onCleanup, splitProps, For } from 'solid-js'
import { cn } from '../lib/utils'

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  inverted?: boolean
  class?: string
  trackClass?: string
  rangeClass?: string
  thumbClass?: string
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const Slider: Component<SliderProps> = (props) => {
  const [local, others] = splitProps(props, [
    'value',
    'defaultValue',
    'onValueChange',
    'min',
    'max',
    'step',
    'disabled',
    'orientation',
    'inverted',
    'class',
    'trackClass',
    'rangeClass',
    'thumbClass',
    'ref'
  ])

  const [internalValue, setInternalValue] = createSignal(local.defaultValue ?? [0])
  let sliderRef: HTMLDivElement | undefined
  const [isDragging, setIsDragging] = createSignal<number | null>(null)

  const isControlled = () => local.value !== undefined
  const value = () => isControlled() ? local.value! : internalValue()
  const isVertical = () => (local.orientation ?? 'horizontal') === 'vertical'
  const min = () => local.min ?? 0
  const max = () => local.max ?? 100
  const step = () => local.step ?? 1
  const inverted = () => local.inverted ?? false
  const disabled = () => local.disabled ?? false

  const handleValueChange = (newValue: number[]) => {
    if (!isControlled()) {
      setInternalValue(newValue)
    }
    local.onValueChange?.(newValue)
  }

  const getValueFromPointer = (event: MouseEvent | TouchEvent): number => {
    if (!sliderRef) return 0

    const rect = sliderRef.getBoundingClientRect()
    const clientX = 'touches' in event ? event.touches[0]?.clientX ?? 0 : event.clientX
    const clientY = 'touches' in event ? event.touches[0]?.clientY ?? 0 : event.clientY

    let percent: number
    if (isVertical()) {
      percent = (clientY - rect.top) / rect.height
      if (inverted()) percent = 1 - percent
    } else {
      percent = (clientX - rect.left) / rect.width
      if (inverted()) percent = 1 - percent
    }

    percent = Math.max(0, Math.min(1, percent))
    const newValue = min() + percent * (max() - min())
    return Math.round(newValue / step()) * step()
  }

  const handlePointerMove = (event: MouseEvent | TouchEvent) => {
    const draggingIndex = isDragging()
    if (draggingIndex === null || disabled()) return

    event.preventDefault()
    const newValue = getValueFromPointer(event)
    const newValues = [...value()]
    newValues[draggingIndex] = newValue
    handleValueChange(newValues.sort((a, b) => a - b))
  }

  const handlePointerUp = () => {
    setIsDragging(null)
  }

  createEffect(() => {
    const draggingIndex = isDragging()
    if (draggingIndex !== null) {
      const handleMouseMove = (e: MouseEvent) => handlePointerMove(e)
      const handleMouseUp = () => handlePointerUp()
      const handleTouchMove = (e: TouchEvent) => handlePointerMove(e)
      const handleTouchEnd = () => handlePointerUp()

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleTouchEnd)

      onCleanup(() => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      })
    }
  })

  const handleThumbPointerDown = (event: MouseEvent | TouchEvent, thumbIndex: number) => {
    if (disabled()) return
    event.preventDefault()
    setIsDragging(thumbIndex)
  }

  const handleTrackPointerDown = (event: MouseEvent | TouchEvent) => {
    if (disabled()) return

    const newValue = getValueFromPointer(event)
    const currentValue = value()
    const closestThumbIndex = currentValue.reduce((closest, thumbValue, index) => {
      const closestValue = currentValue[closest] ?? 0
      return Math.abs(newValue - thumbValue) < Math.abs(newValue - closestValue) ? index : closest
    }, 0)

    const newValues = [...currentValue]
    newValues[closestThumbIndex] = newValue
    handleValueChange(newValues.sort((a, b) => a - b))
    setIsDragging(closestThumbIndex)
  }

  const getThumbPosition = (thumbValue: number) => {
    const percent = ((thumbValue - min()) / (max() - min())) * 100
    return inverted() ? 100 - percent : percent
  }

  const getRangePosition = () => {
    const currentValue = value()
    if (currentValue.length === 1) {
      const firstValue = currentValue[0] ?? 0
      const startPercent = inverted() ? getThumbPosition(firstValue) : 0
      const endPercent = inverted() ? 100 : getThumbPosition(firstValue)
      return { start: Math.min(startPercent, endPercent), width: Math.abs(endPercent - startPercent) }
    } else {
      const startPercent = getThumbPosition(Math.min(...currentValue))
      const endPercent = getThumbPosition(Math.max(...currentValue))
      return { start: startPercent, width: endPercent - startPercent }
    }
  }

  return (
    <div
      ref={(el) => {
        sliderRef = el
        if (typeof local.ref === 'function') local.ref(el)
        else if (local.ref) (local.ref as any) = el
      }}
      class={cn(
        'relative flex touch-none select-none items-center',
        isVertical() ? 'h-full w-5 flex-col' : 'h-5 w-full',
        disabled() && 'opacity-50 cursor-not-allowed',
        local.class
      )}
      {...others}
    >
      {/* Track */}
      <div
        class={cn(
          'relative flex-1 rounded-full bg-border',
          isVertical() ? 'w-2 h-full' : 'h-2 w-full',
          !disabled() && 'cursor-pointer',
          local.trackClass
        )}
        onMouseDown={handleTrackPointerDown}
        onTouchStart={handleTrackPointerDown}
      >
        {/* Range */}
        <div
          class={cn(
            'absolute rounded-full bg-blue-600',
            isVertical() ? 'w-full' : 'h-full',
            local.rangeClass
          )}
          style={
            isVertical()
              ? { bottom: `${getRangePosition().start}%`, height: `${getRangePosition().width}%` }
              : { left: `${getRangePosition().start}%`, width: `${getRangePosition().width}%` }
          }
        />

        {/* Thumbs */}
        <For each={value()}>
          {(thumbValue, index) => (
            <div
              class={cn(
                'absolute block h-5 w-5 rounded-full border-2 border-blue-600 bg-card shadow-md transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                !disabled() && 'hover:bg-surface cursor-grab',
                isDragging() === index() && !disabled() && 'cursor-grabbing scale-110',
                disabled() && 'cursor-not-allowed',
                local.thumbClass
              )}
              style={
                isVertical()
                  ? { bottom: `${getThumbPosition(thumbValue)}%`, transform: 'translateY(50%)' }
                  : { left: `${getThumbPosition(thumbValue)}%`, transform: 'translateX(-50%)' }
              }
              onMouseDown={(e) => handleThumbPointerDown(e, index())}
              onTouchStart={(e) => handleThumbPointerDown(e, index())}
              tabIndex={disabled() ? -1 : 0}
              role="slider"
              aria-valuenow={thumbValue}
              aria-valuemin={min()}
              aria-valuemax={max()}
              aria-orientation={local.orientation ?? 'horizontal'}
              aria-disabled={disabled()}
            />
          )}
        </For>
      </div>
    </div>
  )
}
