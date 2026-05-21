'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getAccessToken, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'
import {
  Trophy,
  LayoutDashboard,
  Users,
  BarChart3,
  CalendarDays,
  Target,
  Table2,
  LogOut,
  Menu,
  Shield,
  UserRound,
  Sun,
  Moon,
  Gem,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/components/theme-provider'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/grupos', label: 'Grupos', icon: Users },
  { href: '/dashboard/fixture', label: 'Fixture', icon: CalendarDays },
  { href: '/dashboard/predicciones', label: 'Predicciones', icon: Target },
  { href: '/dashboard/pronosticos', label: 'Pronósticos', icon: BarChart3 },
  { href: '/dashboard/pollas', label: 'Pollas', icon: Trophy },
  { href: '/dashboard/tabla', label: 'Tabla', icon: Table2 },
]

// Bottom nav shows most important 6 items
const bottomNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/fixture', label: 'Fixture', icon: CalendarDays },
  { href: '/dashboard/predicciones', label: 'Pred.', icon: Target },
  { href: '/dashboard/pronosticos', label: 'Pronóst.', icon: BarChart3 },
  { href: '/dashboard/pollas', label: 'Pollas', icon: Trophy },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Gem },
]

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const { resolved, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [detectedAdmin, setDetectedAdmin] = useState(isAdmin)
  const [username, setUsername] = useState('')
  const showAdmin = isAdmin || detectedAdmin

  useEffect(() => {
    if (isAdmin) return

    const token = getAccessToken()
    if (!token) return

    const supabase = createAuthedClient(token)
    getCurrentUserId(token).then((userId) => {
      if (!userId) return
      supabase
        .from('profiles')
        .select('role, username')
        .eq('id', userId)
        .single()
        .then(({ data: profile }) => {
          setDetectedAdmin(profile?.role === 'admin')
          if (profile?.username) setUsername(profile.username)
        })
    })
  }, [isAdmin])

  const mobileNavItems = useMemo(() => {
    return showAdmin ? [...navItems, { href: '/admin', label: 'Admin', icon: Shield }] : navItems
  }, [showAdmin])

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="mr-3 flex min-w-0 items-center gap-2 group lg:mr-8">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-red text-white">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="hidden font-bold text-base tracking-tight min-[380px]:inline">
              Mundial Perú <span className="text-brand-red">2026</span>
            </span>
          </Link>

          <div className="hidden min-[920px]:flex min-[920px]:items-center min-[920px]:gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
            {showAdmin && (
              <Link
                href="/admin"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
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

          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <Link href="/dashboard/perfil">
              <Button variant="ghost" size="sm" className="hidden gap-1.5 text-muted-foreground sm:inline-flex">
                <UserRound className="h-3.5 w-3.5" />
                <span>Perfil</span>
              </Button>
            </Link>
            <form action="/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="sm" className="hidden gap-1.5 text-muted-foreground sm:inline-flex">
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir</span>
              </Button>
            </form>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={resolved === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={resolved === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {resolved === 'dark'
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />}
            </button>

            <Link href="/dashboard/perfil" aria-label="Perfil">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-brand-red text-white text-xs font-bold">
                  {username ? username.charAt(0).toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="ml-1 min-[920px]:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {mobileOpen && (
          <div className="border-t bg-card min-[920px]:hidden">
            <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {mobileNavItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      active ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
              </div>
              <Separator className="my-3" />
              <Link
                href="/dashboard/perfil"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                <UserRound className="h-4 w-4" />
                Perfil
              </Link>
              <button
                onClick={() => { toggleTheme(); setMobileOpen(false) }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                {resolved === 'dark'
                  ? <><Sun className="h-4 w-4" /> Modo claro</>
                  : <><Moon className="h-4 w-4" /> Modo oscuro</>}
              </button>
              <form action="/auth/logout" method="post">
                <button className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] backdrop-blur min-[920px]:hidden">
        <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
          {bottomNavItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors',
                  active ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
