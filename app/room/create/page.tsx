"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import AuthenticatedLayout from "@/components/authenticated-layout"

interface Problem {
  id: number
  title: string
  difficulty: string
}

export default function CreateRoomPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  
  // Room settings
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null)
  const [maxParticipants, setMaxParticipants] = useState(5)
  const [timeLimit, setTimeLimit] = useState(15)

  useEffect(() => {
    fetchProblems()
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
      setError('Failed to load problems')
    }
  }

  const handleCreateRoom = async () => {
    if (!user?.id) {
      setError('You must be logged in to create a room')
      return
    }

    if (!selectedProblem) {
      setError('Please select a problem')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: user.id,
          hostUsername: user.username,
          maxParticipants,
          timeLimit,
          problemId: selectedProblem,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create room')
      }

      const data = await response.json()
      
      // Redirect to the room
      router.push(`/room/${data.match.roomCode}`)
    } catch (error) {
      console.error('Error creating room:', error)
      setError(error instanceof Error ? error.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Custom Room</h1>
          <p className="text-gray-400">Configure your room settings and invite friends to join</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Room Settings Card */}
        <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Room Settings</h2>

          <div className="space-y-6">
            {/* Problem Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Select Problem
              </label>
              <select
                value={selectedProblem || ''}
                onChange={(e) => setSelectedProblem(Number(e.target.value))}
                className="w-full px-4 py-3 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                disabled={problems.length === 0}
              >
                {problems.length === 0 ? (
                  <option value="">Loading problems...</option>
                ) : (
                  problems.map((problem) => (
                    <option key={problem.id} value={problem.id}>
                      {problem.title} ({problem.difficulty})
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the coding challenge for this room
              </p>
            </div>

            {/* Max Participants */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Max Participants: {maxParticipants}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2 players</span>
                <span>8 players</span>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Time Limit: {timeLimit} minutes
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 min</span>
                <span>30 min</span>
              </div>
            </div>

            {/* Room Info */}
            <div className="bg-black/30 rounded-lg p-4 border border-cyan-500/20">
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">Room Preview</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-white">Group Battle</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span className="text-white">{maxParticipants} players</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-white">{timeLimit} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Host:</span>
                  <span className="text-cyan-400">{user?.username || 'You'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRoom}
              disabled={loading || !selectedProblem || problems.length === 0}
              className="flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                color: "#0A0A0F",
              }}
            >
              {loading ? 'Creating Room...' : 'Create Room'}
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">💡 Tips</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• You'll receive a unique room code to share with friends</li>
            <li>• As the host, you can start the match when ready</li>
            <li>• All participants will solve the same problem simultaneously</li>
            <li>• The first to complete all test cases wins!</li>
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
