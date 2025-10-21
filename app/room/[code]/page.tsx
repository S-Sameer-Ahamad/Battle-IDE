"use client"

import { useState } from "react"
import AppHeader from "@/components/app-header"
import MainFooter from "@/components/main-footer"

export default function RoomPage({ params }: { params: { code: string } }) {
  const [selectedProblem, setSelectedProblem] = useState("")
  const [isHost] = useState(true)

  return (
    <div className="min-h-screen bg-black">
      <AppHeader />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Custom Room</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Room Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Invite Card */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Room Code</h3>
                <div className="bg-black/50 p-4 rounded-lg mb-4 font-mono text-center text-cyan-400 font-bold text-2xl">
                  {params.code}
                </div>
                <button
                  className="w-full py-2 rounded-lg font-bold"
                  style={{
                    background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                    color: "#0A0A0F",
                  }}
                >
                  Copy Invite Link
                </button>
              </div>

              {/* Participants */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Participants (2/5)</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white font-bold">
                      U
                    </div>
                    <div>
                      <div className="text-white font-semibold">You</div>
                      <div className="text-xs text-gray-400">Host</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <div className="text-white font-semibold">Player 2</div>
                      <div className="text-xs text-gray-400">Joined 2 min ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Problem Selector */}
              {isHost && (
                <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                  <h3 className="text-white font-bold mb-4">Select Problem</h3>
                  <select
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500 mb-4"
                  >
                    <option value="">Choose a problem...</option>
                    <option value="1">Two Sum</option>
                    <option value="2">Add Two Numbers</option>
                    <option value="3">Longest Substring</option>
                  </select>
                  <button
                    disabled={!selectedProblem}
                    className="w-full py-2 rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                      color: "#0A0A0F",
                    }}
                  >
                    Start Match
                  </button>
                </div>
              )}

              {!isHost && (
                <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6 text-center">
                  <p className="text-gray-400">Waiting for host to start the match...</p>
                </div>
              )}

              {/* Chat */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Room Chat</h3>
                <div className="bg-black/50 rounded-lg p-4 h-48 overflow-y-auto mb-4 space-y-2">
                  <div className="text-sm">
                    <span className="text-cyan-400 font-semibold">You:</span>
                    <span className="text-gray-300 ml-2">Let's solve some problems!</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-magenta-secondary font-semibold">Player 2:</span>
                    <span className="text-gray-300 ml-2">Sounds good!</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-600 transition-colors">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  )
}
