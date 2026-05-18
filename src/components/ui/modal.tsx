'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          'relative w-full max-w-lg rounded-xl border bg-card p-6 text-card-foreground shadow-lg',
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>
        {title && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
            {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
