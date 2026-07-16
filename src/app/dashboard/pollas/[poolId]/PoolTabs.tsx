'use client'

import { useState } from 'react'
import { Trophy, Swords, Crown, Medal, Award, Gem, ChevronRight } from 'lucide-react'
import { PoolMatchResults } from './PoolMatchResults'
import { MemberPredictionsModal } from './MemberPredictionsModal'

interface Member {
  user_id: string
  profile?: { username: string; total_points: number; avatar_url?: string }
}

interface Props {
  poolId: string
  members: Member[]
  myUserId: string
  prize1: number
  prize2: number
  prize3: number
}

function getPuestoFrase(idx: number, total: number): string {
  if (idx === 0) return '👑 El Profeta del grupo'
  if (idx === 1) return '🥈 Respirándole en la nuca'
  if (idx === 2) return '🥉 Colgado del podio'
  if (total > 3 && idx === total - 1) return '🔦 El farolito: alumbra desde el fondo'
  if (total > 4 && idx === total - 2) return '😬 Zona de vergüenza'
  const medio = ['⚔️ En tierra de nadie', '📈 Remontando (dice él)', '🎢 Sobreviviendo al torneo', '🧭 Buscando el rumbo']
  return medio[idx % medio.length]
}

export function PoolTabs({ poolId, members, myUserId, prize1, prize2, prize3 }: Props) {
  const [tab, setTab] = useState<'ranking' | 'resultados'>('ranking')

  const tabs = [
    { key: 'ranking'     as const, label: 'Clasificación', icon: Trophy  },
    { key: 'resultados'  as const, label: 'Resultados',    icon: Swords  },
  ]

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border bg-muted/40 p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === key
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Ranking tab */}
      {tab === 'ranking' && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Clasificación del grupo
          </h2>
          <div className="rounded-2xl border bg-card divide-y overflow-hidden shadow-sm">
            {members.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Aún no hay participantes.
              </p>
            ) : (
              members.map((member, idx) => {
                const isMe      = member.user_id === myUserId
                const points    = member.profile?.total_points ?? 0
                const prizeCoins = idx === 0 ? prize1 : idx === 1 ? prize2 : idx === 2 ? prize3 : 0
                const initial   = member.profile?.username?.charAt(0).toUpperCase() ?? '?'
                const username  = member.profile?.username ?? '—'
                const leaderPts = members[0]?.profile?.total_points ?? 0
                const gap       = leaderPts - points
                const frase     = getPuestoFrase(idx, members.length)

                return (
                  <MemberPredictionsModal
                    key={member.user_id}
                    poolId={poolId}
                    memberId={member.user_id}
                    username={username}
                  >
                    <div
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40
                        ${isMe ? 'bg-brand-red/5 dark:bg-brand-red/10' : ''}`}
                    >
                      {/* Posición */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                        {idx === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                        {idx === 1 && <Medal className="h-5 w-5 text-slate-400"  />}
                        {idx === 2 && <Award className="h-5 w-5 text-amber-600"  />}
                        {idx >= 3  && <span className="text-sm font-bold text-muted-foreground tabular-nums">{idx + 1}</span>}
                      </div>

                      {/* Avatar */}
                      {member.profile?.avatar_url ? (
                        <img
                          src={member.profile.avatar_url}
                          alt={username}
                          className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-white text-xs font-bold">
                          {initial}
                        </div>
                      )}

                      {/* Nombre + ver predicciones */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-tight truncate ${isMe ? 'text-brand-red' : 'text-foreground'}`}>
                          {username}
                          {isMe && <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(vos)</span>}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate italic">
                          {frase}
                        </p>
                        {prizeCoins > 0 && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Gem className="h-2.5 w-2.5 text-yellow-500" />
                            Premio est.: <span className="font-semibold text-foreground">{prizeCoins.toLocaleString()}</span>
                          </p>
                        )}
                      </div>

                      {/* Puntos */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="text-right">
                          <p className="text-base font-extrabold tabular-nums">{points.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">pts</p>
                          {idx > 0 && gap > 0 && (
                            <p className="text-[9px] font-bold text-orange-500 dark:text-orange-400 tabular-nums whitespace-nowrap">
                              −{gap} vs líder
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    </div>
                  </MemberPredictionsModal>
                )
              })
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Tocá un jugador para ver sus predicciones
          </p>
        </div>
      )}

      {/* Resultados tab */}
      {tab === 'resultados' && (
        <PoolMatchResults />
      )}
    </div>
  )
}
