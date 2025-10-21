"use client"

import AppHeader from "@/components/app-header"
import MainFooter from "@/components/main-footer"
import { useRouter } from "next/navigation"

export default function GroupBattleResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black">
      <AppHeader />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Battle Results</h1>

          {/* Results Table */}
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-black/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Test Cases Passed</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Final Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: "You", passed: 5, time: "2:34" },
                  { rank: 2, name: "Player 2", passed: 5, time: "3:12" },
                  { rank: 3, name: "Player 3", passed: 4, time: "4:45" },
                  { rank: 4, name: "Player 4", passed: 3, time: "5:20" },
                  { rank: 5, name: "Player 5", passed: 2, time: "6:10" },
                ].map((player) => (
                  <tr key={player.rank} className="border-b border-cyan-500/10 hover:bg-black/50">
                    <td className="px-6 py-4 text-white font-bold">#{player.rank}</td>
                    <td className="px-6 py-4 text-white">{player.name}</td>
                    <td className="px-6 py-4 text-cyan-400 font-bold">{player.passed} / 5</td>
                    <td className="px-6 py-4 text-white">{player.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      <MainFooter />
    </div>
  )
}
