'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SidebarCtx = { open: boolean; toggle: () => void }

const SidebarContext = createContext<SidebarCtx>({ open: true, toggle: () => {} })

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-open')
    if (stored !== null) setOpen(stored === 'true')
  }, [])

  const toggle = () =>
    setOpen(prev => {
      const next = !prev
      localStorage.setItem('sidebar-open', String(next))
      return next
    })

  return <SidebarContext.Provider value={{ open, toggle }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)
