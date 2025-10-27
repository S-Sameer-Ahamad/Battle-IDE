"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

type Problem = {
  id: number
  title: string
  difficulty: string
}

export default function GenerateInvitePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [matchId, setMatchId] = useState<string | null>(null)

  const origin = useMemo(() => {
    if (typeof window !== 'undefined') return window.location.origin
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }, [])

  useEffect(() => {
    if (!user) return
  }, [user])

  const handleGenerate = async () => {
    if (!user?.id) {
      setError("You need to be logged in to generate an invite link.")
      return
    }
    setLoading(true)
    setError(null)
    setInviteUrl(null)
    setMatchId(null)

    try {
      // 1) Fetch problems by difficulty and pick one (random if multiple)
      const problemsRes = await fetch(`/api/problems?difficulty=${encodeURIComponent(difficulty)}&limit=50`)
      if (!problemsRes.ok) {
        throw new Error("Failed to fetch problems")
      }
      const problemsData: { problems: Problem[] } = await problemsRes.json()
      const list = problemsData.problems || []
      if (list.length === 0) {
        throw new Error(`No ${difficulty} problems available`)
      }
      const chosen = list[Math.floor(Math.random() * list.length)]

      // 2) Create a 1v1 match for the chosen problem
      const createRes = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: chosen.id, type: '1v1' }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create match')
      }
      const createData = await createRes.json()
      const newMatchId: string = createData.match.id

      // 3) Join as host
      const joinRes = await fetch(`/api/matches/${newMatchId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isHost: true }),
      })
      // Allow 400 if already joined due to race; otherwise error
      if (!joinRes.ok && joinRes.status !== 400) {
        const err = await joinRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to join match as host')
      }

      const url = `${origin}/match/${newMatchId}`
      setInviteUrl(url)
      setMatchId(newMatchId)
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      // Lightweight feedback
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-alert
        alert('Invite link copied to clipboard!')
      }
    } catch (e) {
      console.error('Failed to copy', e)
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-alert
        alert('Failed to copy link')
      }
    }
  }

  const goToLobby = () => {
    if (matchId) router.push(`/match/${matchId}`)
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Generate Invite Link</h1>
        <p className="text-gray-400 mb-8">Create a 1v1 match and share the link with a friend.</p>

        <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                color: "#0A0A0F",
              }}
            >
              {loading ? 'Generating…' : 'Generate Link'}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-sm">{error}</div>
          )}

          {inviteUrl && (
            <div className="mt-8">
              <label className="block text-sm text-gray-400 mb-2">Invite URL</label>
              <div className="flex gap-3">
                <input
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50"
                >
                  Copy
                </button>
                <button
                  onClick={goToLobby}
                  className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50"
                >
                  Open Lobby
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-2">Share this link. When your friend opens it, they will join your match.</p>
            </div>
          )}
        </div>

        <div className="mt-10">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
