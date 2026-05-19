import { Card, CardContent } from '@/components/ui/card'
import { Swords } from 'lucide-react'

const STAGES = [
  { key: 'round_of_32', label: 'Dieciseisavos', slots: 16, pts: 2 },
  { key: 'round_of_16', label: 'Octavos', slots: 8, pts: 3 },
  { key: 'quarterfinal', label: 'Cuartos', slots: 4, pts: 5 },
  { key: 'semifinal', label: 'Semis', slots: 2, pts: 8 },
  { key: 'third_place', label: '3er Puesto', slots: 1, pts: 6 },
  { key: 'final', label: 'Final', slots: 2, pts: 15 },
]

export default function BracketPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-red/10"><Swords className="h-5 w-5 text-brand-red" /></div>
        <div><h1 className="text-2xl font-bold">Bracket</h1><p className="text-sm text-muted-foreground">Fase eliminatoria</p></div>
      </div>
      <div className="grid gap-3">
        {STAGES.map(stage => (
          <Card key={stage.key}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{stage.label}</h3>
                <p className="text-xs text-muted-foreground">{stage.slots} predicciones · {stage.pts} pts cada una</p>
              </div>
              <span className="text-xs text-muted-foreground">Próximamente</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
