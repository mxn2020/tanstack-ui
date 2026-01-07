// packages/ui/src/solid/components/Resizable.tsx
import {
  createContext,
  useContext,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  children as resolveChildren,
  JSX,
  ParentProps,
  splitProps,
  mergeProps
} from 'solid-js'
import { cn } from '../lib/utils'

// ============================================================================
// TYPES
// ============================================================================

type Direction = 'horizontal' | 'vertical'
type PanelConstraint = { min?: number; max?: number; default?: number }

interface ResizableContextValue {
  direction: Direction
  registerPanel: (id: string, constraint: PanelConstraint) => void
  unregisterPanel: (id: string) => void
  getPanelSize: (id: string) => number
  updatePanelSize: (id: string, size: number) => void
  startResize: (handleId: string) => void
  activeHandleId: () => string | null
}

interface PanelData {
  id: string
  size: number
  constraint: PanelConstraint
}

// ============================================================================
// CONTEXT
// ============================================================================

const ResizableContext = createContext<ResizableContextValue>()

const useResizableContext = () => {
  const context = useContext(ResizableContext)
  if (!context) {
    throw new Error('Resizable compound components must be used within a ResizablePanelGroup')
  }
  return context
}

// ============================================================================
// RESIZABLE PANEL GROUP (ROOT)
// ============================================================================

interface ResizablePanelGroupProps extends ParentProps<JSX.HTMLAttributes<HTMLDivElement>> {
  direction?: Direction
  class?: string
  autoSaveId?: string
  onLayout?: (sizes: number[]) => void
}

export const ResizablePanelGroup = (props: ResizablePanelGroupProps) => {
  const merged = mergeProps({ direction: 'horizontal' as Direction }, props)
  const [local, others] = splitProps(merged, [
    'children',
    'direction',
    'class',
    'autoSaveId',
    'onLayout',
    'ref'
  ])

  let containerRef: HTMLDivElement | undefined
  const [panels, setPanels] = createSignal<Map<string, PanelData>>(new Map())
  const [activeHandleId, setActiveHandleId] = createSignal<string | null>(null)
  let isDragging = false

  // Register panel
  const registerPanel = (id: string, constraint: PanelConstraint) => {
    setPanels((prev) => {
      const newPanels = new Map(prev)

      // Load from localStorage if autoSaveId is provided
      let size = constraint.default ?? 50
      if (local.autoSaveId) {
        const saved = localStorage.getItem(`resizable-${local.autoSaveId}-${id}`)
        if (saved) {
          const savedSize = parseFloat(saved)
          if (!isNaN(savedSize)) {
            size = savedSize
          }
        }
      }

      newPanels.set(id, { id, size, constraint })
      return newPanels
    })
  }

  // Unregister panel
  const unregisterPanel = (id: string) => {
    setPanels((prev) => {
      const newPanels = new Map(prev)
      newPanels.delete(id)
      return newPanels
    })
  }

  // Get panel size
  const getPanelSize = (id: string) => {
    return panels().get(id)?.size ?? 50
  }

  // Update panel size
  const updatePanelSize = (id: string, size: number) => {
    setPanels((prev) => {
      const newPanels = new Map(prev)
      const panel = newPanels.get(id)
      if (panel) {
        // Apply constraints
        let constrainedSize = size
        if (panel.constraint.min !== undefined) {
          constrainedSize = Math.max(constrainedSize, panel.constraint.min)
        }
        if (panel.constraint.max !== undefined) {
          constrainedSize = Math.min(constrainedSize, panel.constraint.max)
        }

        newPanels.set(id, { ...panel, size: constrainedSize })

        // Save to localStorage if autoSaveId is provided
        if (local.autoSaveId) {
          localStorage.setItem(
            `resizable-${local.autoSaveId}-${id}`,
            constrainedSize.toString()
          )
        }
      }
      return newPanels
    })
  }

  // Start resize
  const startResize = (handleId: string) => {
    setActiveHandleId(handleId)
    isDragging = true
  }

  // Call onLayout when sizes change
  createEffect(() => {
    if (local.onLayout) {
      const sizes = Array.from(panels().values()).map((p) => p.size)
      local.onLayout(sizes)
    }
  })

  // Global mouse/touch up handler
  onMount(() => {
    const handleUp = () => {
      if (isDragging) {
        setActiveHandleId(null)
        isDragging = false
      }
    }

    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchend', handleUp)

    onCleanup(() => {
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchend', handleUp)
    })
  })

  const contextValue: ResizableContextValue = {
    direction: local.direction,
    registerPanel,
    unregisterPanel,
    getPanelSize,
    updatePanelSize,
    startResize,
    activeHandleId,
  }

  return (
    <ResizableContext.Provider value={contextValue}>
      <div
        ref={(el) => {
          containerRef = el
          if (typeof local.ref === 'function') {
            local.ref(el)
          } else if (local.ref) {
            local.ref = el
          }
        }}
        class={cn(
          'flex w-full h-full overflow-hidden',
          local.direction === 'horizontal' ? 'flex-row' : 'flex-col',
          local.class
        )}
        data-panel-group=""
        data-direction={local.direction}
        {...others}
      >
        {local.children}
      </div>
    </ResizableContext.Provider>
  )
}

// ============================================================================
// RESIZABLE PANEL
// ============================================================================

interface ResizablePanelProps extends ParentProps<JSX.HTMLAttributes<HTMLDivElement>> {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  class?: string
  id?: string
  collapsible?: boolean
  collapsedSize?: number
  onCollapse?: () => void
  onExpand?: () => void
}

export const ResizablePanel = (props: ResizablePanelProps) => {
  const merged = mergeProps({ defaultSize: 50, collapsible: false, collapsedSize: 0 }, props)
  const [local, others] = splitProps(merged, [
    'children',
    'defaultSize',
    'minSize',
    'maxSize',
    'class',
    'id',
    'collapsible',
    'collapsedSize',
    'onCollapse',
    'onExpand',
    'ref'
  ])

  const { direction, registerPanel, unregisterPanel, getPanelSize } = useResizableContext()
  const [panelId] = createSignal(local.id || `panel-${Math.random().toString(36).substr(2, 9)}`)
  const [isCollapsed, setIsCollapsed] = createSignal(false)

  // Register on mount
  onMount(() => {
    registerPanel(panelId(), {
      min: local.minSize,
      max: local.maxSize,
      default: local.defaultSize,
    })

    onCleanup(() => {
      unregisterPanel(panelId())
    })
  })

  const size = () => getPanelSize(panelId())

  // Handle collapse
  createEffect(() => {
    const currentSize = size()
    if (local.collapsible && currentSize <= local.collapsedSize + 1) {
      if (!isCollapsed()) {
        setIsCollapsed(true)
        local.onCollapse?.()
      }
    } else {
      if (isCollapsed()) {
        setIsCollapsed(false)
        local.onExpand?.()
      }
    }
  })

  const style = () =>
    direction === 'horizontal'
      ? { width: `${size()}%`, 'flex-shrink': 0 }
      : { height: `${size()}%`, 'flex-shrink': 0 }

  return (
    <div
      ref={local.ref}
      class={cn(
        'relative overflow-auto',
        isCollapsed() && 'overflow-hidden',
        local.class
      )}
      style={style()}
      data-panel=""
      data-panel-id={panelId()}
      data-panel-size={size()}
      data-panel-collapsed={isCollapsed()}
      {...others}
    >
      {local.children}
    </div>
  )
}

// ============================================================================
// RESIZABLE HANDLE
// ============================================================================

interface ResizableHandleProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string
  withHandle?: boolean
  disabled?: boolean
  onDragging?: (isDragging: boolean) => void
}

export const ResizableHandle = (props: ResizableHandleProps) => {
  const merged = mergeProps({ withHandle: false, disabled: false }, props)
  const [local, others] = splitProps(merged, [
    'class',
    'withHandle',
    'disabled',
    'onDragging',
    'ref',
    'onMouseDown',
    'onTouchStart'
  ])

  const { direction, startResize, activeHandleId, updatePanelSize } = useResizableContext()
  const [handleId] = createSignal(`handle-${Math.random().toString(36).substr(2, 9)}`)
  const [isDragging, setIsDragging] = createSignal(false)

  let containerRef: HTMLDivElement | undefined
  let startPos = 0
  let panelBefore: { id: string; initialSize: number } | null = null
  let panelAfter: { id: string; initialSize: number } | null = null

  // Track active dragging state
  createEffect(() => {
    const isActive = activeHandleId() === handleId()
    if (isDragging() !== isActive) {
      setIsDragging(isActive)
      local.onDragging?.(isActive)
    }
  })

  // Handle mouse/touch down
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (local.disabled) return

    const handle = containerRef
    if (!handle) return

    // Find adjacent panels
    const panelGroup = handle.closest('[data-panel-group]')
    if (!panelGroup) return

    const allPanels = Array.from(panelGroup.querySelectorAll('[data-panel]'))
    const handleIndex = Array.from(panelGroup.children).indexOf(handle)

    const panelBeforeEl = allPanels[Math.floor(handleIndex / 2)] as HTMLElement
    const panelAfterEl = allPanels[Math.ceil(handleIndex / 2)] as HTMLElement

    if (!panelBeforeEl || !panelAfterEl) return

    const panelBeforeId = panelBeforeEl.getAttribute('data-panel-id')
    const panelAfterId = panelAfterEl.getAttribute('data-panel-id')

    if (!panelBeforeId || !panelAfterId) return

    const panelBeforeSize = parseFloat(panelBeforeEl.getAttribute('data-panel-size') || '50')
    const panelAfterSize = parseFloat(panelAfterEl.getAttribute('data-panel-size') || '50')

    panelBefore = { id: panelBeforeId, initialSize: panelBeforeSize }
    panelAfter = { id: panelAfterId, initialSize: panelAfterSize }

    startPos = direction === 'horizontal' ? clientX : clientY
    startResize(handleId())
  }

  const handleMouseDown: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    e.preventDefault()
    handlePointerDown(e.clientX, e.clientY)
    if (local.onMouseDown && typeof local.onMouseDown === 'function') {
      local.onMouseDown(e)
    }
  }

  const handleTouchStart: JSX.EventHandler<HTMLDivElement, TouchEvent> = (e) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    if (touch) {
      handlePointerDown(touch.clientX, touch.clientY)
    }
    if (local.onTouchStart && typeof local.onTouchStart === 'function') {
      local.onTouchStart(e)
    }
  }

  // Handle mouse/touch move
  createEffect(() => {
    if (!isDragging()) return

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!panelBefore || !panelAfter) return

      const handle = containerRef
      const panelGroup = handle?.closest('[data-panel-group]')
      if (!panelGroup) return

      const rect = panelGroup.getBoundingClientRect()
      const totalSize = direction === 'horizontal' ? rect.width : rect.height

      let currentPos: number
      if (e instanceof MouseEvent) {
        currentPos = direction === 'horizontal' ? e.clientX : e.clientY
      } else {
        if (e.touches.length !== 1) return
        const touch = e.touches[0]
        if (!touch) return
        currentPos = direction === 'horizontal' ? touch.clientX : touch.clientY
      }

      const delta = currentPos - startPos
      const deltaPercent = (delta / totalSize) * 100

      const newBeforeSize = panelBefore.initialSize + deltaPercent
      const newAfterSize = panelAfter.initialSize - deltaPercent

      updatePanelSize(panelBefore.id, newBeforeSize)
      updatePanelSize(panelAfter.id, newAfterSize)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove)

    onCleanup(() => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
    })
  })

  const isHorizontal = () => direction === 'horizontal'

  return (
    <div
      ref={(el) => {
        containerRef = el
        if (typeof local.ref === 'function') {
          local.ref(el)
        } else if (local.ref) {
          local.ref = el
        }
      }}
      class={cn(
        'relative flex items-center justify-center bg-border transition-colors',
        isHorizontal()
          ? 'w-1 cursor-col-resize hover:bg-blue-400'
          : 'h-1 cursor-row-resize hover:bg-blue-400',
        isDragging() && 'bg-blue-500',
        local.disabled && 'cursor-not-allowed opacity-50 hover:bg-border',
        local.class
      )}
      data-panel-resize-handle=""
      data-direction={direction}
      data-disabled={local.disabled}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="separator"
      aria-orientation={direction}
      aria-disabled={local.disabled}
      tabIndex={local.disabled ? -1 : 0}
      {...others}
    >
      {local.withHandle && (
        <div
          class={cn(
            'absolute z-10 flex items-center justify-center rounded-sm border border-border bg-border',
            isHorizontal() ? 'h-8 w-2.5 flex-col' : 'h-2.5 w-8 flex-row'
          )}
        >
          <div
            class={cn(
              'rounded-full bg-muted-foreground',
              isHorizontal() ? 'h-1 w-1 my-0.5' : 'w-1 h-1 mx-0.5'
            )}
          />
          <div
            class={cn(
              'rounded-full bg-muted-foreground',
              isHorizontal() ? 'h-1 w-1 my-0.5' : 'w-1 h-1 mx-0.5'
            )}
          />
          <div
            class={cn(
              'rounded-full bg-muted-foreground',
              isHorizontal() ? 'h-1 w-1 my-0.5' : 'w-1 h-1 mx-0.5'
            )}
          />
        </div>
      )}
    </div>
  )
}
