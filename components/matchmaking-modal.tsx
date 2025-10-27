"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface MatchmakingModalProps {
  isOpen: boolean
  onClose: () => void
  difficulty: "Easy" | "Medium" | "Hard"
}

export default function MatchmakingModal({ isOpen, onClose, difficulty }: MatchmakingModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [state, setState] = useState<"searching" | "found">("searching")
  const [opponent, setOpponent] = useState<any>(null)
  const [countdown, setCountdown] = useState(5)
  const [matchId, setMatchId] = useState<string | null>(null)
  const startedRef = useRef(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Poll matchmaking API
  useEffect(() => {
    if (!isOpen || !user?.id || state !== "searching") return

    const pollMatchmaking = async () => {
      try {
        const response = await fetch('/api/matchmaking/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, preferredDifficulty: difficulty }),
        })

        const data = await response.json()

        if (data.status === 'matched') {
          // Match found!
          setState("found")
          setOpponent(data.opponent)
          setMatchId(data.match.id)
          clearInterval(pollingRef.current!)
        }
        // If status is 'searching', continue polling
      } catch (error) {
        console.error('Matchmaking error:', error)
      }
    }

    // Initial call
    pollMatchmaking()

  // Poll every 1 second for snappier UX
  pollingRef.current = setInterval(pollMatchmaking, 1000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      // Cancel matchmaking when modal closes
      if (user?.id && state === "searching") {
        fetch(`/api/matchmaking/find?userId=${user.id}`, { method: 'DELETE' })
      }
    }
  }, [isOpen, user, state, difficulty])

  useEffect(() => {
  if (state !== "found" || !matchId) return

    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Auto-navigate to match
      if (startedRef.current) return
      startedRef.current = true
      router.push(`/match/${matchId}`)
      onClose()
    }
  }, [state, countdown, matchId, router, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-12 max-w-md w-full mx-4">
        {state === "searching" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Searching for Opponent...</h2>

            {/* Chosen Difficulty */}
            <div className="flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-sm border ${
                difficulty === 'Easy' ? 'bg-green-500/20 border-green-500/40 text-green-300' :
                difficulty === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200' :
                'bg-red-500/20 border-red-500/40 text-red-300'
              }`}>
                {difficulty} {difficulty === 'Easy' ? '(10m)' : difficulty === 'Medium' ? '(20m)' : '(30m)'}
              </span>
            </div>

            {/* Animated Radar */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full"></div>
                <div className="absolute inset-2 border-2 border-cyan-500/20 rounded-full"></div>
                <div className="absolute inset-4 border-2 border-cyan-500/10 rounded-full"></div>
                <div
                  className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-full"
                  style={{
                    animation: "spin 2s linear infinite",
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400">Searching for opponent...</p>
              <p className="text-cyan-400 font-bold">ELO Range: ±200 • {difficulty} problem</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {state === "found" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-green-400">Match Found!</h2>

            {/* VS Layout */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                  U
                </div>
                <div className="text-white font-bold">You</div>
                <div className="text-xs text-gray-400">1250 Elo</div>
              </div>

              <div className="text-2xl font-bold text-cyan-400">VS</div>

              <div className="flex-1">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-magenta-secondary to-cyan-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                  {opponent?.username?.[0]?.toUpperCase() || 'O'}
                </div>
                <div className="text-white font-bold">{opponent?.username || 'Opponent'}</div>
                <div className="text-xs text-gray-400">{opponent?.elo || 1500} Elo</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 mb-2">Starting in</p>
              <p className="text-4xl font-bold text-cyan-400">{countdown}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
            >
              Decline
            </button>
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
