'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Trophy,
  Users,
  CalendarDays,
  Target,
  Table2,
  Swords,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard/grupos', label: 'Grupos', icon: Users },
  { href: '/dashboard/fixture', label: 'Fixture', icon: CalendarDays },
  { href: '/dashboard/predicciones', label: 'Predicciones', icon: Target },
  { href: '/dashboard/bracket', label: 'Bracket', icon: Swords },
  { href: '/dashboard/tabla', label: 'Tabla', icon: Table2 },
]

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/dashboard/grupos" className="mr-6 flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-brand-gold" />
          <span className="hidden font-bold sm:inline-block">Prode 2026</span>
        </Link>

        {/* Desktop nav */}
        <div className="mr-6 hidden md:flex md:items-center md:space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname.startsWith('/admin') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        </div>

        {/* Mobile menu button */}
        <button
          className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="container py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname.startsWith('/admin') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
