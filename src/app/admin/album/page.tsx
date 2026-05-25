'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { adminGetPackPrice, adminUpdatePackPrice } from './actions'

export default function AdminAlbumPage() {
  const [price, setPrice] = useState(100)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminGetPackPrice().then(p => {
      setPrice(p)
      setLoading(false)
    })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await adminUpdatePackPrice(price)
    setSaving(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Precio actualizado con éxito')
  }

  if (loading) return <div className="animate-pulse h-24 bg-muted/50 rounded-xl" />

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Álbum Digital</h2>
        <p className="text-sm text-muted-foreground">Configura las opciones del Álbum del Mundial</p>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm max-w-md">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-amber-500" /> Precio del Sobre
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Costo en Monedas (Coins)</label>
            <input 
              type="number" 
              min={1} 
              value={price} 
              onChange={e => setPrice(parseInt(e.target.value))}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
            />
            <p className="text-xs text-muted-foreground mt-1">Los sobres siempre traen 7 figuritas aleatorias.</p>
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 transition"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  )
}
