/**
 * Simple localStorage cache with TTL support.
 * Falls back gracefully in SSR or when localStorage is unavailable.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

function isAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem('__test__', '1')
    localStorage.removeItem('__test__')
    return true
  } catch {
    return false
  }
}

export function cacheGet<T>(key: string): T | null {
  if (!isAvailable()) return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  if (!isAvailable()) return
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Storage full or other error — fail silently
  }
}

export function cacheClear(key: string): void {
  if (!isAvailable()) return
  try { localStorage.removeItem(key) } catch {}
}
