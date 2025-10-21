"use client"

import { useState, useEffect, use } from "react"
import MonacoEditorWrapper from "@/components/monaco-editor-wrapper"

export default function GroupBattleScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState(0)
  const [timeLeft, setTimeLeft] = useState(600)
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Your code here
  return [];
}`)
  const [testResults, setTestResults] = useState([
    { id: 1, input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", actual: "", status: "pending" },
    { id: 2, input: "nums = [3,2,4], target = 6", expected: "[1,2]", actual: "", status: "pending" },
  ])
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, username: "You", testsPassed: 2, totalTests: 5, time: "02:34" },
    { rank: 2, username: "Player2", testsPassed: 2, totalTests: 5, time: "03:12" },
    { rank: 3, username: "Player3", testsPassed: 1, totalTests: 5, time: "04:45" },
    { rank: 4, username: "Player4", testsPassed: 0, totalTests: 5, time: "05:20" },
  ])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRunCode = (code: string) => {
    setTestResults(prev => prev.map(test => ({
      ...test,
      actual: test.expected,
      status: "passed"
    })))
  }

  const handleSubmitCode = (code: string) => {
    console.log("Submitting code:", code)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="bg-accent-card border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-white font-bold text-lg">Group Battle #{id}</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Time:</span>
            <span className="text-cyan-400 font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSubmitCode(code)}
            className="px-6 py-2 rounded-lg font-bold text-lg transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #00FFFF, #FF007F)",
              color: "#0A0A0F",
            }}
          >
            Submit (Ctrl+Enter)
          </button>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column - Problem Description */}
        <div className="w-1/3 border-r border-cyan-500/20 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">MEDIUM</span>
                <span className="text-gray-400 text-sm">Problem #42</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Two Sum</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-white font-bold mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">
                  Given an array of integers <code className="bg-black/50 px-1 rounded">nums</code> and an integer <code className="bg-black/50 px-1 rounded">target</code>, 
                  return indices of the two numbers such that they add up to <code className="bg-black/50 px-1 rounded">target</code>.
                </p>
                <p className="text-gray-300 leading-relaxed mt-3">
                  You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.
                </p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3">Examples</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Example 1:</div>
                    <div className="text-gray-300">
                      <div><strong>Input:</strong> nums = [2,7,11,15], target = 9</div>
                      <div><strong>Output:</strong> [0,1]</div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-2">Example 2:</div>
                    <div className="text-gray-300">
                      <div><strong>Input:</strong> nums = [3,2,4], target = 6</div>
                      <div><strong>Output:</strong> [1,2]</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3">Constraints</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• 2 ≤ nums.length ≤ 10⁴</li>
                  <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                  <li>• -10⁹ ≤ target ≤ 10⁹</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Code Editor */}
        <div className="w-1/2 border-r border-cyan-500/20 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-cyan-500/20 bg-black/50">
            <button
              onClick={() => setActiveTab(0)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 0 ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 1 ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Console
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 0 && (
              <MonacoEditorWrapper
                value={code}
                onChange={(value) => setCode(value || "")}
                language="javascript"
                onRun={handleRunCode}
                onSubmit={handleSubmitCode}
                showControls={false}
                height="100%"
              />
            )}
            
            {activeTab === 1 && (
              <div className="h-full p-4 text-gray-400 font-mono text-sm overflow-y-auto">
                <div className="space-y-2">
                  <div className="text-green-400">✓ Example 1 passed</div>
                  <div className="text-green-400">✓ Example 2 passed</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Group Leaderboard */}
        <div className="w-1/4 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-white font-bold mb-4">Live Leaderboard</h3>
            
            <div className="space-y-3">
              {leaderboard.map((player) => (
                <div 
                  key={player.rank} 
                  className={`p-3 rounded-lg border transition-colors ${
                    player.username === "You" 
                      ? "bg-cyan-500/10 border-cyan-500/30" 
                      : "bg-accent-card border-cyan-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">#{player.rank}</span>
                      <span className="text-white font-semibold">{player.username}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{player.time}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Tests</span>
                    <span className="text-cyan-400">{player.testsPassed}/{player.totalTests}</span>
                  </div>
                  
                  <div className="w-full bg-black/50 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(player.testsPassed / player.totalTests) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Group Stats */}
            <div className="mt-6 bg-accent-card border border-cyan-500/20 rounded-lg p-4">
              <h4 className="text-white font-bold mb-3">Group Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Players:</span>
                  <span className="text-white">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Progress:</span>
                  <span className="text-cyan-400">62.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Spectators:</span>
                  <span className="text-cyan-400">1,247</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}