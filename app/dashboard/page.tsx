"use client"

import { useState } from "react"
import AppHeader from "@/components/app-header"
import MainFooter from "@/components/main-footer"
import MatchmakingModal from "@/components/matchmaking-modal"
import { FriendlyMatchCard, CustomRoomCard } from "@/components/dashboard-cards"

export default function DashboardPage() {
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <AppHeader />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back, Coder!</h1>
            <p className="text-gray-400">Ready for your next battle?</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Match Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Match Card with Modal Trigger */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 hover:border-cyan-500/40 transition-all">
                <h2 className="text-2xl font-bold text-white mb-2">Quick Match (Ranked)</h2>
                <p className="text-gray-400 mb-6">Get matched with an opponent of similar skill level instantly.</p>
                <button
                  onClick={() => setIsMatchmakingOpen(true)}
                  className="px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 neon-glow"
                  style={{
                    background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                    color: "#0A0A0F",
                  }}
                >
                  Find Opponent
                </button>
              </div>

              <FriendlyMatchCard />
              <CustomRoomCard />
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              {/* My Stats Card */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Elo Rating</span>
                    <span className="text-cyan-400 font-bold text-lg">1250</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Wins / Losses</span>
                    <span className="text-magenta-secondary font-bold">12 / 8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Matches</span>
                    <span className="text-white font-bold">20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-cyan-400 font-bold">60%</span>
                  </div>
                </div>
              </div>

              {/* Leaderboard Preview */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Top 5 Players</h3>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div key={rank} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">#{rank}</span>
                      <span className="text-white">Player {rank}</span>
                      <span className="text-cyan-400 font-bold">1500+</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MainFooter />

      {/* Matchmaking Modal */}
      <MatchmakingModal isOpen={isMatchmakingOpen} onClose={() => setIsMatchmakingOpen(false)} />
    </div>
  )
}
