"use client"

import { useState } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { useLeaderboard } from "@/lib/hooks"

export default function LeaderboardPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const offset = (currentPage - 1) * itemsPerPage

  const { data, loading, error } = useLeaderboard(itemsPerPage, offset)

  if (loading) {
    return (
      <AuthenticatedLayout>
        <main className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto">
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
          <div className="max-w-4xl mx-auto">
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

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Global Leaderboard</h1>

          {/* Leaderboard Table */}
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-black/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Elo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Change</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Wins</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player) => (
                  <tr key={player.rank} className="border-b border-cyan-500/10 hover:bg-black/50 transition-colors">
                    <td className="px-6 py-4 text-white font-bold">#{player.rank}</td>
                    <td className="px-6 py-4 text-white">{player.username}</td>
                    <td className="px-6 py-4 text-cyan-400 font-bold">{player.elo}</td>
                    <td className="px-6 py-4 text-gray-400">
                      -
                    </td>
                    <td className="px-6 py-4 text-white">{player.wins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i).map(
              (page) =>
                page > 0 && (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-cyan-500 text-black font-bold"
                        : "border border-cyan-500/30 text-white hover:bg-black/50"
                    }`}
                  >
                    {page}
                  </button>
                ),
            )}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
            >
              Next
            </button>
          </div>

          {/* Current User Rank Banner */}
          <div className="mt-8 bg-gradient-to-r from-cyan-500/20 to-magenta-secondary/20 border border-cyan-500/30 rounded-lg p-6 sticky bottom-0">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400">Your Rank</div>
                <div className="text-2xl font-bold text-cyan-400">#42</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Your Elo</div>
                <div className="text-2xl font-bold text-white">1250</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
