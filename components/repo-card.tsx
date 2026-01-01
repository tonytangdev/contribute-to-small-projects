interface Repository {
  id: string
  name: string
  owner: string
  description: string | null
  language: string | null
  stars: number
  contributors: number | null
  githubUrl: string
  lastUpdated: string
}

interface RepoCardProps {
  repository: Repository
}

export default function RepoCard({ repository }: RepoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4 sm:p-6 md:p-7 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 ease-out">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3 leading-tight">
            <a 
              href={repository.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 transition-colors duration-200 group-hover:text-indigo-700"
            >
              <span className="text-slate-500 font-medium">{repository.owner}/</span>
              <span className="text-slate-900">{repository.name}</span>
            </a>
          </h3>
          {repository.description && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3">
              {repository.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
            {repository.language && (
              <span className="flex items-center text-xs sm:text-sm text-slate-600 font-medium">
                <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 mr-1 sm:mr-2 shadow-sm" aria-hidden="true"></span>
                <span>{repository.language}</span>
              </span>
            )}
            <span className="flex items-center text-xs sm:text-sm text-slate-600 font-medium" aria-label={`${repository.stars.toLocaleString()} stars`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" role="img">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {repository.stars.toLocaleString()}
            </span>
            {repository.contributors && (
              <span className="flex items-center text-xs sm:text-sm text-slate-600 font-medium" aria-label={`${repository.contributors.toLocaleString()} contributors`}>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {repository.contributors.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            <span className="hidden sm:inline">{formatDate(repository.lastUpdated)}</span>
            <span className="sm:hidden">{new Date(repository.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </span>
        </div>
      </div>
    </div>
  )
}