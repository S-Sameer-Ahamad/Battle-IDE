"use client"

import { useState, use } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { useRouter } from "next/navigation"

export default function GroupBattleResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

  const results = [
    { rank: 1, username: "You", testCases: 5, time: "2:34", eloChange: "+25" },
    { rank: 2, username: "Player 2", testCases: 4, time: "3:12", eloChange: "+15" },
    { rank: 3, username: "Player 3", testCases: 3, time: "4:45", eloChange: "+5" },
    { rank: 4, username: "Player 4", testCases: 2, time: "5:20", eloChange: "-10" },
    { rank: 5, username: "Player 5", testCases: 1, time: "6:10", eloChange: "-15" },
  ]

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Result Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-green-400">Victory!</span>
            </h1>
            <p className="text-gray-400 text-lg">You finished 1st in the group battle</p>
          </div>

          {/* Group Results Table */}
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-cyan-500/20 bg-black/50">
              <h2 className="text-xl font-bold text-white">Final Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-black/30">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Player</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Test Cases</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Elo Change</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((player) => (
                    <tr key={player.rank} className="border-b border-cyan-500/10 hover:bg-black/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">#{player.rank}</span>
                          {player.rank === 1 && <span className="text-yellow-400">🏆</span>}
                          {player.rank === 2 && <span className="text-gray-400">🥈</span>}
                          {player.rank === 3 && <span className="text-orange-400">🥉</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white text-xs font-bold">
                            {player.username[0]}
                          </div>
                          <span className="text-white font-semibold">{player.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-cyan-400 font-bold">{player.testCases}/5</td>
                      <td className="px-6 py-4 text-white">{player.time}</td>
                      <td className={`px-6 py-4 font-bold ${player.eloChange.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {player.eloChange}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-cyan-500/20">
            <button
              onClick={() => setActiveTab(0)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 0 ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Official Solution
            </button>
          </div>

            {/* Content */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 mb-8">
              {activeTab === 0 && (
                  <div>
                    <h3 className="text-white font-bold mb-4">Official Solution</h3>
                    <p className="text-gray-400 mb-4">
                      The optimal approach uses a hash map to store previously seen numbers and their indices. This allows
                      us to solve the problem in O(n) time complexity instead of O(n²).
                    </p>
                    <pre className="bg-black/50 p-4 rounded-lg text-gray-300 font-mono text-sm overflow-x-auto">
                      {`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`}
                    </pre>
                  </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-8 py-3 rounded-lg font-bold border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                className="px-8 py-3 rounded-lg font-bold"
                style={{
                  background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                  color: "#0A0A0F",
                }}
              >
                Play Again
              </button>
            </div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}