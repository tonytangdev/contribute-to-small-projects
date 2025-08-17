export default function RepoCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 p-4 sm:p-6 md:p-7 transition-all duration-300 animate-pulse">
      <div className="space-y-6">
        {/* Header with owner/name */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 rounded-lg w-48"></div>
            <div className="h-4 bg-slate-200 rounded w-32"></div>
          </div>
          <div className="h-8 w-16 bg-slate-200 rounded-full"></div>
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-8"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-8"></div>
            </div>
          </div>
          <div className="h-6 bg-slate-200 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  )
}