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
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard/grupos', label: 'Grupos', icon: Users },
  { href: '/dashboard/fixture', label: 'Fixture', icon: CalendarDays },
  { href: '/dashboard/predicciones', label: 'Predicciones', icon: Target },
  { href: '/dashboard/bracket', label: 'Bracket', icon: Swords },
  { href: '/dashboard/tabla', label: 'Tabla', icon: Table2 },
]

function getInitials() {
  const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(r => r.startsWith('sb-access-token='))?.split('=')[1] : null
  return 'A'
}

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/dashboard/grupos" className="mr-8 flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-red text-white">
            <Trophy className="h-4 w-4" />
          </div>
          <span className="font-bold text-base tracking-tight">
            Prode <span className="text-brand-red">2026</span>
          </span>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <form action="/auth/logout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </form>
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-brand-red text-white text-xs font-bold">A</AvatarFallback>
          </Avatar>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-1"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="container py-2 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            <Separator />
            <form action="/auth/logout" method="post">
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}
