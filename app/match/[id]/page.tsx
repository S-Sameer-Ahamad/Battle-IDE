"use client"

import { useState } from "react"

export default function BattleScreen({ params }: { params: { id: string } }) {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [code, setCode] = useState("// Write your solution here\n")
  const [activeTab, setActiveTab] = useState("editor")
  const [timeLeft, setTimeLeft] = useState(600)

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="bg-accent-card border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-white font-bold">Match #{params.id}</div>
          <div className="text-cyan-400 font-bold">
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
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
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Problem */}
        <div className="w-2/5 border-r border-cyan-500/20 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Two Sum</h1>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                  Medium
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">Description</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Given an array of integers nums and an integer target, return the indices of the two numbers that add up
                to target.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">Examples</h3>
              <div className="bg-black/50 p-3 rounded-lg text-sm text-gray-300 font-mono">
                <div>Input: nums = [2,7,11,15], target = 9</div>
                <div>Output: [0,1]</div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">Constraints</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>2 ≤ nums.length ≤ 10⁴</li>
                <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel - Editor */}
        <div className="w-3/5 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-cyan-500/20 bg-black/50">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "editor" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("console")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "console" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Console
            </button>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "editor" && (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 bg-black text-white font-mono text-sm focus:outline-none resize-none"
                spellCheck="false"
              />
            )}
            {activeTab === "console" && (
              <div className="p-4 text-gray-400 font-mono text-sm overflow-y-auto h-full">
                <div>Test Case 1: PASSED</div>
                <div>Test Case 2: PASSED</div>
                <div>Test Case 3: FAILED</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Opponent Progress Card */}
      <div className="fixed top-24 right-6 bg-accent-card border border-cyan-500/20 rounded-lg p-4 w-64">
        <div className="text-sm text-gray-400 mb-2">Opponent Progress</div>
        <div className="text-white font-bold mb-3">Player 2</div>
        <div className="bg-black/50 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-magenta-secondary h-full" style={{ width: "60%" }}></div>
        </div>
        <div className="text-xs text-gray-400 mt-2">3 / 5 test cases passed</div>
      </div>
    </div>
  )
}
