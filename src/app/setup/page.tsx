'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSetup() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/setup', { method: 'POST' })
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Setup Inicial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Este boton crea los usuarios de prueba (admin y jugador).
            Solo usar una vez.
          </p>
          <Button
            onClick={handleSetup}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creando usuarios...' : 'Crear usuarios de prueba'}
          </Button>

          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/30">
                <p className="font-medium text-green-400">Admin:</p>
                {result.admin?.success ? (
                  <p className="text-muted-foreground">
                    ✅ Creado: {result.admin.email}
                  </p>
                ) : (
                  <p className="text-red-400">
                    ❌ Error: {result.admin?.error}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/30">
                <p className="font-medium text-green-400">Jugador:</p>
                {result.jugador?.success ? (
                  <p className="text-muted-foreground">
                    ✅ Creado: {result.jugador.email}
                  </p>
                ) : (
                  <p className="text-red-400">
                    ❌ Error: {result.jugador?.error}
                  </p>
                )}
              </div>
            </div>
          )}

          {result?.admin?.success && result?.jugador?.success && (
            <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/30 text-sm">
              <p className="font-medium text-blue-400">Datos de login:</p>
              <div className="mt-2 space-y-1 text-muted-foreground">
                <p><strong>Admin:</strong> admin@prode.com / admin123</p>
                <p><strong>Jugador:</strong> jugador@prode.com / jugador123</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
