import RepoCardSkeleton from './repo-card-skeleton'

export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <header className="text-center mb-16">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
              Contribute to Small Projects
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover open source projects with 100-600 stars — perfect for your first contributions
            </p>
            
            {/* Search Input Skeleton */}
            <div className="flex justify-center pt-4">
              <div className="w-full max-w-md h-12 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl animate-pulse"></div>
            </div>
            
            {/* Language Filter Skeleton */}
            <div className="flex justify-center">
              <div className="w-48 h-12 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Stats Skeleton */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl px-8 py-4">
            <div className="h-6 bg-slate-200 rounded w-64 mx-auto animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mx-auto mt-2 animate-pulse"></div>
          </div>
        </div>
        
        {/* Repository Cards Grid Skeleton */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <RepoCardSkeleton key={index} />
          ))}
        </div>
        
        {/* Pagination Skeleton */}
        <div className="flex justify-center items-center gap-6 mt-16">
          <div className="h-12 w-24 bg-slate-100 rounded-2xl animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 bg-indigo-100 rounded-2xl animate-pulse"></div>
            <span className="text-slate-400 font-medium">of</span>
            <div className="h-12 w-12 bg-white/60 rounded-2xl animate-pulse"></div>
          </div>
          <div className="h-12 w-24 bg-slate-100 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}