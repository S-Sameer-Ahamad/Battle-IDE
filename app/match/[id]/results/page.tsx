'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getRatingTier, getRatingColor } from '@/lib/elo'
import dynamic from 'next/dynamic'

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface User {
  id: string
  username: string
  elo: number
}

interface Submission {
  id: string
  userId: string
  code: string
  language: string
  status: string
  passedTests: number
  totalTests: number
  executionTime: number
  memory: number
  submittedAt: string
  user: User
}

interface Problem {
  id: number
  title: string
  difficulty: string
}

interface Match {
  id: string
  problemId: number
  type: string
  status: string
  winnerId: string | null
  createdAt: string
  startedAt: string | null
  endedAt: string | null
  problem: Problem
  submissions: Submission[]
  participants: {
    userId: string
    user: User
  }[]
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const matchId = params.id as string

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchMatchResults()
  }, [matchId, user])

  const fetchMatchResults = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/matches/${matchId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch match results')
      }

      const data = await response.json()
      setMatch(data.match)

      // Show confetti if current user won
      if (data.match.winnerId === user?.id) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
    } catch (err) {
      console.error('Error fetching match results:', err)
      setError(err instanceof Error ? err.message : 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const handleRematch = async () => {
    if (!match) return

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: match.problemId,
          timeLimit: 15,
          type: match.type,
          maxParticipants: 2,
        }),
      })

      if (!response.ok) throw new Error('Failed to create rematch')

      const data = await response.json()
      
      await fetch(`/api/matches/${data.match.id}/join`, {
        method: 'POST',
      })

      router.push(`/match/${data.match.id}`)
    } catch (err) {
      console.error('Error creating rematch:', err)
      setError('Failed to create rematch')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <p className="text-white">Please log in to view results</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
          <p className="text-red-400 text-center">{error || 'Match not found'}</p>
          <button
            onClick={() => router.push('/matchmaking')}
            className="mt-4 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          >
            Back to Matchmaking
          </button>
        </div>
      </div>
    )
  }

  const winner = match.participants.find(p => p.userId === match.winnerId)
  const loser = match.participants.find(p => p.userId !== match.winnerId)
  const winnerSubmission = match.submissions.find(s => s.userId === match.winnerId)
  const loserSubmission = match.submissions.find(s => s.userId !== match.winnerId)

  const isWinner = match.winnerId === user.id
  const matchDuration = match.startedAt && match.endedAt
    ? Math.floor((new Date(match.endedAt).getTime() - new Date(match.startedAt).getTime()) / 1000)
    : 0

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animation: `fall ${3 + Math.random() * 3}s linear ${Math.random() * 4}s forwards`,
              }}
            >
              <div
                className="w-2 h-3"
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`,
                  backgroundColor: ['#00FFFF', '#FF00FF', '#FFD700'][Math.floor(Math.random() * 3)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="group flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-8"
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-magenta-secondary bg-clip-text text-transparent">
            {isWinner ? 'Victory!' : 'Good Fight!'}
          </h1>
          <p className="text-2xl text-gray-300">
            {winner?.user.username} <span className="text-gray-500">defeated</span> {loser?.user.username}
          </p>
          <p className="text-gray-400 mt-3">
            Problem: <span className={getDifficultyColor(match.problem.difficulty)}>{match.problem.title}</span>
          </p>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6 text-center">
            <div className="text-gray-400 text-sm mb-2">Match Duration</div>
            <div className="text-3xl font-bold text-cyan-400">{formatDuration(matchDuration)}</div>
          </div>
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6 text-center">
            <div className="text-gray-400 text-sm mb-2">Total Submissions</div>
            <div className="text-3xl font-bold text-magenta-secondary">{match.submissions.length}</div>
          </div>
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6 text-center">
            <div className="text-gray-400 text-sm mb-2">Match Type</div>
            <div className="text-3xl font-bold text-white">{match.type === '1v1' ? '1v1 Duel' : 'Group Battle'}</div>
          </div>
        </div>

        {/* ELO Changes */}
        {match.type === '1v1' && winner && loser && (
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 mb-10">
            <h2 className="text-3xl font-bold text-center mb-6 text-white">
              Rating Changes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Winner */}
              <div className="bg-black/30 rounded-lg p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xl font-bold">{winner.user.username}</div>
                    <div className="text-sm text-green-400">Winner</div>
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400">New Rating</div>
                    <div className="text-2xl font-bold text-white">
                      {winner.user.elo}
                      <span className="text-green-400 text-lg ml-2">+10</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">New Tier</div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: getRatingColor(winner.user.elo) }}
                    >
                      {getRatingTier(winner.user.elo)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loser */}
              <div className="bg-black/30 rounded-lg p-6 border border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xl font-bold">{loser.user.username}</div>
                    <div className="text-sm text-red-400">Defeated</div>
                  </div>
                  <div className="text-4xl">💔</div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400">New Rating</div>
                    <div className="text-2xl font-bold text-white">
                      {loser.user.elo}
                      <span className="text-red-400 text-lg ml-2">-10</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">New Tier</div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: getRatingColor(loser.user.elo) }}
                    >
                      {getRatingTier(loser.user.elo)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Comparison */}
        {winnerSubmission && loserSubmission && (
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 mb-10">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Code Comparison</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Winner's Code */}
              <div>
                <div className="flex items-center justify-between mb-3 px-2">
                  <div>
                    <div className="text-lg font-bold text-green-400">{winner?.user.username}'s Code</div>
                    <div className="text-sm text-gray-400">{winnerSubmission.language}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">
                      ✅ {winnerSubmission.passedTests}/{winnerSubmission.totalTests} Tests
                    </div>
                    <div className="text-xs text-gray-400">
                      {winnerSubmission.executionTime.toFixed(2)}ms • {winnerSubmission.memory}KB
                    </div>
                  </div>
                </div>
                <div className="border border-green-500/30 rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="400px"
                    language={winnerSubmission.language.toLowerCase()}
                    value={winnerSubmission.code}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>

              {/* Loser's Code */}
              <div>
                <div className="flex items-center justify-between mb-3 px-2">
                  <div>
                    <div className="text-lg font-bold text-red-400">{loser?.user.username}'s Code</div>
                    <div className="text-sm text-gray-400">{loserSubmission.language}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-bold">
                      ❌ {loserSubmission.passedTests}/{loserSubmission.totalTests} Tests
                    </div>
                    <div className="text-xs text-gray-400">
                      {loserSubmission.executionTime.toFixed(2)}ms • {loserSubmission.memory}KB
                    </div>
                  </div>
                </div>
                <div className="border border-red-500/30 rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="400px"
                    language={loserSubmission.language.toLowerCase()}
                    value={loserSubmission.code}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission History */}
        <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-white">Submission History</h2>
          <div className="space-y-4">
            {match.submissions.map((submission) => {
              const participant = match.participants.find(p => p.userId === submission.userId)
              return (
                <div
                  key={submission.id}
                  className="bg-black/30 rounded-lg p-4 flex items-center justify-between flex-wrap gap-4 border border-cyan-500/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {submission.userId === match.winnerId ? '🏆' : '💻'}
                    </div>
                    <div>
                      <div className="font-bold">{participant?.user.username}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div>
                      <div className="text-sm text-gray-400">Language</div>
                      <div className="font-bold">{submission.language}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Tests</div>
                      <div className={`font-bold ${submission.status === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                        {submission.passedTests}/{submission.totalTests}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Time</div>
                      <div className="font-bold">{submission.executionTime.toFixed(2)}ms</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Memory</div>
                      <div className="font-bold">{submission.memory}KB</div>
                    </div>
                    <div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        submission.status === 'Accepted'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {submission.status}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={handleRematch}
            className="px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 neon-glow"
            style={{
              background: "linear-gradient(135deg, #00FFFF, #FF007F)",
              color: "#0A0A0F",
            }}
          >
            ⚔️ Rematch
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-accent-card border border-cyan-500/20 hover:border-cyan-500/40 text-white font-bold rounded-lg transition-colors"
          >
            � Dashboard
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .neon-glow {
          box-shadow: 0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #FF007F, 0 0 20px #FF007F;
        }
      `}</style>
    </div>
  )
}
