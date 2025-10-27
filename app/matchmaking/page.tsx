"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import AuthenticatedLayout from "@/components/authenticated-layout"
import MatchmakingModal from "@/components/matchmaking-modal"

interface Problem {
  id: number
  title: string
  difficulty: string
  description: string
}

interface Match {
  id: string
  problemId: number
  type: string
  status: string
  roomCode: string | null
  timeLimit: number
  maxParticipants: number
  createdAt: string
  problem: Problem
  _count: {
    participants: number
  }
}

export default function MatchmakingPage() {
  // Matchmaking page component
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'quick' | 'create' | 'join'>('quick')
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard">('Medium')
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])
  const [availableMatches, setAvailableMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create match form state
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null)
  const [timeLimit, setTimeLimit] = useState(15)
  const [matchType, setMatchType] = useState<'1v1' | 'group'>('1v1')
  const [maxParticipants, setMaxParticipants] = useState(2)

  // Join with code
  const [roomCode, setRoomCode] = useState('')

  // Fetch problems and matches
  useEffect(() => {
    fetchProblems()
    fetchAvailableMatches()
    
    // Poll for new matches every 5 seconds
    const interval = setInterval(fetchAvailableMatches, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/problems')
      const data = await response.json()
      setProblems(data.problems || [])
      if (data.problems?.length > 0) {
        setSelectedProblem(data.problems[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    }
  }

  const fetchAvailableMatches = async () => {
    try {
      const response = await fetch('/api/matches?status=waiting')
      const data = await response.json()
      setAvailableMatches(data.matches || [])
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    }
  }

  const handleQuickPlay = async () => {
    // Open the real-time queue modal for the selected difficulty
    setIsMatchmakingOpen(true)
  }

  const createMatch = async (problemId: number, timeLimit: number, type: string, maxParticipants: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          timeLimit,
          type,
          maxParticipants,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create match')
      }

      const data = await response.json()
      
      // Join the match we just created
      await joinMatch(data.match.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  const joinMatch = async (matchId: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, isHost: false }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to join match')
      }

      // Navigate to battle room
      router.push(`/match/${matchId}`)
    } catch (error) {
      throw error
    }
  }

  const handleCreateMatch = async () => {
    if (!selectedProblem) {
      setError('Please select a problem')
      return
    }

    await createMatch(selectedProblem, timeLimit, matchType, maxParticipants)
  }

  const handleJoinWithCode = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Find match by room code
      const response = await fetch(`/api/matches?roomCode=${roomCode}`)
      const data = await response.json()

      if (!data.matches || data.matches.length === 0) {
        throw new Error('Room not found')
      }

      const match = data.matches[0]
      await joinMatch(match.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthenticatedLayout>
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-accent-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-secondary bg-clip-text text-transparent">
            Matchmaking
          </h1>
          <p className="text-gray-400 mt-2">Find opponents and start coding battles</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-cyan-500/20">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'quick'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Quick Play
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'create'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Match
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'join'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Join with Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Play Tab */}
            {activeTab === 'quick' && (
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Quick Play</h2>
                <p className="text-gray-400 mb-6">
                  Jump into a random match instantly. We'll find an opponent or create a new room for you!
                </p>
                <div className="space-y-4">
                  {/* Choose Difficulty First */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Choose Difficulty</label>
                    <div className="flex items-center gap-3">
                      {(["Easy","Medium","Hard"] as const).map(level => (
                        <button
                          key={level}
                          onClick={() => setSelectedDifficulty(level)}
                          className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                            selectedDifficulty === level
                              ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                              : 'bg-black/30 border-cyan-500/20 text-gray-300 hover:bg-black/50'
                          }`}
                        >
                          {level} {level === 'Easy' ? '(10m)' : level === 'Medium' ? '(20m)' : '(30m)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Available Matches</span>
                      <span className="text-cyan-400 font-bold">{availableMatches.length}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {availableMatches.length > 0
                        ? 'Join an existing match or create a new one'
                        : 'No matches available - creating a new one!'}
                    </div>
                  </div>

                  <button
                    onClick={handleQuickPlay}
                    disabled={loading || problems.length === 0}
                    className="w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                      color: "#0A0A0F",
                    }}
                  >
                    {loading ? 'Finding Match...' : `Find ${selectedDifficulty} Match`}
                  </button>
                </div>
              </div>
            )}

            {/* Create Match Tab */}
            {activeTab === 'create' && (
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Create Custom Match</h2>
                <p className="text-gray-400 mb-6">
                  Configure your own battle with custom settings
                </p>

                <div className="space-y-6">
                  {/* Problem Selection */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Select Problem</label>
                    <select
                      value={selectedProblem || ''}
                      onChange={(e) => setSelectedProblem(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      {problems.map((problem) => (
                        <option key={problem.id} value={problem.id}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Match Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Match Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setMatchType('1v1')
                          setMaxParticipants(2)
                        }}
                        className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                          matchType === '1v1'
                            ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                            : 'border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        1v1 Duel
                      </button>
                      <button
                        onClick={() => {
                          setMatchType('group')
                          setMaxParticipants(4)
                        }}
                        className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                          matchType === 'group'
                            ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                            : 'border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        Group Battle
                      </button>
                    </div>
                  </div>

                  {/* Time Limit */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Time Limit: {timeLimit} minutes
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5 min</span>
                      <span>30 min</span>
                    </div>
                  </div>

                  {/* Max Participants (for group) */}
                  {matchType === 'group' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Max Participants: {maxParticipants}
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>2</span>
                        <span>8</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCreateMatch}
                    disabled={loading || !selectedProblem}
                    className="w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                      color: "#0A0A0F",
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Match'}
                  </button>
                </div>
              </div>
            )}

            {/* Join with Code Tab */}
            {activeTab === 'join' && (
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Join with Room Code</h2>
                <p className="text-gray-400 mb-6">
                  Enter a room code to join a private match
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Room Code</label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Enter room code..."
                      className="w-full px-4 py-3 bg-black border border-cyan-500/30 rounded-lg text-white text-center text-2xl font-mono tracking-wider focus:outline-none focus:border-cyan-500"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={handleJoinWithCode}
                    disabled={loading || !roomCode.trim()}
                    className="w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                      color: "#0A0A0F",
                    }}
                  >
                    {loading ? 'Joining...' : 'Join Room'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Available Matches */}
          <div className="lg:col-span-1">
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Available Matches</h3>
              
              {availableMatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No matches available</p>
                  <p className="text-sm mt-2">Create one to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableMatches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-black/30 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-colors cursor-pointer"
                      onClick={() => !loading && joinMatch(match.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{match.problem.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          match.problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          match.problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {match.problem.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">
                          {match._count.participants}/{match.maxParticipants} players
                        </span>
                        <span className="text-cyan-400">{match.timeLimit}m</span>
                      </div>

                      {match.roomCode && (
                        <div className="mt-2 text-xs font-mono text-gray-500">
                          Code: {match.roomCode}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User Stats */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6 mt-4">
              <h3 className="text-xl font-bold mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">ELO Rating</span>
                  <span className="text-cyan-400 font-bold">{user?.elo || 1200}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wins</span>
                  <span className="text-green-400 font-bold">{user?.wins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Losses</span>
                  <span className="text-red-400 font-bold">{user?.losses || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Matchmaking Modal controlled by page with chosen difficulty */}
      <MatchmakingModal
        isOpen={isMatchmakingOpen}
        onClose={() => setIsMatchmakingOpen(false)}
        difficulty={selectedDifficulty}
      />
    </AuthenticatedLayout>
  )
}
