// packages/ui/src/solid/components/Avatar.tsx

import { Component, JSX, splitProps, createSignal, createEffect, Show } from 'solid-js'
import { cn } from '../lib/utils'

interface AvatarProps {
  children: JSX.Element
  class?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-20 w-20',
}

export const Avatar: Component<AvatarProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'size', 'ref'])
  
  const avatarClassName = () => cn('relative flex shrink-0 overflow-hidden rounded-full', sizeClasses[local.size ?? 'md'], local.class)

  return (
    <div ref={local.ref} class={avatarClassName()} {...others}>
      {local.children}
    </div>
  )
}

interface AvatarImageProps {
  src?: string
  alt?: string
  class?: string
  onLoadingStatusChange?: (status: 'idle' | 'loading' | 'loaded' | 'error') => void
  ref?: HTMLImageElement | ((el: HTMLImageElement) => void)
}

export const AvatarImage: Component<AvatarImageProps> = (props) => {
  const [local, others] = splitProps(props, ['src', 'alt', 'class', 'onLoadingStatusChange', 'ref'])
  const [imageLoadingStatus, setImageLoadingStatus] = createSignal<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  const handleLoad = () => {
    setImageLoadingStatus('loaded')
    local.onLoadingStatusChange?.('loaded')
  }

  const handleError = () => {
    setImageLoadingStatus('error')
    local.onLoadingStatusChange?.('error')
  }

  const handleLoadStart = () => {
    setImageLoadingStatus('loading')
    local.onLoadingStatusChange?.('loading')
  }

  return (
    <Show when={local.src}>
      <img
        ref={local.ref}
        src={local.src}
        alt={local.alt}
        class={cn('aspect-square h-full w-full object-cover', local.class)}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        style={{ display: imageLoadingStatus() === 'loaded' ? 'block' : 'none' }}
        {...others}
      />
    </Show>
  )
}

interface AvatarFallbackProps {
  children: JSX.Element
  class?: string
  delayMs?: number
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const AvatarFallback: Component<AvatarFallbackProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'class', 'delayMs', 'ref'])
  const [canRender, setCanRender] = createSignal((local.delayMs ?? 0) === 0)

  createEffect(() => {
    const delay = local.delayMs ?? 0
    if (delay <= 0) return
    const timer = setTimeout(() => setCanRender(true), delay)
    return () => clearTimeout(timer)
  })

  return (
    <Show when={canRender()}>
      <div
        ref={local.ref}
        class={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-surface text-muted-foreground font-medium',
          local.class
        )}
        {...others}
      >
        {local.children}
      </div>
    </Show>
  )
}

export const getAvatarInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

interface CompoundAvatarProps {
  src?: string
  alt?: string
  name?: string
  fallback?: JSX.Element
  class?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showFallback?: boolean
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void)
}

export const CompoundAvatar: Component<CompoundAvatarProps> = (props) => {
  const [local, others] = splitProps(props, ['src', 'alt', 'name', 'fallback', 'class', 'size', 'showFallback', 'ref'])
  const [imageStatus, setImageStatus] = createSignal<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  const shouldShowFallback = () => (local.showFallback ?? true) && (!local.src || imageStatus() === 'error')
  const initials = () => local.name ? getAvatarInitials(local.name) : ''
  const displayAlt = () => local.alt || local.name || 'Avatar'

  const handleImageStatusChange = (status: 'idle' | 'loading' | 'loaded' | 'error') => {
    setImageStatus(status)
  }

  return (
    <Avatar ref={local.ref} class={local.class} size={local.size} {...others}>
      <Show when={local.src}>
        <AvatarImage src={local.src} alt={displayAlt()} onLoadingStatusChange={handleImageStatusChange} />
      </Show>
      <Show when={shouldShowFallback()}>
        <AvatarFallback>
          {local.fallback || initials() || displayAlt().charAt(0).toUpperCase()}
        </AvatarFallback>
      </Show>
    </Avatar>
  )
}

