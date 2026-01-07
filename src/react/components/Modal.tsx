// packages/ui/src/components/Modal.tsx

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '.pnpm/@tanstack-app+ui@file+..+ui_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/@tanstack-app/ui/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

interface ModalHeaderProps {
  title: string
  onClose?: () => void
  showCloseButton?: boolean
  children?: React.ReactNode
}

interface ModalFooterProps {
  children: React.ReactNode
}

interface ModalBodyProps {
  children: React.ReactNode
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true
}: ModalProps) {
  useEffect(() => {
    if (!closeOnEscape) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div className='fixed inset-0 z-50'>
      <div 
        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity cursor-pointer'
        onClick={handleBackdropClick}
      />
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <div 
          className={cn(
            'relative w-full bg-card rounded-lg shadow-xl max-h-[90vh] flex flex-col',
            sizeClasses[size]
          )}
        >
          {title && (
            <ModalHeader 
              title={title} 
              onClose={onClose} 
              showCloseButton={showCloseButton}
            />
          )}
          <div className='flex-1 overflow-y-auto'>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function ModalHeader({ title, onClose, showCloseButton = true, children }: ModalHeaderProps) {
  return (
    <div className='flex items-center justify-between p-6 border-b border-border'>
      <div>
        <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
        {children}
      </div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className='text-muted-foreground hover:text-muted-foreground transition-colors cursor-pointer'
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}

export function ModalBody({ children }: ModalBodyProps) {
  return <div className='p-6'>{children}</div>
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className='flex items-center justify-end space-x-3 p-6 border-t border-border'>
      {children}
    </div>
  )
}
