'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { spinRuletaAction, SlotDef } from './actions'
import { slotLabel } from './constants'
import { toast } from 'sonner'
import { Coins, History, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  isActive: boolean
  hasAccess: boolean
  priceCoins: number
  slots: SlotDef[]
  spins: any[]
  coinBalance: number
  totalPoints: number
  isAdmin: boolean
  hasWeeklyFreeSpin: boolean
  weeklyFreeSpinResetsAt: string | null
}

function drawWheel(canvas: HTMLCanvasElement, slots: SlotDef[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx || slots.length === 0) return
  const size = canvas.width
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 4
  const n = slots.length
  const arc = (2 * Math.PI) / n

  ctx.clearRect(0, 0, size, size)

  // Outer ring shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 15
  ctx.beginPath()
  ctx.arc(cx, cy, radius + 2, 0, 2 * Math.PI)
  ctx.fillStyle = '#1e293b'
  ctx.fill()
  ctx.restore()

  for (let i = 0; i < n; i++) {
    const startAngle = i * arc - Math.PI / 2
    const endAngle = startAngle + arc

    // Segment
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = slots[i].color
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Text
    const midAngle = startAngle + arc / 2
    const textR = radius * 0.62
    const tx = cx + textR * Math.cos(midAngle)
    const ty = cy + textR * Math.sin(midAngle)

    ctx.save()
    ctx.translate(tx, ty)
    ctx.rotate(midAngle + Math.PI / 2)
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${size < 280 ? 11 : 15}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 4
    const label = slotLabel(slots[i])
    // Wrap long text
    if (label.length > 8) {
      const words = label.split(' ')
      ctx.fillText(words[0], 0, -7)
      ctx.fillText(words.slice(1).join(' '), 0, 7)
    } else {
      ctx.fillText(label, 0, 0)
    }
    ctx.restore()
  }

  // Outer border
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 3
  ctx.stroke()

  // Center circle
  ctx.beginPath()
  ctx.arc(cx, cy, 22, 0, 2 * Math.PI)
  ctx.fillStyle = '#0f172a'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 3
  ctx.stroke()

  // Center ⚽ text
  ctx.font = '16px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚽', cx, cy)
}

function ResultModal({ result, onClose, onRetry, isFreeRetry }: {
  result: Awaited<ReturnType<typeof spinRuletaAction>> & { success: true }
  onClose: () => void
  onRetry: () => void
  isFreeRetry: boolean
}) {
  const isGain  = result.pointsChange > 0
  const isLoss  = result.pointsChange < 0
  const isRetry = result.isRetry

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-card rounded-3xl border shadow-2xl p-8 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95 duration-300">
        <div className="text-6xl">
          {isRetry ? '🔄' : isGain ? '🎉' : isLoss ? '😬' : '🍍'}
        </div>
        <h2 className="text-2xl font-extrabold">
          {isRetry ? '¡Intentalo otra vez!' : isGain ? '¡Ganaste!' : isLoss ? '¡Mala suerte!' : '¡Piña!'}
        </h2>
        <p className="text-4xl font-black tabular-nums">
          {isRetry ? (
            <span className="text-blue-500">Giro gratis</span>
          ) : result.pointsChange !== 0 ? (
            <span className={isGain ? 'text-emerald-500' : 'text-red-500'}>
              {isGain ? '+' : ''}{result.pointsChange} pts
            </span>
          ) : (
            <span className="text-amber-500">+0 pts</span>
          )}
        </p>
        {!isRetry && (
          <p className="text-sm text-muted-foreground">
            {result.label}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cerrar</Button>
          {isRetry && (
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={onRetry}>
              <RotateCcw className="mr-2 h-4 w-4" /> Girar gratis
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'pronto'
  const h = Math.floor(diff / 3600000)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d} día${d > 1 ? 's' : ''}`
}

export default function RuletaClient({
  isActive, hasAccess, priceCoins, slots, spins: initialSpins,
  coinBalance, totalPoints, isAdmin, hasWeeklyFreeSpin: initialHasFreeSpin,
  weeklyFreeSpinResetsAt,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wheelRef  = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isFreeRetry, setIsFreeRetry] = useState(false)
  const [spins, setSpins] = useState(initialSpins)
  const [coins, setCoins] = useState(coinBalance)
  const [points, setPoints] = useState(totalPoints)
  const [pending, startTransition] = useTransition()
  const [showHistory, setShowHistory] = useState(false)
  const [hasFreeSpin, setHasFreeSpin] = useState(initialHasFreeSpin)
  // Shuffle once on mount — each visit gets a different order
  const [displaySlots] = useState<SlotDef[]>(() => shuffleArray(slots))

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawWheel(canvas, displaySlots)
  }, [displaySlots])

  function handleSpin() {
    if (spinning || pending) return
    if (!isFreeRetry && coins < priceCoins) {
      toast.error(`Necesitás ${priceCoins} coins para girar`)
      return
    }

    setSpinning(true)
    setResult(null)

    startTransition(async () => {
      const res = await spinRuletaAction(isFreeRetry)
      if ('error' in res) {
        toast.error(res.error ?? 'Error al girar')
        setSpinning(false)
        return
      }

      // Find where this slot ended up in the shuffled display order
      const n = displaySlots.length
      const segmentDeg = 360 / n
      const visualIndex = displaySlots.findIndex(s => s.id === res.slot.id)
      const targetIndex = visualIndex >= 0 ? visualIndex : res.resultIndex
      // The center of segment i is at (i * segmentDeg + segmentDeg/2) degrees from the top.
      // To bring it under the pointer (top=0°), we need the wheel at:
      //   targetAngle = (360 - (i * segmentDeg + segmentDeg/2)) % 360
      const targetAngle = (360 - (targetIndex * segmentDeg + segmentDeg / 2)) % 360
      const currentAngle = rotation % 360
      const diff = (targetAngle - currentAngle + 360) % 360
      const newRotation = rotation + (diff === 0 ? 360 : diff) + 5 * 360

      setRotation(newRotation)
      if (!isFreeRetry && res.coinsSpent > 0) setCoins(c => c - res.coinsSpent)
      if (!isFreeRetry && res.usedWeeklyFreeSpin) setHasFreeSpin(false)
      if (res.pointsChange !== 0) setPoints(p => Math.max(0, p + res.pointsChange))

      // Wait for animation to finish (4s) then show result
      setTimeout(() => {
        setSpinning(false)
        setResult(res)
        setIsFreeRetry(false)
        if (!res.isRetry) {
          setSpins(prev => [{
            id: Date.now(),
            result_label: res.label,
            result_type: res.slot.type,
            points_change: res.pointsChange,
            coins_spent: res.coinsSpent,
            is_free_retry: isFreeRetry,
            created_at: new Date().toISOString(),
          }, ...prev].slice(0, 20))
        }
      }, 4200)
    })
  }

  function handleRetry() {
    setResult(null)
    setIsFreeRetry(true)
  }

  const canSpin = !spinning && !pending && (isFreeRetry || hasFreeSpin || coins >= priceCoins) && isActive && hasAccess

  if (!hasAccess && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="text-6xl">🎡</div>
        <h2 className="text-xl font-bold">La ruleta no está disponible para vos aún</h2>
        <p className="text-sm text-muted-foreground max-w-xs">El admin habilitará tu acceso cuando sea el momento.</p>
      </div>
    )
  }

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <div className="text-6xl">🎡</div>
        <h2 className="text-xl font-bold">La ruleta está desactivada</h2>
        <p className="text-sm text-muted-foreground">El admin la activará próximamente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
          <p className="text-2xl font-extrabold tabular-nums text-amber-500">{coins.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Mis coins</p>
        </div>
        <div className="rounded-xl border bg-card p-3 text-center shadow-sm">
          <p className="text-2xl font-extrabold tabular-nums text-brand-red">{points}</p>
          <p className="text-xs text-muted-foreground">Mis puntos</p>
        </div>
      </div>

      {/* Wheel container */}
      <div className="flex flex-col items-center gap-4">
        {/* Pointer */}
        <div className="relative flex justify-center w-full" style={{ maxWidth: 420 }}>
          {/* Arrow pointing down into wheel */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <svg width="34" height="34" viewBox="0 0 28 28">
              <polygon points="14,24 4,4 24,4" fill="#ef4444" stroke="white" strokeWidth="2" />
            </svg>
          </div>

          {/* Spinning wheel div */}
          <div
            ref={wheelRef}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.15, 1)' : 'none',
              willChange: 'transform',
            }}
          >
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="rounded-full shadow-2xl w-full"
            />
          </div>
        </div>

        {/* Spin button */}
        <button
          onClick={handleSpin}
          disabled={!canSpin}
          className={`relative h-14 w-full max-w-[420px] rounded-2xl text-base font-extrabold tracking-wide text-white transition-all active:scale-95 shadow-lg ${
            isFreeRetry
              ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'
              : canSpin && hasFreeSpin
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
              : canSpin
              ? 'bg-brand-red hover:bg-red-600 shadow-brand-red/30'
              : 'bg-muted text-muted-foreground cursor-not-allowed shadow-none'
          }`}
        >
          {spinning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⚽</span> Girando...
            </span>
          ) : isFreeRetry ? (
            <span className="flex items-center justify-center gap-2">
              <RotateCcw className="h-5 w-5" /> Giro gratis (otra vez)
            </span>
          ) : hasFreeSpin ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" /> Giro semanal gratuito 🎁
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" /> Girar · {priceCoins} coins
            </span>
          )}
        </button>

        {!canSpin && !spinning && !isFreeRetry && isActive && (
          <p className="text-xs text-muted-foreground text-center">
            {coins < priceCoins
              ? `Te faltan ${priceCoins - coins} coins · próximo giro gratis ${weeklyFreeSpinResetsAt ? `en ${timeUntil(weeklyFreeSpinResetsAt)}` : 'pronto'}`
              : 'No disponible'}
          </p>
        )}
        {!spinning && !isFreeRetry && hasFreeSpin && isActive && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
            ¡Tenés tu giro gratis semanal disponible!
          </p>
        )}
        {!spinning && !isFreeRetry && !hasFreeSpin && weeklyFreeSpinResetsAt && isActive && (
          <p className="text-xs text-muted-foreground text-center">
            Próximo giro gratis en <strong>{timeUntil(weeklyFreeSpinResetsAt)}</strong>
          </p>
        )}
      </div>

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(v => !v)}
        className="w-full flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Mis últimos giros
        </span>
        <span className="text-xs text-muted-foreground">{showHistory ? '▲' : '▼'}</span>
      </button>

      {showHistory && (
        <div className="space-y-2">
          {spins.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">Sin giros aún.</p>
          ) : (
            spins.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5">
                <span className="text-lg">
                  {s.result_type === 'retry' ? '🔄' : s.result_type === 'nothing' ? '🍍' : s.points_change > 0 ? '✅' : '❌'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.result_label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.is_free_retry ? 'Giro gratis' : `${s.coins_spent} coins`}
                  </p>
                </div>
                {s.points_change !== 0 && (
                  <span className={`font-bold text-sm tabular-nums ${s.points_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {s.points_change > 0 ? '+' : ''}{s.points_change}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">{timeAgo(s.created_at)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Result modal */}
      {result?.success && (
        <ResultModal
          result={result}
          onClose={() => setResult(null)}
          onRetry={handleRetry}
          isFreeRetry={isFreeRetry}
        />
      )}
    </div>
  )
}
