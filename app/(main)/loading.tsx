export default function Loading() {
  return (
    <>
      {/* Stats skeleton */}
      <div className="text-center mb-12">
        <div className="inline-block bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl px-8 py-4">
          <div className="h-7 w-96 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-5 w-48 bg-slate-200 rounded-lg animate-pulse mt-2 mx-auto"></div>
        </div>
      </div>

      {/* Repo grid skeleton */}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/60 animate-pulse"
          >
            <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-5/6 mb-6"></div>
            <div className="flex items-center gap-6 mb-6">
              <div className="h-4 bg-slate-200 rounded-lg w-16"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-20"></div>
            </div>
            <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
          </div>
        ))}
      </div>
    </>
  )
}
