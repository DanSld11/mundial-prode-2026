'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('sb-access-token='))
      ?.split('=')[1]

    if (!accessToken) {
      router.replace('/auth/login')
      return
    }

    // Verificar el token
    fetch('https://anbfhgkaaaqvjeiwtojp.supabase.co/auth/v1/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYmZoZ2thYWFxdmplaXd0b2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjg1OTksImV4cCI6MjA5NDcwNDU5OX0.rsfIrfuYdpLxdR2OlfU0k4Ddf0h4sHmyM6Nj48IDSlc',
      },
    })
      .then(res => res.ok ? setOk(true) : router.replace('/auth/login'))
      .catch(() => router.replace('/auth/login'))
  }, [router])

  if (!ok) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando...</div>

  return <>{children}</>
}
