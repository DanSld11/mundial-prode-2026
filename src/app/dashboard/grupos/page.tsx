'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trophy } from 'lucide-react'

const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const

export default function GruposPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.from('teams').select('*').order('group_name').order('name_es').then(({ data }) => {
      setTeams(data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="py-20 text-center text-muted-foreground text-sm">Cargando grupos...</div>

  const totalTeams = teams.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-red/10">
            <Users className="h-5 w-5 text-brand-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Grupos</h1>
            <p className="text-sm text-muted-foreground">
              {totalTeams > 0 ? `${totalTeams} equipos · 12 grupos · Mundial 2026` : 'Sin equipos cargados'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">{totalTeams}/48 equipos</Badge>
      </div>

      {totalTeams === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-muted-foreground">No hay equipos cargados</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Ejecutá el seed desde el panel de admin.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {groups.map((g) => {
            const groupTeams = teams.filter((t) => t.group_name === g)
            return (
              <Card key={g} className="overflow-hidden border shadow-sm hover:shadow transition-shadow">
                <CardHeader className="bg-muted/30 px-4 py-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">Grupo {g}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{groupTeams.length}</Badge>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {groupTeams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{team.flag_emoji}</span>
                        <span className="text-sm font-medium">{team.name_es}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{team.code}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
