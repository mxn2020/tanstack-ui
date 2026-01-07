// packages/ui/src/solid/components/ScrollArea.tsx

import {
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  ParentProps,
  JSX,
  splitProps,
  mergeProps,
  Show
} from 'solid-js'
import { cn } from '../lib/utils'

interface ScrollAreaProps extends ParentProps<JSX.HTMLAttributes<HTMLDivElement>> {
  class?: string
  orientation?: 'vertical' | 'horizontal' | 'both'
  maxHeight?: string
  maxWidth?: string
  hideScrollbar?: boolean
}

interface ScrollbarProps {
  orientation: 'vertical' | 'horizontal'
  scrollPercentage: number
  thumbSize: number
  visible: boolean
  onScrollbarClick: (position: number) => void
}

const Scrollbar = (props: ScrollbarProps) => {
  const isVertical = () => props.orientation === 'vertical'

  const handleClick = (e: MouseEvent) => {
    if (!e.currentTarget) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const position = isVertical()
      ? (e.clientY - rect.top) / rect.height
      : (e.clientX - rect.left) / rect.width
    props.onScrollbarClick(position)
  }

  return (
    <Show when={props.visible}>
      <div
        class={cn(
          'absolute transition-opacity duration-200',
          isVertical()
            ? 'right-0 top-0 bottom-0 w-2'
            : 'left-0 right-0 bottom-0 h-2',
          'opacity-0 hover:opacity-100 group-hover:opacity-100'
        )}
        onClick={handleClick}
      >
        <div
          class={cn(
            'bg-border hover:bg-muted-foreground rounded-full transition-colors',
            isVertical() ? 'w-full' : 'h-full'
          )}
          style={{
            [isVertical() ? 'height' : 'width']: `${props.thumbSize}%`,
            [isVertical() ? 'top' : 'left']: `${props.scrollPercentage}%`,
            position: 'absolute',
          }}
        />
      </div>
    </Show>
  )
}

export const ScrollArea = (props: ScrollAreaProps) => {
  const merged = mergeProps(
    { orientation: 'vertical' as const, hideScrollbar: false },
    props
  )
  const [local, others] = splitProps(merged, [
    'children',
    'class',
    'orientation',
    'maxHeight',
    'maxWidth',
    'hideScrollbar',
    'ref'
  ])

  let scrollRef: HTMLDivElement | undefined
  const [verticalScroll, setVerticalScroll] = createSignal({ percentage: 0, thumbSize: 100 })
  const [horizontalScroll, setHorizontalScroll] = createSignal({ percentage: 0, thumbSize: 100 })
  const [showScrollbars, setShowScrollbars] = createSignal(false)

  const updateScrollMetrics = () => {
    if (!scrollRef) return

    const {
      scrollTop,
      scrollLeft,
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
    } = scrollRef

    // Vertical scroll metrics
    const verticalScrollable = scrollHeight > clientHeight
    const verticalThumbSize = verticalScrollable ? (clientHeight / scrollHeight) * 100 : 100
    const verticalPercentage = verticalScrollable
      ? (scrollTop / (scrollHeight - clientHeight)) * (100 - verticalThumbSize)
      : 0

    setVerticalScroll({ percentage: verticalPercentage, thumbSize: verticalThumbSize })

    // Horizontal scroll metrics
    const horizontalScrollable = scrollWidth > clientWidth
    const horizontalThumbSize = horizontalScrollable ? (clientWidth / scrollWidth) * 100 : 100
    const horizontalPercentage = horizontalScrollable
      ? (scrollLeft / (scrollWidth - clientWidth)) * (100 - horizontalThumbSize)
      : 0

    setHorizontalScroll({ percentage: horizontalPercentage, thumbSize: horizontalThumbSize })

    setShowScrollbars(verticalScrollable || horizontalScrollable)
  }

  onMount(() => {
    updateScrollMetrics()

    const resizeObserver = new ResizeObserver(updateScrollMetrics)
    const currentRef = scrollRef

    if (currentRef) {
      resizeObserver.observe(currentRef)
    }

    onCleanup(() => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef)
      }
    })
  })

  // Update when children change
  createEffect(() => {
    local.children // Track children
    updateScrollMetrics()
  })

  const handleVerticalScrollbarClick = (position: number) => {
    if (!scrollRef) return
    const { scrollHeight, clientHeight } = scrollRef
    const maxScroll = scrollHeight - clientHeight
    scrollRef.scrollTop = position * maxScroll
  }

  const handleHorizontalScrollbarClick = (position: number) => {
    if (!scrollRef) return
    const { scrollWidth, clientWidth } = scrollRef
    const maxScroll = scrollWidth - clientWidth
    scrollRef.scrollLeft = position * maxScroll
  }

  const showVertical = () =>
    (local.orientation === 'vertical' || local.orientation === 'both') && !local.hideScrollbar
  const showHorizontal = () =>
    (local.orientation === 'horizontal' || local.orientation === 'both') && !local.hideScrollbar

  return (
    <div class={cn('relative group', local.class)}>
      <div
        ref={(el) => {
          scrollRef = el
          if (typeof local.ref === 'function') {
            local.ref(el)
          } else if (local.ref) {
            local.ref = el
          }
        }}
        class={cn(
          'overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
          local.hideScrollbar && 'scrollbar-hide'
        )}
        style={{
          'max-height': local.maxHeight,
          'max-width': local.maxWidth,
        }}
        onScroll={updateScrollMetrics}
        {...others}
      >
        {local.children}
      </div>

      <Show when={showScrollbars() && !local.hideScrollbar}>
        <Show when={showVertical()}>
          <Scrollbar
            orientation="vertical"
            scrollPercentage={verticalScroll().percentage}
            thumbSize={verticalScroll().thumbSize}
            visible={verticalScroll().thumbSize < 100}
            onScrollbarClick={handleVerticalScrollbarClick}
          />
        </Show>
        <Show when={showHorizontal()}>
          <Scrollbar
            orientation="horizontal"
            scrollPercentage={horizontalScroll().percentage}
            thumbSize={horizontalScroll().thumbSize}
            visible={horizontalScroll().thumbSize < 100}
            onScrollbarClick={handleHorizontalScrollbarClick}
          />
        </Show>
      </Show>
    </div>
  )
}
