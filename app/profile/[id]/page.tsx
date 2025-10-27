"use client"

import { useState, use, useEffect } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { useAuth } from "@/lib/auth-context"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface UserData {
  id: string
  username: string
  email: string
  bio: string | null
  elo: number
  wins: number
  losses: number
  totalMatches: number
  winRate: number
  createdAt: string
}

interface RecentMatch {
  id: string
  opponent: string
  opponentElo: number
  result: string
  eloChange: string
  problem: string
  difficulty: string
  time: string
}

interface EloHistoryPoint {
  date: string
  elo: number
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user: currentUser } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([])
  const [eloHistory, setEloHistory] = useState<EloHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [isFriend, setIsFriend] = useState(false)
  const [friendRequestSent, setFriendRequestSent] = useState(false)

  const isOwnProfile = currentUser?.id === id

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${id}`)
        const data = await response.json()
        
        if (data.user) {
          setUserData(data.user)
        }
        if (data.recentMatches) {
          setRecentMatches(data.recentMatches)
        }
        if (data.eloHistory) {
          setEloHistory(data.eloHistory)
        }

        // Check if friend (if not own profile)
        if (!isOwnProfile && currentUser?.id) {
          const friendsResponse = await fetch(`/api/friends?userId=${currentUser.id}&type=accepted`)
          const friendsData = await friendsResponse.json()
          if (friendsData.friends) {
            setIsFriend(friendsData.friends.some((f: any) => f.id === id))
          }

          // Check if friend request already sent
          const sentResponse = await fetch(`/api/friends?userId=${currentUser.id}&type=sent`)
          const sentData = await sentResponse.json()
          if (sentData.requests) {
            setFriendRequestSent(sentData.requests.some((r: any) => r.userId === id))
          }
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id, currentUser?.id, isOwnProfile])

  // Handle add friend
  const handleAddFriend = async () => {
    if (!currentUser?.id || friendRequestSent || isFriend) return

    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: id,
        }),
      })

      if (response.ok) {
        setFriendRequestSent(true)
      }
    } catch (error) {
      console.error('Failed to send friend request:', error)
    }
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <main className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
            <div className="text-cyan-400 text-lg">Loading profile...</div>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  if (!userData) {
    return (
      <AuthenticatedLayout>
        <main className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
            <div className="text-gray-400 text-lg">User not found</div>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

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
                    {userData.username[0].toUpperCase()}
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-1">{userData.username}</h1>
                  <p className="text-gray-400 text-sm mb-6 text-center">
                    {userData.bio || 'Competitive Coder'}
                  </p>

                  <div className="w-full space-y-3 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{userData.elo}</div>
                      <div className="text-xs text-gray-400">Elo Rating</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{userData.wins}</div>
                        <div className="text-xs text-gray-400">Wins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">{userData.losses}</div>
                        <div className="text-xs text-gray-400">Losses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{userData.winRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <button
                      onClick={handleAddFriend}
                      disabled={isFriend || friendRequestSent}
                      className="w-full py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: isFriend || friendRequestSent ? "transparent" : "linear-gradient(135deg, #00FFFF, #FF007F)",
                        color: isFriend || friendRequestSent ? "#00FFFF" : "#0A0A0F",
                        border: isFriend || friendRequestSent ? "2px solid #00FFFF" : "none",
                      }}
                    >
                      {isFriend ? "Friends" : friendRequestSent ? "Request Sent" : "Add Friend"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & History */}
            <div className="lg:col-span-2 space-y-6">
              {/* Elo History Chart */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Elo History</h2>
                {eloHistory.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={eloHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94a3b8"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getMonth() + 1}/${date.getDate()}`
                          }}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          domain={['dataMin - 50', 'dataMax + 50']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #06b6d4',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          labelFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString()
                          }}
                          formatter={(value: any) => [`${value} ELO`, 'Rating']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="elo" 
                          stroke="#06b6d4" 
                          strokeWidth={2}
                          dot={{ fill: '#06b6d4', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 bg-black/50 rounded-lg flex items-center justify-center text-gray-400">
                    No match history available yet
                  </div>
                )}
              </div>

              {/* Match History */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Recent Matches</h2>
                {recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="flex justify-between items-center p-3 bg-black/50 rounded-lg hover:bg-black/70 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold">vs {match.opponent}</span>
                            <span className="text-xs text-gray-400">({match.opponentElo} ELO)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{match.problem}</span>
                            <span>•</span>
                            <span className={`
                              ${match.difficulty === 'Easy' ? 'text-green-400' : ''}
                              ${match.difficulty === 'Medium' ? 'text-yellow-400' : ''}
                              ${match.difficulty === 'Hard' ? 'text-red-400' : ''}
                            `}>
                              {match.difficulty}
                            </span>
                            <span>•</span>
                            <span>{formatRelativeTime(match.time)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            match.result === 'Won' ? 'text-green-400' : 
                            match.result === 'Lost' ? 'text-red-400' : 
                            'text-gray-400'
                          }`}>
                            {match.result}
                          </div>
                          <div className={`text-xs ${
                            match.eloChange.startsWith('+') ? 'text-green-400' : 
                            match.eloChange.startsWith('-') ? 'text-red-400' : 
                            'text-gray-400'
                          }`}>
                            {match.eloChange} Elo
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-black/50 rounded-lg flex items-center justify-center text-gray-400">
                    No matches played yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
