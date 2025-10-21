"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AuthenticatedLayout from "@/components/authenticated-layout"
import MatchmakingModal from "@/components/matchmaking-modal"
import UserSearchModal from "@/components/user-search-modal"
import { FriendlyMatchCard, CustomRoomCard } from "@/components/dashboard-cards"

export default function DashboardPage() {
  const router = useRouter()
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false)
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false)
  const [searchMode, setSearchMode] = useState<"invite" | "friend">("invite")

  const handleInviteUser = () => {
    setSearchMode("invite")
    setIsUserSearchOpen(true)
  }

  const handleAddFriend = () => {
    setSearchMode("friend")
    setIsUserSearchOpen(true)
  }

  const handleUserInvite = (userId: string) => {
    // TODO: Implement user invitation logic
    console.log("Inviting user:", userId)
  }

  const handleAddFriendAction = (userId: string) => {
    // TODO: Implement add friend logic
    console.log("Adding friend:", userId)
  }

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
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

              <FriendlyMatchCard onInviteUser={handleInviteUser} />
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
                <button
                  onClick={() => router.push("/leaderboard")}
                  className="w-full mt-4 py-2 text-sm border border-cyan-500/30 text-cyan-400 rounded hover:bg-black/50 transition-colors"
                >
                  View Full Leaderboard
                </button>
              </div>

              {/* Recent Matches */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Matches</h3>
                <div className="space-y-3">
                  {[
                    { opponent: "CodeMaster", result: "Won", elo: "+15", time: "2h ago" },
                    { opponent: "AlgoNinja", result: "Lost", elo: "-12", time: "1d ago" },
                    { opponent: "DataWizard", result: "Won", elo: "+18", time: "2d ago" },
                  ].map((match, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-black/50 rounded">
                      <div>
                        <div className="text-white text-sm font-semibold">vs {match.opponent}</div>
                        <div className="text-xs text-gray-400">{match.time}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${match.result === "Won" ? "text-green-400" : "text-red-400"}`}>
                          {match.result}
                        </div>
                        <div className="text-xs text-gray-400">{match.elo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <MatchmakingModal isOpen={isMatchmakingOpen} onClose={() => setIsMatchmakingOpen(false)} />
      <UserSearchModal
        isOpen={isUserSearchOpen}
        onClose={() => setIsUserSearchOpen(false)}
        mode={searchMode}
        onInvite={handleUserInvite}
        onAddFriend={handleAddFriendAction}
      />
    </AuthenticatedLayout>
  )
}
