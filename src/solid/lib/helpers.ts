// packages/ui/src/solid/lib/helpers.ts

export function mergeRefs<T>(...refs: Array<T | ((el: T) => void) | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') {
        (ref as (el: T) => void)(node)
      } else {
        (ref as any) = node
      }
    }
  }
}

export function composeEventHandlers<E>(
  userHandler: ((event: E) => void) | undefined,
  ourHandler: (event: E) => void
) {
  return (event: E) => {
    userHandler?.(event)
    if (event && typeof event === 'object' && 'defaultPrevented' in event && event.defaultPrevented) return
    ourHandler(event)
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function getPortalContainer() {
  if (typeof document === 'undefined') return null
  return document.body
}
