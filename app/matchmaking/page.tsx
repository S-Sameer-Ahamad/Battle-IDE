"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function MatchmakingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [problems, setProblems] = useState([])
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState("any")

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Fetch available problems
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/problems')
        if (response.ok) {
          const data = await response.json()
          setProblems(data.problems || [])
        }
      } catch (error) {
        console.error('Failed to fetch problems:', error)
      }
    }

    fetchProblems()
  }, [user, router])

  // Simulate matchmaking search
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSearching])

  const handleStartSearch = async () => {
    setIsSearching(true)
    setSearchTime(0)

    try {
      // Create a real match
      const response = await fetch('/api/test-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/match/${data.match.id}`)
      } else {
        const errorData = await response.json()
        console.error('Failed to create match:', errorData)
        setIsSearching(false)
      }
    } catch (error) {
      console.error('Error creating match:', error)
      setIsSearching(false)
    }
  }

  const handleStopSearch = () => {
    setIsSearching(false)
    setSearchTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!user) {
    return null
  }

  return (
    <AuthenticatedLayout>
      <main className="min-h-screen bg-black px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Find Your Battle</h1>
            <p className="text-gray-400 text-lg">
              Get matched with an opponent of similar skill level
            </p>
          </div>

          {/* Matchmaking Card */}
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8">
            {!isSearching ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Ready to Battle?</h2>
                
                {/* Difficulty Selection */}
                <div className="mb-8">
                  <label className="block text-white font-semibold mb-4">Choose Difficulty</label>
                  <div className="flex gap-4 justify-center">
                    {['any', 'easy', 'medium', 'hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          selectedDifficulty === diff
                            ? 'bg-cyan-500 text-black'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Problem Selection */}
                {problems.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-white font-semibold mb-4">Select Problem (Optional)</label>
                    <select
                      value={selectedProblem || ''}
                      onChange={(e) => setSelectedProblem(e.target.value)}
                      className="w-full max-w-md mx-auto px-4 py-3 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Random Problem</option>
                      {problems.map((problem: any) => (
                        <option key={problem.id} value={problem.id}>
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleStartSearch}
                  className="px-12 py-4 rounded-lg font-bold text-xl transition-all duration-300 neon-glow"
                  style={{
                    background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                    color: "#0A0A0F",
                  }}
                >
                  Find Opponent
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <h2 className="text-2xl font-bold text-white mb-2">Searching for Opponent...</h2>
                  <p className="text-gray-400">Time: {formatTime(searchTime)}</p>
                </div>

                <div className="bg-black/50 rounded-lg p-6 mb-8">
                  <h3 className="text-white font-semibold mb-4">Search Criteria</h3>
                  <div className="text-gray-300 space-y-2">
                    <div>• Difficulty: {selectedDifficulty === 'any' ? 'Any' : selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}</div>
                    <div>• Skill Level: ~{user.elo} ELO</div>
                    <div>• Problem: {selectedProblem ? problems.find((p: any) => p.id === selectedProblem)?.title : 'Random'}</div>
                  </div>
                </div>

                <button
                  onClick={handleStopSearch}
                  className="px-8 py-3 rounded-lg font-semibold border-2 border-red-500 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Cancel Search
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">2.3s</div>
              <div className="text-gray-400">Average Wait Time</div>
            </div>
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-magenta-secondary mb-2">1,247</div>
              <div className="text-gray-400">Players Online</div>
            </div>
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">98%</div>
              <div className="text-gray-400">Match Success Rate</div>
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
