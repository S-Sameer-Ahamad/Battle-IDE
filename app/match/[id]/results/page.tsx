"use client"

import { useState, use } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { useRouter } from "next/navigation"

export default function PostMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Result Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-green-400">Victory!</span>
            </h1>
            <p className="text-gray-400 text-lg">You solved the problem faster than your opponent</p>
          </div>

          {/* Elo Change Summary */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 text-center">
              <div className="text-white font-bold mb-2">You</div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">1250</div>
              <div className="text-green-400 font-bold">+15 Elo</div>
            </div>
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 text-center">
              <div className="text-white font-bold mb-2">Opponent</div>
              <div className="text-3xl font-bold text-magenta-secondary mb-2">1235</div>
              <div className="text-red-400 font-bold">-15 Elo</div>
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
              Code Comparison
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 1 ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Official Solution
            </button>
          </div>

            {/* Content */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 mb-8">
              {activeTab === 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-white font-bold mb-4">Your Solution</h3>
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
                    <div>
                      <h3 className="text-white font-bold mb-4">Opponent's Solution</h3>
                      <pre className="bg-black/50 p-4 rounded-lg text-gray-300 font-mono text-sm overflow-x-auto">
                        {`function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`}
                      </pre>
                    </div>
                  </div>
              )}

              {activeTab === 1 && (
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
                Rematch
              </button>
              <button className="px-8 py-3 rounded-lg font-bold border border-cyan-500/30 text-white hover:bg-black/50 transition-colors">
                Add as Friend
              </button>
            </div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
