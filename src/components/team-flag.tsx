import { cn } from '@/lib/utils'

interface TeamFlagProps {
  code?: string | null
  label?: string | null
  className?: string
}

function isFlagCode(value: string) {
  return /^[a-z]{2}(?:-[a-z]{3})?$/.test(value)
}

export function TeamFlag({ code, label, className }: TeamFlagProps) {
  if (!code) {
    return (
      <span
        aria-hidden="true"
        className={cn('inline-flex h-5 w-7 items-center justify-center rounded-sm border bg-muted text-[10px]', className)}
      >
        --
      </span>
    )
  }

  if (!isFlagCode(code)) {
    return (
      <span
        role="img"
        aria-label={label ?? 'Bandera'}
        className={cn('inline-flex h-5 w-7 items-center justify-center text-lg leading-none', className)}
      >
        {code}
      </span>
    )
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
      alt={label ? `Bandera de ${label}` : 'Bandera'}
      className={cn('h-5 w-7 rounded-sm border object-cover shadow-sm', className)}
      loading="lazy"
    />
  )
}
