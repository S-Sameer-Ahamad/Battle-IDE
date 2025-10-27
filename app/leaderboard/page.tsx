"use client"

import { useState, useEffect } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { useAuth } from "@/lib/auth-context"

interface LeaderboardPlayer {
  id: string
  username: string
  elo: number
  wins: number
  losses: number
  rank: number
  winRate: number
}

interface LeaderboardData {
  leaderboard: LeaderboardPlayer[]
  totalCount: number
  totalPages: number
  currentPage: number
  userRank: LeaderboardPlayer | null
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [timePeriod, setTimePeriod] = useState<'all' | 'week' | 'month'>('all')
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const itemsPerPage = 25

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const offset = (currentPage - 1) * itemsPerPage
        const params = new URLSearchParams({
          limit: itemsPerPage.toString(),
          offset: offset.toString(),
          timePeriod,
        })
        
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }
        
        if (user?.id) {
          params.append('userId', user.id)
        }

        const response = await fetch(`/api/leaderboard?${params}`)
        const result = await response.json()
        
        if (response.ok) {
          setData(result)
        } else {
          setError(result.error || 'Failed to fetch leaderboard')
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setError('Failed to fetch leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [currentPage, searchQuery, timePeriod, user?.id])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, timePeriod])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, timePeriod])

  if (loading) {
    return (
      <AuthenticatedLayout>
        <main className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">Leaderboard</h1>
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8">
              <div className="text-center text-gray-400">Loading leaderboard...</div>
            </div>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <main className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-8">Leaderboard</h1>
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8">
              <div className="text-center text-red-400">Error loading leaderboard: {error}</div>
            </div>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  const leaderboardData = data?.leaderboard || []
  const totalPages = data?.totalPages || 1
  const userRank = data?.userRank

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 7
    
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    // Always show first page
    pages.push(1)
    
    if (currentPage > 3) {
      pages.push('...')
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...')
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Global Leaderboard</h1>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-accent-card border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Time Period Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setTimePeriod('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  timePeriod === 'all'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-accent-card border border-cyan-500/30 text-gray-400 hover:text-white hover:border-cyan-500/50'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimePeriod('month')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  timePeriod === 'month'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-accent-card border border-cyan-500/30 text-gray-400 hover:text-white hover:border-cyan-500/50'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimePeriod('week')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  timePeriod === 'week'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-accent-card border border-cyan-500/30 text-gray-400 hover:text-white hover:border-cyan-500/50'
                }`}
              >
                This Week
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Players</div>
              <div className="text-2xl font-bold text-white">{data?.totalCount || 0}</div>
            </div>
            {userRank && (
              <>
                <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Your Rank</div>
                  <div className="text-2xl font-bold text-cyan-400">#{userRank.rank}</div>
                </div>
                <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-1">Your ELO</div>
                  <div className="text-2xl font-bold text-white">{userRank.elo}</div>
                </div>
              </>
            )}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg overflow-hidden">
            {leaderboardData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyan-500/20 bg-black/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Player</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">ELO</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Wins</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Losses</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((player) => (
                      <tr 
                        key={player.id} 
                        className={`border-b border-cyan-500/10 hover:bg-black/50 transition-colors cursor-pointer ${
                          player.id === user?.id ? 'bg-cyan-500/10' : ''
                        }`}
                        onClick={() => window.location.href = `/profile/${player.id}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {player.rank <= 3 && (
                              <span className="text-xl">
                                {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                            <span className="text-white font-bold">#{player.rank}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {player.username[0].toUpperCase()}
                            </div>
                            <span className="text-white font-semibold">{player.username}</span>
                            {player.id === user?.id && (
                              <span className="text-xs bg-cyan-500 text-black px-2 py-0.5 rounded font-semibold">YOU</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-cyan-400 font-bold text-lg">{player.elo}</td>
                        <td className="px-6 py-4 text-green-400 font-semibold">{player.wins}</td>
                        <td className="px-6 py-4 text-red-400 font-semibold">{player.losses}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            player.winRate >= 60 ? 'text-green-400' :
                            player.winRate >= 40 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {player.winRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg">No players found</p>
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages} • {data?.totalCount || 0} players
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="First page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                        currentPage === page
                          ? "bg-cyan-500 text-black"
                          : "border border-cyan-500/30 text-white hover:bg-black/50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Last page"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
