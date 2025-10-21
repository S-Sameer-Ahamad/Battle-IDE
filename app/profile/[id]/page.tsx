"use client"

import { useState, use } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 sticky top-24">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white text-3xl font-bold mb-4">
                    U
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">Username</h1>
                  <p className="text-gray-400 text-sm mb-6 text-center">Competitive Coder</p>

                  <div className="w-full space-y-3 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">1250</div>
                      <div className="text-xs text-gray-400">Elo Rating</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">12</div>
                        <div className="text-xs text-gray-400">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">8</div>
                        <div className="text-xs text-gray-400">Losses</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className="w-full py-2 rounded-lg font-bold transition-all duration-300"
                    style={{
                      background: isFollowing ? "transparent" : "linear-gradient(135deg, #00FFFF, #FF007F)",
                      color: isFollowing ? "#00FFFF" : "#0A0A0F",
                      border: isFollowing ? "2px solid #00FFFF" : "none",
                    }}
                  >
                    {isFollowing ? "Following" : "Add Friend"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Elo History Chart */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Elo History</h2>
                <div className="h-64 bg-black/50 rounded-lg flex items-center justify-center text-gray-400">
                  Chart placeholder - Recharts integration
                </div>
              </div>

              {/* Match History */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Matches</h2>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((match) => (
                    <div key={match} className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                      <div>
                        <div className="text-white font-semibold">vs Player {match}</div>
                        <div className="text-xs text-gray-400">2 hours ago</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">Won</div>
                        <div className="text-xs text-gray-400">+15 Elo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
