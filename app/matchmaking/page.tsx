"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function MatchmakingPage() {
  const router = useRouter()
  const [eloWindow, setEloWindow] = useState(100)
  const [searchTime, setSearchTime] = useState(0)
  const [isSearching, setIsSearching] = useState(true)

  useEffect(() => {
    if (!isSearching) return

    // Simulate expanding Elo window
    const eloTimer = setInterval(() => {
      setEloWindow(prev => Math.min(prev + 50, 500))
    }, 5000)

    // Simulate search time
    const timeTimer = setInterval(() => {
      setSearchTime(prev => prev + 1)
    }, 1000)

    // Simulate finding opponent after 10-30 seconds
    const findTimer = setTimeout(() => {
      setIsSearching(false)
      router.push("/match/1")
    }, Math.random() * 20000 + 10000)

    return () => {
      clearInterval(eloTimer)
      clearInterval(timeTimer)
      clearTimeout(findTimer)
    }
  }, [isSearching, router])

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-8">Finding Your Opponent</h1>
            
            {/* Animated Radar */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full"></div>
                <div className="absolute inset-4 border-2 border-cyan-500/20 rounded-full"></div>
                <div className="absolute inset-8 border-2 border-cyan-500/10 rounded-full"></div>
                <div
                  className="absolute inset-0 border-2 border-transparent border-t-cyan-500 rounded-full"
                  style={{
                    animation: "spin 2s linear infinite",
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Search Stats */}
            <div className="space-y-4 mb-8">
              <div className="text-gray-400">
                <span className="text-cyan-400 font-bold">±{eloWindow}</span> Elo window
              </div>
              <div className="text-gray-400">
                Searching for <span className="text-cyan-400 font-bold">{searchTime}s</span>
              </div>
              <div className="text-gray-400">
                <span className="text-cyan-400 font-bold">12</span> players online
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="px-8 py-3 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
            >
              Cancel Search
            </button>
          </div>
        </div>
      </main>

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
    </AuthenticatedLayout>
  )
}