// src/components/ui/helpers.ts

import React from 'react'

export type AnyRef<T> = React.Ref<T> | undefined

export function setRef<T>(ref: React.MutableRefObject<T | null>) {
  return (node: T | null) => {
    ref.current = node
  }
}

export function mergeRefs<T>(...refs: AnyRef<T>[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue
      if (typeof ref === 'function') ref(node)
      else (ref as React.MutableRefObject<T | null>).current = node
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
