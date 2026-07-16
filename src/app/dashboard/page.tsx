'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, CheckCircle2, Circle, Crown, Download, Medal, Shield, Smartphone, Sparkles, Target, Trophy, Users, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TeamFlag } from '@/components/team-flag'
import { formatPeruShortDateTime } from '@/lib/peru-time'
import { getAccessToken, createAnonClient, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'
import { ActivityFeed } from '@/components/activity-feed'
import { NotificationBanner } from '@/components/NotificationBanner'
import { UltimaChanceBanner } from './UltimaChanceBanner'

const quickLinks = [
  { href: '/dashboard/grupos',      title: 'Grupos',          description: 'Ver las 48 selecciones',  icon: Users },
  { href: '/dashboard/partidos',     title: 'Partidos',        description: 'Predecir partidos',        icon: CalendarDays },
  { href: '/dashboard/predicciones',title: 'Mis predicciones',description: 'Revisar tus picks',        icon: Target },
  { href: '/dashboard/tabla',       title: 'Tabla',           description: 'Ranking de jugadores',     icon: Medal },
]

const FLAGS_MARQUEE = [
  'br','ar','fr','es','de','pt','nl','be','it','hr',
  'jp','kr','mx','us','ca','sn','ma','pe','co','uy',
  'au','sa','dk','pl','ch','gb','pa','ec','ng','cm',
  'gh','ir','se','rs','py','bo','ve','cr','hn','tn',
  'za','ci','dz','ua','sk','qa','at','ro',
]

function getCountdown() {
  const WC = new Date('2026-06-11T22:00:00Z')
  const diff = WC.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:  Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins:  Math.floor((diff % 3_600_000) / 60_000),
    secs:  Math.floor((diff % 60_000) / 1_000),
  }
}

function WorldCupCountdown() {
  const [cd, setCd] = useState<{ days: number; hours: number; mins: number; secs: number } | null>(null)

  useEffect(() => {
    setCd(getCountdown())
    const t = setInterval(() => setCd(getCountdown()), 1_000)
    return () => clearInterval(t)
  }, [])

  if (!cd) return null

  return (
    <div
      className="relative overflow-hidden rounded-2xl border text-white"
      style={{ background: 'linear-gradient(135deg, #001F5B 0%, #002868 40%, #C8102E 100%)' }}
    >
      {/* Hex pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dhex" x="0" y="0" width="40" height="70" patternUnits="userSpaceOnUse">
              <polygon points="20,2 38,12 38,32 20,42 2,32 2,12" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dhex)"/>
        </svg>
      </div>

      <div className="relative px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: label */}
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce-subtle">⚽</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Cuenta regresiva</p>
              <p className="font-bebas text-xl tracking-wide">Mundial FIFA 2026 · 11 jun · Azteca</p>
            </div>
          </div>

          {/* Right: digits */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
            {[
              { val: cd.days,  label: 'días'  },
              { val: cd.hours, label: 'horas' },
              { val: cd.mins,  label: 'min'   },
              { val: cd.secs,  label: 'seg'   },
            ].map((u, i) => (
              <div key={u.label} className="flex items-center gap-1.5 sm:gap-3">
                {i > 0 && <span className="text-white/30 font-bold">:</span>}
                <div className="flex flex-col items-center rounded-xl bg-white/10 px-2.5 py-1.5 min-w-[2.5rem] sm:min-w-[3rem] backdrop-blur-sm">
                  <span className="font-bebas text-xl sm:text-3xl tabular-nums leading-none">{String(u.val).padStart(2,'0')}</span>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/50">{u.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InstallAppBanner() {
  const [prompt, setPrompt] = useState<any>(null)
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other')
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Already running as installed PWA — hide banner
    if (window.matchMedia('(display-mode: standalone)').matches) return
    const ua = navigator.userAgent
    if (/iphone|ipad|ipod/i.test(ua)) {
      setPlatform('ios')
    } else {
      setPlatform('android')
    }
    const handler = (e: any) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleClick() {
    if (prompt) {
      prompt.prompt()
      await prompt.userChoice
      setPrompt(null)
    } else {
      setShowSteps((v) => !v)
    }
  }

  return (
    <div className="rounded-2xl border bg-gradient-to-r from-brand-red/5 to-brand-red/10 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Instalá la app</p>
          <p className="text-xs text-muted-foreground">Accedé directo desde tu pantalla de inicio</p>
        </div>
        <button
          onClick={handleClick}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:scale-95 transition-all"
        >
          <Download className="h-4 w-4" />
          Instalar
        </button>
      </div>
      {showSteps && (
        <div className="mt-3 rounded-xl border bg-card p-3 space-y-1.5">
          {platform === 'ios' ? (
            <>
              <p className="text-xs font-semibold text-foreground">Pasos para iPhone/iPad (Safari):</p>
              <p className="text-xs text-muted-foreground">1. Tocá el ícono <strong>Compartir</strong> <span className="bg-muted px-1 rounded">⎙</span></p>
              <p className="text-xs text-muted-foreground">2. Tocá <strong>"Agregar a pantalla de inicio"</strong></p>
              <p className="text-xs text-muted-foreground">3. Tocá <strong>Agregar</strong> arriba a la derecha</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-foreground">Pasos para Android (Chrome):</p>
              <p className="text-xs text-muted-foreground">1. Tocá el menú <strong>⋮</strong> arriba a la derecha</p>
              <p className="text-xs text-muted-foreground">2. Tocá <strong>"Agregar a pantalla de inicio"</strong> o <strong>"Instalar app"</strong></p>
              <p className="text-xs text-muted-foreground">3. Confirmá tocando <strong>Instalar</strong></p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function FlagMarquee() {
  const doubled = [...FLAGS_MARQUEE, ...FLAGS_MARQUEE]
  return (
    <div className="overflow-hidden rounded-xl border bg-muted/30 py-2.5">
      <div className="flex animate-marquee-fast whitespace-nowrap">
        {doubled.map((flag, i) => (
          <img key={i} src={`https://flagcdn.com/w40/${flag}.png`} alt="" className="mx-2 h-5 w-8 rounded-sm object-cover shadow-sm" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [leaders, setLeaders] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasRuletaAccess, setHasRuletaAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userPredCount, setUserPredCount] = useState<number | null>(null)
  const [userGroupPredCount, setUserGroupPredCount] = useState<number | null>(null)
  const [userPoolCount, setUserPoolCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createAnonClient()

    Promise.all([
      supabase.from('teams').select('id, name_es, code, flag_emoji, group_name').order('group_name').order('name_es'),
      supabase
        .from('matches')
        .select('id, match_date, group_name, status, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code)')
        .eq('stage', 'group')
        .order('match_date', { ascending: true }),
      supabase.from('leaderboard').select('id, username, total_points, position').order('position').limit(5),
    ]).then(([teamsResult, matchesResult, leadersResult]) => {
      setTeams(teamsResult.data ?? [])
      setMatches(matchesResult.data ?? [])
      setLeaders(leadersResult.data ?? [])
      setLoading(false)
    })

    const token = getAccessToken()
    if (token) {
      const authClient = createAuthedClient(token)
      getCurrentUserId(token).then((userId) => {
        if (!userId) return
        authClient.from('profiles').select('role').eq('id', userId).single().then(async ({ data: profile }) => {
          const admin = profile?.role === 'admin'
          setIsAdmin(admin)
          if (!admin) {
            const [accessRes, configRes] = await Promise.all([
              authClient.from('ruleta_access').select('enabled').eq('user_id', userId).maybeSingle(),
              authClient.from('ruleta_config').select('is_active').eq('id', 1).maybeSingle(),
            ])
            setHasRuletaAccess(accessRes.data?.enabled === true && configRes.data?.is_active === true)
          } else {
            setHasRuletaAccess(true)
          }
        })
        Promise.all([
          authClient.from('predictions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          authClient.from('group_predictions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          authClient.from('pool_members').select('pool_id', { count: 'exact', head: true }).eq('user_id', userId).catch(() => ({ count: 0 })),
        ]).then(([predsRes, groupPredsRes, poolsRes]) => {
          setUserPredCount(predsRes.count ?? 0)
          setUserGroupPredCount(groupPredsRes.count ?? 0)
          setUserPoolCount((poolsRes as any).count ?? 0)
        })
      })
    }
  }, [])

  const groupCount = useMemo(() => new Set(teams.map((team) => team.group_name)).size, [teams])
  const nextMatches = matches.filter((match) => match.status !== 'finished').slice(0, 4)
  const featuredTeams = teams.slice(0, 10)

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando dashboard...</div>

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Notification banners (point adjustments, etc.) */}
      <NotificationBanner />

      {/* Última chance: distancia al líder antes de los últimos partidos */}
      <UltimaChanceBanner />

      {/* Countdown */}
      <WorldCupCountdown />

      {/* Flag strip */}
      <FlagMarquee />

      {/* Hero card */}
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-5 sm:p-7 lg:p-8">
            <Badge className="mb-4 bg-brand-red text-white hover:bg-brand-red">Copa Mundial FIFA 2026</Badge>
            <h1 className="max-w-2xl font-bebas text-2xl tracking-wide sm:text-4xl lg:text-5xl xl:text-6xl">
              Tu centro de predicciones del Mundial
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Revisa grupos, completa tus pronósticos y sigue la tabla de posiciones desde un solo lugar.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/dashboard/partidos" className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-red px-4 text-sm font-medium text-white transition-colors hover:bg-red-700">
                Ver partidos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/dashboard/grupos" className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted">
                Ver grupos
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {featuredTeams.map((team) => (
                <div key={team.id} className="flex items-center gap-2 rounded-full border bg-background px-2.5 py-1.5 text-xs shadow-sm">
                  <TeamFlag code={team.flag_emoji} label={team.name_es} className="h-4 w-6" />
                  <span className="font-semibold">{team.code}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t bg-muted/30 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Equipos',  value: teams.length },
                { label: 'Grupos',   value: groupCount },
                { label: 'Partidos', value: matches.length },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border bg-card p-3 text-center shadow-sm">
                  <div className="text-2xl font-extrabold tabular-nums">{item.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Próximos partidos</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Hora Perú</span>
                  <Link href="/dashboard/partidos" className="text-xs font-medium text-brand-red hover:underline">Ver todos</Link>
                </div>
              </div>
              <div className="space-y-3">
                {nextMatches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todavía no hay partidos cargados.</p>
                ) : (
                  nextMatches.map((match) => (
                    <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                      <div className="flex min-w-0 items-center justify-end gap-2">
                        <span className="truncate font-medium">{match.home_team?.code}</span>
                        <TeamFlag code={match.home_team?.flag_emoji} label={match.home_team?.name_es} />
                      </div>
                      <div className="text-center text-[11px] text-muted-foreground">
                        {formatPeruShortDateTime(match.match_date)}
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <TeamFlag code={match.away_team?.flag_emoji} label={match.away_team?.name_es} />
                        <span className="truncate font-medium">{match.away_team?.code}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[...quickLinks, ...(isAdmin ? [{ href: '/admin', title: 'Admin', description: 'Gestionar torneo', icon: Shield }] : [])].map((item) => (
          <Link key={item.href} href={item.href} className="group rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand-red" />
            </div>
          </Link>
        ))}
      </section>

      {/* Onboarding checklist */}
      {userPredCount !== null && (userPredCount < 5 || userGroupPredCount === 0 || userPoolCount === 0) && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-sm font-semibold">🚀 Primeros pasos</h2>
          <div className="space-y-2">
            {[
              { done: (userGroupPredCount ?? 0) > 0, label: 'Completá tus pronósticos de grupo', desc: 'Predecí las posiciones de los 9 grupos', href: '/dashboard/pronosticos' },
              { done: (userPredCount ?? 0) >= 5,      label: 'Predecí al menos 5 partidos',       desc: `Ya tenés ${userPredCount ?? 0} predicción${(userPredCount ?? 0) !== 1 ? 'es' : ''} · meta: 5`, href: '/dashboard/partidos' },
              { done: (userPoolCount ?? 0) > 0,       label: 'Unite a una polla',                  desc: 'Competí con tus amigos',              href: '/dashboard/pollas' },
            ].map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${step.done ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20' : 'hover:bg-muted/50'}`}
              >
                {step.done
                  ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold leading-tight ${step.done ? 'line-through text-muted-foreground' : ''}`}>{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                {!step.done && <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ruleta card — solo para usuarios con acceso */}
      {hasRuletaAccess && (
        <Link href="/dashboard/ruleta" className="group block overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, #1e0a0a 0%, #3a0a0a 40%, #1a0000 100%)' }}>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-red/80 text-white shadow-sm text-2xl">
              🎡
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Disponible para vos</p>
              <p className="mt-0.5 font-bebas text-lg tracking-wide text-white">Ruleta MundialCoins</p>
              <p className="text-xs text-white/60">Girá y ganate puntos del torneo</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="h-5 w-5 text-amber-400 group-hover:animate-spin" />
              <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
            </div>
          </div>
        </Link>
      )}

      {/* Resumen del torneo (Wrapped) */}
      <Link href="/dashboard/resumen" className="group block overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 55%, #be185d 100%)' }}>
        <div className="flex items-center gap-4 px-5 py-4 text-white">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur text-2xl">
            🎁
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Nuevo</p>
            <p className="mt-0.5 font-bebas text-lg tracking-wide">Tu Resumen del Torneo</p>
            <p className="text-xs text-white/60">Tus stats, tu mejor partido y tu equipo de confianza — para capturar y compartir</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </Link>

      {/* Pronósticos callout */}
      <Link href="/dashboard/pronosticos" className="group block overflow-hidden rounded-2xl border bg-gradient-to-r from-brand-gold/10 to-brand-red/10 p-4 shadow-sm transition hover:shadow-md sm:p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-white shadow-sm">
            <Crown className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pronósticos del Mundial</p>
            <p className="mt-1 text-sm font-semibold">Predecí grupos, campeón, Bota de Oro y más →</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand-red" />
        </div>
      </Link>

      {/* Activity feed */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand-red" />
          <h2 className="text-sm font-semibold">Actividad reciente</h2>
        </div>
        <ActivityFeed />
      </section>

      {/* Groups + leaderboard */}
      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-brand-red" />
              Grupos destacados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from(new Set(teams.map((t) => t.group_name))).slice(0, 3).map((group) => {
                const groupTeams = teams.filter((team) => team.group_name === group)
                return (
                  <div key={group} className="rounded-xl border p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">Grupo {group}</h3>
                      <Badge variant="secondary">{groupTeams.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {groupTeams.map((team) => (
                        <div key={team.id} className="flex items-center gap-2 text-sm">
                          <TeamFlag code={team.flag_emoji} label={team.name_es} />
                          <span className="min-w-0 flex-1 truncate font-medium">{team.name_es}</span>
                          <span className="font-mono text-xs text-muted-foreground">{team.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Medal className="h-4 w-4 text-brand-red" />
              Tabla rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay jugadores en la tabla.</p>
            ) : (
              <div className="space-y-2">
                {leaders.map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold">{leader.position}</span>
                      <span className="text-sm font-semibold">{leader.username}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{leader.total_points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Install app banner */}
      <InstallAppBanner />

    </div>
  )
}
