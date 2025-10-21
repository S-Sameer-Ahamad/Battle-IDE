"use client"

import React from "react"

import { useRouter } from "next/navigation"

export function QuickMatchCard() {
  const router = useRouter()

  return (
    <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 hover:border-cyan-500/40 transition-all">
      <h2 className="text-2xl font-bold text-white mb-2">Quick Match (Ranked)</h2>
      <p className="text-gray-400 mb-6">Get matched with an opponent of similar skill level instantly.</p>
      <button
        onClick={() => router.push("/matchmaking")}
        className="px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300 neon-glow"
        style={{
          background: "linear-gradient(135deg, #00FFFF, #FF007F)",
          color: "#0A0A0F",
        }}
      >
        Find Opponent
      </button>
    </div>
  )
}

export function FriendlyMatchCard() {
  const router = useRouter()

  return (
    <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 hover:border-cyan-500/40 transition-all">
      <h2 className="text-2xl font-bold text-white mb-2">Friendly Match</h2>
      <p className="text-gray-400 mb-6">Challenge a friend or invite someone by username.</p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/invite/generate")}
          className="flex-1 px-6 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
        >
          Generate Invite Link
        </button>
        <button
          onClick={() => router.push("/invite/username")}
          className="flex-1 px-6 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
        >
          Invite by Username
        </button>
      </div>
    </div>
  )
}

export function CustomRoomCard() {
  const router = useRouter()
  const [roomCode, setRoomCode] = React.useState("")

  return (
    <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 hover:border-cyan-500/40 transition-all">
      <h2 className="text-2xl font-bold text-white mb-2">Custom Room (2-5 Players)</h2>
      <p className="text-gray-400 mb-6">Create a room for group battles or join an existing one.</p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/room/create")}
          className="flex-1 px-6 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
        >
          Create Room
        </button>
        <input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          className="flex-1 px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          onClick={() => roomCode && router.push(`/room/${roomCode}`)}
          className="px-6 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
        >
          Join
        </button>
      </div>
    </div>
  )
}
