// packages/ui/src/solid/components/Modal.tsx

import { Component, JSX, Show, splitProps, createEffect, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'
import { cn } from '../lib/utils'
import { X } from 'lucide-solid'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: JSX.Element
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

interface ModalHeaderProps {
  title: string
  onClose?: () => void
  showCloseButton?: boolean
  children?: JSX.Element
}

interface ModalFooterProps {
  children: JSX.Element
}

interface ModalBodyProps {
  children: JSX.Element
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

export const Modal: Component<ModalProps> = (props) => {
  const size = () => props.size ?? 'md'
  const showCloseButton = () => props.showCloseButton ?? true
  const closeOnBackdrop = () => props.closeOnBackdrop ?? true
  const closeOnEscape = () => props.closeOnEscape ?? true

  createEffect(() => {
    if (!closeOnEscape()) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.isOpen) {
        props.onClose()
      }
    }

    if (props.isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    })
  })

  const handleBackdropClick = (e: MouseEvent) => {
    if (closeOnBackdrop() && e.target === e.currentTarget) {
      props.onClose()
    }
  }

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class="fixed inset-0 z-50">
          <div
            class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cursor-pointer"
            onClick={handleBackdropClick}
          />
          <div class="fixed inset-0 flex items-center justify-center p-4">
            <div
              class={cn(
                'relative w-full bg-card rounded-lg shadow-xl max-h-[90vh] flex flex-col',
                sizeClasses[size()]
              )}
            >
              <Show when={props.title}>
                <ModalHeader
                  title={props.title!}
                  onClose={props.onClose}
                  showCloseButton={showCloseButton()}
                />
              </Show>
              <div class="flex-1 overflow-y-auto">
                {props.children}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

export const ModalHeader: Component<ModalHeaderProps> = (props) => {
  const showCloseButton = () => props.showCloseButton ?? true

  return (
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div>
        <h3 class="text-lg font-semibold text-foreground">{props.title}</h3>
        {props.children}
      </div>
      <Show when={showCloseButton() && props.onClose}>
        <button
          onClick={props.onClose}
          class="text-muted-foreground hover:text-muted-foreground transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </Show>
    </div>
  )
}

export const ModalBody: Component<ModalBodyProps> = (props) => {
  return <div class="p-6">{props.children}</div>
}

export const ModalFooter: Component<ModalFooterProps> = (props) => {
  return (
    <div class="flex items-center justify-end space-x-3 p-6 border-t border-border">
      {props.children}
    </div>
  )
}
