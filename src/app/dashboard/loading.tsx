export default function DashboardLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />

      {/* Cards skeleton grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-4 p-6 bg-card border border-white/5 rounded-xl">
            {/* Header of card */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            </div>
            
            {/* Body of card */}
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>

            {/* Footer button */}
            <div className="mt-4 h-10 w-full bg-muted rounded-md animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
