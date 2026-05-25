'use client'

import React, { createContext, useContext, useState } from 'react'

interface AlbumContextType {
  isOpen: boolean
  openAlbum: () => void
  closeAlbum: () => void
}

const AlbumContext = createContext<AlbumContextType | undefined>(undefined)

export function AlbumProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AlbumContext.Provider value={{ isOpen, openAlbum: () => setIsOpen(true), closeAlbum: () => setIsOpen(false) }}>
      {children}
    </AlbumContext.Provider>
  )
}

export function useAlbum() {
  const context = useContext(AlbumContext)
  if (!context) throw new Error('useAlbum must be used within AlbumProvider')
  return context
}
