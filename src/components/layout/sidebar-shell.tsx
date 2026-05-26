'use client'

import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'

export function SidebarShell({ children, maxWidth = 'max-w-5xl' }: { children: React.ReactNode; maxWidth?: string }) {
  const { open } = useSidebar()
  return (
    <div className={cn('flex flex-1 flex-col transition-all duration-300', open ? 'lg:pl-64' : 'lg:pl-0')}>
      <main className={cn('mx-auto w-full flex-1 px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:pb-10 lg:pt-8', maxWidth)}>
        {children}
      </main>
    </div>
  )
}
