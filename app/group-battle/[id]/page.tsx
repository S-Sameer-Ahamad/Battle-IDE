"use client"

import { useState } from "react"

export default function GroupBattleScreen({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("editor")
  const [timeLeft, setTimeLeft] = useState(600)

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="bg-accent-card border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-white font-bold">Group Battle #{params.id}</div>
          <div className="text-cyan-400 font-bold">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>
        <button
          className="px-6 py-2 rounded-lg font-bold"
          style={{
            background: "linear-gradient(135deg, #00FFFF, #FF007F)",
            color: "#0A0A0F",
          }}
        >
          Submit
        </button>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Problem */}
        <div className="w-1/4 border-r border-cyan-500/20 overflow-y-auto p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-2">Two Sum</h1>
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
              Medium
            </span>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Description</h3>
            <p className="text-gray-400 text-sm">Given an array of integers nums and an integer target...</p>
          </div>
        </div>

        {/* Middle Panel - Editor */}
        <div className="w-1/2 border-r border-cyan-500/20 flex flex-col">
          <div className="flex border-b border-cyan-500/20 bg-black/50">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "editor" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "console" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400"
              }`}
            >
              Console
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === "editor" && (
              <textarea
                className="w-full h-full p-4 bg-black text-white font-mono text-sm focus:outline-none resize-none"
                spellCheck="false"
                defaultValue="// Write your solution here\n"
              />
            )}
            {activeTab === "console" && (
              <div className="p-4 text-gray-400 font-mono text-sm overflow-y-auto h-full">
                <div>Test Case 1: PASSED</div>
                <div>Test Case 2: PASSED</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Group Leaderboard */}
        <div className="w-1/4 border-l border-cyan-500/20 overflow-y-auto p-6">
          <h3 className="text-white font-bold mb-4">Live Leaderboard</h3>
          <div className="space-y-3">
            {[
              { rank: 1, name: "You", progress: 5, time: "2:34" },
              { rank: 2, name: "Player 2", progress: 4, time: "3:12" },
              { rank: 3, name: "Player 3", progress: 3, time: "4:45" },
              { rank: 4, name: "Player 4", progress: 2, time: "5:20" },
              { rank: 5, name: "Player 5", progress: 1, time: "6:10" },
            ].map((player) => (
              <div key={player.rank} className="bg-black/50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">#{player.rank}</span>
                    <span className="text-white font-semibold">{player.name}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{player.time}</span>
                </div>
                <div className="bg-black/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-magenta-secondary h-full"
                    style={{ width: `${(player.progress / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">{player.progress} / 5 passed</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
