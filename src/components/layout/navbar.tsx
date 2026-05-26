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
  Shield,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
  { href: '/dashboard/reglas', label: 'Reglas', icon: BookOpen },
  { href: '/dashboard/tabla', label: 'Tabla', icon: Table2 },
]

const bottomNavItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/fixture', label: 'Fixture', icon: CalendarDays },
  { href: '/dashboard/predicciones', label: 'Pred.', icon: Target },
  { href: '/dashboard/pronosticos', label: 'Pronóst.', icon: BarChart3 },
  { href: '/dashboard/pollas', label: 'Pollas', icon: Trophy },
  { href: '/dashboard/tabla', label: 'Tabla', icon: Table2 },
]

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const { resolved, toggleTheme } = useTheme()
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

  const allNavItems = useMemo(
    () => showAdmin ? [...navItems, { href: '/admin', label: 'Admin', icon: Shield }] : navItems,
    [showAdmin]
  )

  return (
    <>
      {/* DESKTOP SIDEBAR (lg+) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col border-r bg-card">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b px-5">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="58" r="26" fill="#C8102E" />
            <ellipse cx="50" cy="58" rx="26" ry="9" fill="none" stroke="white" strokeWidth="1.5" opacity="0.35" />
            <line x1="24" y1="58" x2="76" y2="58" stroke="white" strokeWidth="1.5" opacity="0.35" />
            <ellipse cx="50" cy="58" rx="13" ry="26" fill="none" stroke="white" strokeWidth="1.5" opacity="0.35" />
            <path d="M37 32 Q37 21 50 19 Q63 21 63 32 L59 43 Q50 47 41 43 Z" fill="#FFD700" />
            <path d="M41 43 L43 51 L57 51 L59 43" fill="#C8A400" />
            <rect x="43" y="51" width="14" height="3" rx="1.5" fill="#C8A400" />
            <rect x="39" y="54" width="22" height="3" rx="1.5" fill="#C8A400" />
            <path d="M37 34 Q28 34 28 41 Q28 47 37 47" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <path d="M63 34 Q72 34 72 41 Q72 47 63 47" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="30" r="3" fill="#FFD700" opacity="0.7" />
          </svg>
          <div className="leading-none">
            <p className="font-bold text-sm tracking-tight">Mundial Perú</p>
            <p className="font-black text-brand-red text-[11px] tracking-[0.15em]">2026</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {allNavItems.map((item) => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="shrink-0 border-t px-3 py-3 space-y-0.5">
          <Separator className="mb-2" />
          <Link
            href="/dashboard/perfil"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              pathname === '/dashboard/perfil'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarFallback className="bg-brand-red text-white text-xs font-bold">
                {username ? username.charAt(0).toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{username || 'Perfil'}</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            {resolved === 'dark'
              ? <Sun className="h-4 w-4 shrink-0" />
              : <Moon className="h-4 w-4 shrink-0" />}
            {resolved === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>

          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Salir
            </button>
          </form>
        </div>
      </aside>

      {/* MOBILE TOP HEADER */}
      <header className="lg:hidden sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-red text-white">
            <Trophy className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-sm tracking-tight">
            Mundial <span className="text-brand-red">2026</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            {resolved === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link href="/dashboard/perfil">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-brand-red text-white text-xs font-bold">
                {username ? username.charAt(0).toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t bg-card/80 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
          {bottomNavItems.map((item) => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-all active:scale-95',
                  active
                    ? 'bg-brand-red/10 text-brand-red'
                    : 'text-muted-foreground hover:bg-secondary/50'
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
