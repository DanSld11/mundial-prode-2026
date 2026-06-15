import { Trophy, Target, Goal, Medal, Star, AlertCircle, Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Reglas y Puntuación - Mundial 2026',
}

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-3xl">Reglas y Puntuación 📖</h1>
        <p className="text-muted-foreground mt-2">
          Conoce cómo funciona el sistema de puntos de nuestra polla mundialista.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {/* Resultados de Partidos */}
        <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="flex items-center gap-3 text-lg">
              <span className="p-2 bg-background/50 rounded-xl border border-border/50">
                <Target className="h-5 w-5 text-brand-red" />
              </span>
              Partidos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 relative z-10">
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
              <div>
                <p className="font-bold">Acertar Resultado</p>
                <p className="text-xs text-muted-foreground">Local, Empate o Visitante</p>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+1 pt</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
              <div>
                <p className="font-bold">Marcador Exacto</p>
                <p className="text-xs text-muted-foreground">Ej: Predijiste 2-1 y terminó 2-1</p>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+3 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
              <div>
                <p className="font-bold">Acertar Goleador</p>
                <p className="text-xs text-muted-foreground">El jugador elegido anota al menos un gol</p>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+2 pts</span>
            </div>
          </CardContent>
        </Card>

        {/* Predicciones Especiales */}
        <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -ml-10 -mt-10"></div>
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="flex items-center gap-3 text-lg">
              <span className="p-2 bg-background/50 rounded-xl border border-border/50">
                <Star className="h-5 w-5 text-yellow-500" />
              </span>
              Predicciones Especiales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 relative z-10">
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="font-bold">Campeón del Mundo</p>
                </div>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+10 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <Medal className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="font-bold">Subcampeón</p>
                </div>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+7 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-base">👟</span>
                <div>
                  <p className="font-bold">Bota de Oro</p>
                </div>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+5 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-base">🧤</span>
                <div>
                  <p className="font-bold">Guante de Oro</p>
                </div>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+5 pts</span>
            </div>
          </CardContent>
        </Card>

        {/* Bono Batacazo */}
        <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="flex items-center gap-3 text-lg">
              <span className="p-2 bg-background/50 rounded-xl border border-border/50">
                <Zap className="h-5 w-5 text-purple-500" />
              </span>
              Bono Batacazo ⚡
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 relative z-10">
            <p className="text-sm text-muted-foreground">
              Si aciertas el resultado de un partido y <strong className="text-foreground">menos del 20% de los participantes</strong> también lo acertaron, recibes un bono extra por ir contra la corriente.
            </p>
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
              <div>
                <p className="font-bold">Bono Batacazo</p>
                <p className="text-xs text-muted-foreground">Acertas resultado que pocos predijeron (≤ 20%)</p>
              </div>
              <span className="font-extrabold text-purple-600 dark:text-purple-400">+2 pts</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
              <span className="text-base leading-none shrink-0">💡</span>
              <p><strong className="text-foreground">Ejemplo:</strong> Si 30 personas juegan y solo 4 predicen que habrá empate, pero el partido termina en empate — esas 4 personas reciben +1 pt por resultado <strong className="text-foreground">+ 2 pts extra de batacazo = 3 pts</strong> solo por el resultado.</p>
            </div>
          </CardContent>
        </Card>

        {/* Multiplicadores por Fase */}
        <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -ml-10 -mt-10"></div>
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="flex items-center gap-3 text-lg">
              <span className="p-2 bg-background/50 rounded-xl border border-border/50">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </span>
              Multiplicadores por Fase 🔥
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3 relative z-10">
            <p className="text-sm text-muted-foreground">
              A medida que el torneo avanza, los puntos de cada partido se multiplican. ¡Las últimas rondas valen mucho más!
            </p>
            <div className="space-y-2">
              {[
                { fase: 'Fase de Grupos', mult: '×1', color: 'text-muted-foreground', bg: 'bg-muted/40' },
                { fase: 'Ronda de 32', mult: '×1.5', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/60 dark:bg-blue-950/20' },
                { fase: 'Octavos de Final', mult: '×1.5', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/60 dark:bg-blue-950/20' },
                { fase: 'Cuartos de Final', mult: '×2', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/60 dark:bg-emerald-950/20' },
                { fase: 'Semifinal', mult: '×2.5', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50/60 dark:bg-orange-950/20' },
                { fase: 'Tercer Puesto', mult: '×2.5', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50/60 dark:bg-orange-950/20' },
                { fase: 'Final', mult: '×3', color: 'text-brand-red', bg: 'bg-red-50/60 dark:bg-red-950/20' },
              ].map(({ fase, mult, color, bg }) => (
                <div key={fase} className={`flex items-center justify-between px-3 py-2 rounded-xl border border-border/40 ${bg}`}>
                  <span className="text-sm font-medium">{fase}</span>
                  <span className={`font-extrabold text-sm ${color}`}>{mult}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
              <span className="text-base leading-none shrink-0">💡</span>
              <p><strong className="text-foreground">Ejemplo Final:</strong> Aciertas resultado + goleador + marcador exacto = (1+2+3) × 3 = <strong className="text-foreground">18 pts</strong> en un solo partido de la Final.</p>
            </div>
          </CardContent>
        </Card>

        {/* Grupos */}
        <Card className="rounded-3xl border-border/50 bg-card/60 backdrop-blur-xl shadow-lg relative overflow-hidden md:col-span-2">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent">
            <CardTitle className="flex items-center gap-3 text-lg">
              <span className="p-2 bg-background/50 rounded-xl border border-border/50">
                <Goal className="h-5 w-5 text-brand-red" />
              </span>
              Fase de Grupos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Por cada grupo, debes predecir qué equipos terminarán en 1°, 2° y 3° lugar.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-300/10 to-yellow-500/10 border border-yellow-500/20 text-center">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-950 font-black mb-2 shadow-sm">1°</span>
                <p className="font-bold">Primer Lugar</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">+3 pts</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-300/10 to-slate-400/10 border border-slate-400/20 text-center">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-slate-300 text-slate-800 font-black mb-2 shadow-sm">2°</span>
                <p className="font-bold">Segundo Lugar</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">+2 pts</p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-300/10 to-orange-500/10 border border-orange-500/20 text-center">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-orange-400 text-orange-950 font-black mb-2 shadow-sm">3°</span>
                <p className="font-bold">Tercer Lugar</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">+1 pt</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-brand-red/5 border border-brand-red/20">
              <AlertCircle className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Importante:</strong> Los puntos por Fase de Grupos y Predicciones Especiales se sumarán automáticamente al final de su respectiva etapa, cuando el administrador ingrese los resultados oficiales.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
