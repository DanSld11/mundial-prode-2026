export const PERU_TIME_ZONE = 'America/Lima'

function toDate(dateInput: string | Date) {
  return dateInput instanceof Date ? dateInput : new Date(dateInput)
}

function formatter(options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: PERU_TIME_ZONE,
    hour12: false,
    ...options,
  })
}

export function formatPeruTime(dateInput: string | Date) {
  return formatter({
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(dateInput))
}

export function formatPeruShortDateTime(dateInput: string | Date) {
  return formatter({
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(dateInput))
}

export function formatPeruLongDateTime(dateInput: string | Date) {
  return formatter({
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(toDate(dateInput))
}

export function formatPeruDateLabel(dateInput: string | Date) {
  return formatter({
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(toDate(dateInput))
}

export function peruDateKey(dateInput: string | Date) {
  const parts = formatter({
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(toDate(dateInput))

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return `${year}-${month}-${day}`
}
