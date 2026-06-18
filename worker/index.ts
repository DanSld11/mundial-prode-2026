/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope

self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload: { title?: string; body?: string; icon?: string; tag?: string; url?: string }
  try { payload = event.data.json() } catch { payload = { body: event.data.text() } }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? '⚽ Mundial 2026', {
      body:    payload.body  ?? '',
      icon:    '/favicon.ico',
      badge:   '/favicon.ico',
      tag:     payload.tag  ?? 'mundial-reminder',
      data:    { url: payload.url ?? '/dashboard/partidos' },
      vibrate: [200, 100, 200],
      requireInteraction: true,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data?.url ?? '/dashboard/partidos') as string
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        return self.clients.openWindow(url)
      })
  )
})
