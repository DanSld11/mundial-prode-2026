import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted/60', className)} />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-card p-4 shadow-sm space-y-3', className)}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

export function SkeletonMatchCard() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-12 rounded-md" />
        <div className="flex flex-1 items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-7 rounded" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="h-5 w-7 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonLeaderboardRow() {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
      <Skeleton className="h-7 w-7 rounded-full" />
      <Skeleton className="h-4 flex-1 max-w-[140px]" />
      <Skeleton className="ml-auto h-4 w-12" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLeaderboardRow key={i} />
      ))}
    </div>
  )
}
