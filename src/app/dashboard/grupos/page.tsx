import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users } from 'lucide-react'
import type { Team } from '@/types'

export default async function GruposPage() {
  const supabase = await createServerSupabaseClient()
  const { data: teamsData } = await supabase
    .from('teams')
    .select('*')
    .order('group_name', { ascending: true })
    .order('name_es', { ascending: true })

  const teams = (teamsData ?? []) as unknown as Team[]
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-brand-red" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grupos del Mundial 2026</h1>
          <p className="text-muted-foreground">48 equipos · 12 grupos · 2 clasifican por grupo + 8 mejores terceros</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groups.map((group) => {
          const groupTeams = teams.filter((t) => t.group_name === group)
          return (
            <Card key={group} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Grupo {group}</CardTitle>
                  <Badge variant="outline">{groupTeams.length} equipos</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {groupTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{team.flag_emoji}</span>
                        <span className="font-medium text-sm">{team.name_es}</span>
                      </div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {team.code}
                      </span>
                    </div>
                  ))}
                  {groupTeams.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Sin equipos cargados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {teams.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Trophy className="mx-auto h-10 w-10 text-brand-gold mb-3" />
          <h3 className="font-semibold">No hay equipos cargados</h3>
          <p className="text-sm text-muted-foreground mt-1">
            El administrador debe cargar los equipos desde el panel de admin.
          </p>
        </div>
      )}
    </div>
  )
}
