import { getAdminBracketData, createKnockoutStructure } from './actions'
import BracketAdminTree from './BracketAdminTree'
import PropagateButton from './PropagateButton'
import { GitBranch } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminBracketPage() {
  const { matches } = await getAdminBracketData()

  async function handleCreate() {
    'use server'
    await createKnockoutStructure()
    revalidatePath('/admin/bracket')
  }


  const knockoutCount = matches.length

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
          <GitBranch className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Llaves Eliminatorias</h2>
          <p className="text-sm text-muted-foreground">
            Tocá un partido para ingresar el resultado — el ganador avanza automáticamente.
          </p>
        </div>
      </div>

      {/* Create structure if missing */}
      {knockoutCount < 32 && (
        <div className="rounded-2xl border-2 border-dashed border-brand-red/30 bg-brand-red/5 p-6 text-center space-y-3">
          <p className="font-semibold text-lg">Estructura del bracket no creada</p>
          <p className="text-sm text-muted-foreground">
            Crea los {32 - knockoutCount} partidos eliminatorios primero.
          </p>
          <form action={handleCreate}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-red px-5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              ⚡ Crear estructura eliminatoria
            </button>
          </form>
        </div>
      )}

      {/* Propagate winners */}
      {knockoutCount > 0 && <PropagateButton />}

      {/* Visual bracket tree */}
      {knockoutCount > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm overflow-hidden">
          <p className="text-xs text-muted-foreground mb-3 text-center lg:hidden">
            ← Deslizá para ver el bracket completo →
          </p>
          <BracketAdminTree matches={matches as any} />
        </div>
      )}
    </div>
  )
}
