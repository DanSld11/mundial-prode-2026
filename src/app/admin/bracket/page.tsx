'use client'

import { useEffect, useState, useTransition } from 'react'
import { getAdminBracketData, createKnockoutStructure } from './actions'
import BracketAdminClient from './BracketAdminClient'
import { toast } from 'sonner'
import { GitBranch } from 'lucide-react'

export default function AdminBracketPage() {
  const [data, setData] = useState<{ matches: any[]; teams: any[] }>({ matches: [], teams: [] })
  const [loading, setLoading] = useState(true)
  const [creating, startCreate] = useTransition()

  async function load() {
    const d = await getAdminBracketData()
    setData(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleCreateStructure() {
    startCreate(async () => {
      const res = await createKnockoutStructure()
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`✅ ${res.created} partidos creados`)
        await load()
      }
    })
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Cargando bracket...</div>
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
          <GitBranch className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Bracket Eliminatorio</h2>
          <p className="text-sm text-muted-foreground">
            Asigná equipos, fechas y estadios para cada partido de la fase eliminatoria.
          </p>
        </div>
      </div>

      <BracketAdminClient
        matches={data.matches}
        teams={data.teams}
        onCreateStructure={handleCreateStructure}
        creating={creating}
      />
    </div>
  )
}
