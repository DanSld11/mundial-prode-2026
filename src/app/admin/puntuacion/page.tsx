'use client'

import { useEffect, useState } from 'react'
import { Save, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getScoringSettingsAction, saveScoringSettingAction } from './actions'

const labels: Record<string, { title: string; description: string }> = {
  outcome: {
    title: 'Ganador o empate',
    description: 'Puntos por acertar si gana local, gana visitante o empatan.',
  },
  scorer: {
    title: 'Jugador que anota',
    description: 'Puntos por acertar un jugador que marcó al menos un gol.',
  },
  exact_score: {
    title: 'Marcador exacto',
    description: 'Puntos por acertar el resultado exacto del partido.',
  },
}

export default function AdminPuntuacionPage() {
  const [settings, setSettings] = useState<Record<string, number>>({ outcome: 1, scorer: 2, exact_score: 3 })
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    getScoringSettingsAction().then((result) => {
      if (!result.settings || result.settings.length === 0) return
      setSettings((prev) => ({
        ...prev,
        ...Object.fromEntries(result.settings.map((s: any) => [s.prediction_type, s.points]))
      }))
    })
  }, [])

  async function saveSetting(type: string) {
    setSaving(type)
    await saveScoringSettingAction(type, settings[type] ?? 0)
    setSaving(null)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Puntuación</h1>
            <p className="text-sm text-muted-foreground">Configura los puntos base del sistema de predicciones.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(labels).map(([type, info]) => (
          <Card key={type} className="shadow-sm">
            <CardContent className="space-y-4 p-4">
              <div>
                <h2 className="font-semibold">{info.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{info.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  value={settings[type] ?? 0}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [type]: parseInt(e.target.value || '0') }))}
                  className="h-10 text-center text-lg font-bold"
                />
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
              <Button onClick={() => saveSetting(type)} disabled={saving === type} className="w-full bg-brand-red text-white hover:bg-red-700">
                <Save className="h-4 w-4" />
                {saving === type ? 'Guardando...' : 'Guardar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
