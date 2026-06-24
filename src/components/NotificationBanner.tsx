'use client'

import { useEffect, useState, useTransition } from 'react'
import { getAccessToken, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'
import { X } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  points_change: number
  created_at: string
}

async function dismissNotification(id: string) {
  // Uses a fetch to a small API route to dismiss via service role
  await fetch('/api/notifications/dismiss', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
}

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return
    const client = createAuthedClient(token)
    getCurrentUserId(token).then((uid) => {
      if (!uid) return
      client
        .from('user_notifications')
        .select('id, title, message, points_change, created_at')
        .eq('user_id', uid)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => setNotifications(data ?? []))
    })
  }, [])

  function handleDismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    dismissNotification(id)
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`relative rounded-2xl border px-5 py-4 shadow-sm flex items-start gap-4 ${
            n.points_change > 0
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/50 dark:bg-emerald-950/30'
              : n.points_change < 0
              ? 'border-red-300 bg-red-50 dark:border-red-700/50 dark:bg-red-950/30'
              : 'border-blue-300 bg-blue-50 dark:border-blue-700/50 dark:bg-blue-950/30'
          }`}
        >
          {/* Points badge */}
          {n.points_change !== 0 && (
            <div className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-extrabold ${
              n.points_change > 0
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
            }`}>
              {n.points_change > 0 ? '+' : ''}{n.points_change}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${
              n.points_change > 0
                ? 'text-emerald-800 dark:text-emerald-200'
                : n.points_change < 0
                ? 'text-red-800 dark:text-red-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}>{n.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => handleDismiss(n.id)}
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-black/10 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
