'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAnonClient } from '@/lib/auth-client'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    createAnonClient().auth.getUser()
      .then(({ data }) => data.user ? setOk(true) : router.replace('/auth/login'))
      .catch(() => router.replace('/auth/login'))
  }, [router])

  if (!ok) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Cargando...</div>

  return <>{children}</>
}
