'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { seedTeamsAction, seedMatchesAction } from './actions'
import { toast } from 'sonner'

export function SeedButtons() {
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)

  async function handleSeedTeams() {
    setLoadingTeams(true)
    const result = await seedTeamsAction()
    setLoadingTeams(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Se insertaron ${result.count} equipos`)
    }
  }

  async function handleSeedMatches() {
    setLoadingMatches(true)
    const result = await seedMatchesAction()
    setLoadingMatches(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Se insertaron ${result.count} partidos`)
    }
  }

  return (
    <div className="flex gap-4">
      <Button onClick={handleSeedTeams} disabled={loadingTeams} variant="outline">
        {loadingTeams ? 'Insertando...' : '🌱 Insertar 48 Equipos'}
      </Button>
      <Button onClick={handleSeedMatches} disabled={loadingMatches} variant="outline">
        {loadingMatches ? 'Insertando...' : '🌱 Insertar 72 Partidos'}
      </Button>
    </div>
  )
}
