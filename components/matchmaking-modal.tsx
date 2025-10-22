"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface MatchmakingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MatchmakingModal({ isOpen, onClose }: MatchmakingModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [state, setState] = useState<"searching" | "found">("searching")
  const [eloWindow, setEloWindow] = useState(100)
  const [countdown, setCountdown] = useState(5)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!isOpen) return

    // Simulate finding opponent after 3 seconds
    const findTimer = setTimeout(() => {
      setState("found")
    }, 3000)

    return () => clearTimeout(findTimer)
  }, [isOpen])

  useEffect(() => {
  if (state !== "found") return

    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Auto-start: create a match and join with current user
      (async () => {
        if (startedRef.current) return
        startedRef.current = true
        try {
          if (!user?.id) {
            console.error('No authenticated user; cannot start match')
            onClose()
            return
          }
          // Create a simple 1v1 match with a random existing problem (fallback id: 1)
          const problemId = 1
          const createRes = await fetch('/api/matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problemId, type: '1v1' })
          })
          const createData = await createRes.json()
          if (!createRes.ok) throw new Error(createData.error || 'Failed to create match')

          const matchId = createData.match.id as string

          // Join match as current user
          const joinRes = await fetch(`/api/matches/${matchId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user?.id, isHost: true })
          })
          if (!joinRes.ok) {
            const err = await joinRes.json().catch(() => ({}))
            throw new Error(err.error || 'Failed to join match')
          }

          router.push(`/match/${matchId}`)
          onClose()
        } catch (e) {
          console.error('Failed to auto-start match:', e)
          onClose()
        }
      })()
    }
  }, [state, countdown, router, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-12 max-w-md w-full mx-4">
        {state === "searching" && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white">Searching for Opponent...</h2>

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
              <p className="text-gray-400">Expanding Elo window...</p>
              <p className="text-cyan-400 font-bold">±{eloWindow}</p>
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
                  O
                </div>
                <div className="text-white font-bold">Opponent</div>
                <div className="text-xs text-gray-400">1240 Elo</div>
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
