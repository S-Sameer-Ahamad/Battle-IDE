"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import AuthenticatedLayout from "@/components/authenticated-layout"
import MatchmakingModal from "@/components/matchmaking-modal"
import UserSearchModal from "@/components/user-search-modal"
import { FriendlyMatchCard, CustomRoomCard } from "@/components/dashboard-cards"

interface UserStats {
  elo: number
  wins: number
  losses: number
  totalMatches: number
  winRate: number
}

interface RecentMatch {
  id: string
  opponent: string
  result: 'Won' | 'Lost' | 'Draw'
  eloChange: string
  time: string
}

interface LeaderboardEntry {
  id: string
  username: string
  elo: number
  rank: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false)
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false)
  const [searchMode, setSearchMode] = useState<"invite" | "friend">("invite")
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  
  // Real data states
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([])
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Fetch user stats and recent matches
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Fetch user stats and recent matches
        const userResponse = await fetch(`/api/users/${user.id}`)
        const userData = await userResponse.json()

        if (userData.user) {
          setUserStats({
            elo: userData.user.elo || 1200,
            wins: userData.user.wins || 0,
            losses: userData.user.losses || 0,
            totalMatches: userData.user.totalMatches || 0,
            winRate: userData.user.winRate || 0,
          })
        }

        if (userData.recentMatches) {
          setRecentMatches(userData.recentMatches.slice(0, 3).map((m: any) => ({
            ...m,
            time: formatRelativeTime(m.time)
          })))
        }

        // Fetch top 5 leaderboard
        const leaderboardResponse = await fetch('/api/leaderboard?limit=5')
        const leaderboardData = await leaderboardResponse.json()

        if (leaderboardData.users) {
          setTopPlayers(leaderboardData.users.map((u: any, idx: number) => ({
            id: u.id,
            username: u.username,
            elo: u.elo,
            rank: idx + 1,
          })))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  // Listen for user search modal open event
  useEffect(() => {
    const handleOpenUserSearch = (event: CustomEvent) => {
      setSearchMode(event.detail.mode)
      setIsUserSearchOpen(true)
    }

    window.addEventListener('open-user-search', handleOpenUserSearch as EventListener)
    return () => {
      window.removeEventListener('open-user-search', handleOpenUserSearch as EventListener)
    }
  }, [])

  const handleInviteUser = () => {
    setSearchMode("invite")
    setIsUserSearchOpen(true)
  }

  const handleAddFriend = () => {
    setSearchMode("friend")
    setIsUserSearchOpen(true)
  }

  const handleUserInvite = async (userId: string) => {
    if (!user?.id) return

    try {
      // First, create a 1v1 match
      const matchResponse = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: 1, // You can make this selectable
          timeLimit: 15,
          type: '1v1',
          maxParticipants: 2,
        }),
      })

      if (!matchResponse.ok) {
        throw new Error('Failed to create match')
      }

      const matchData = await matchResponse.json()
      
      // Join the match as host
      await fetch(`/api/matches/${matchData.match.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isHost: true }),
      })

      // Send invitation to the other user
      const inviteResponse = await fetch('/api/matches/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: userId,
          matchId: matchData.match.id,
        }),
      })

      if (inviteResponse.ok) {
        alert('Match invitation sent!')
        // Redirect to match lobby
        router.push(`/match/${matchData.match.id}`)
      } else {
        throw new Error('Failed to send invitation')
      }
    } catch (error) {
      console.error('Failed to invite user:', error)
      alert('Failed to send match invitation')
    }
  }

  const handleAddFriendAction = async (userId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: userId,
        }),
      })

      if (response.ok) {
        alert('Friend request sent!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Failed to send friend request:', error)
      alert('Failed to send friend request')
    }
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
                
                {/* Difficulty Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Select Difficulty</label>
                  <div className="flex items-center gap-3">
                    {(["Easy", "Medium", "Hard"] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedDifficulty(level)}
                        className={`flex-1 px-4 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                          selectedDifficulty === level
                            ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                            : 'bg-black/30 border-cyan-500/20 text-gray-300 hover:bg-black/50'
                        }`}
                      >
                        {level}
                        <div className="text-xs opacity-70 mt-1">
                          {level === 'Easy' ? '10 min' : level === 'Medium' ? '20 min' : '30 min'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsMatchmakingOpen(true)}
                  className="px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 neon-glow w-full"
                  style={{
                    background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                    color: "#0A0A0F",
                  }}
                >
                  Find {selectedDifficulty} Match
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
                {loading ? (
                  <div className="text-center text-gray-400 py-4">Loading stats...</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Elo Rating</span>
                      <span className="text-cyan-400 font-bold text-lg">{userStats?.elo || 1200}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Wins / Losses</span>
                      <span className="text-magenta-secondary font-bold">{userStats?.wins || 0} / {userStats?.losses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Matches</span>
                      <span className="text-white font-bold">{userStats?.totalMatches || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="text-cyan-400 font-bold">{userStats?.winRate || 0}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Leaderboard Preview */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Top 5 Players</h3>
                {loading ? (
                  <div className="text-center text-gray-400 py-4">Loading leaderboard...</div>
                ) : topPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {topPlayers.map((player) => (
                      <div key={player.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">#{player.rank}</span>
                        <span className="text-white">{player.username}</span>
                        <span className="text-cyan-400 font-bold">{player.elo}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-4 text-sm">No players yet</div>
                )}
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
                {loading ? (
                  <div className="text-center text-gray-400 py-4">Loading matches...</div>
                ) : recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="flex justify-between items-center p-2 bg-black/50 rounded">
                        <div>
                          <div className="text-white text-sm font-semibold">vs {match.opponent}</div>
                          <div className="text-xs text-gray-400">{match.time}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${match.result === "Won" ? "text-green-400" : match.result === "Lost" ? "text-red-400" : "text-gray-400"}`}>
                            {match.result}
                          </div>
                          <div className="text-xs text-gray-400">{match.eloChange}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-4 text-sm">No recent matches</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <MatchmakingModal isOpen={isMatchmakingOpen} onClose={() => setIsMatchmakingOpen(false)} difficulty={selectedDifficulty} />
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
