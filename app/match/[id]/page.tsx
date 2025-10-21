"use client"

import { useState, useEffect, use } from "react"
import MonacoEditorWrapper from "@/components/monaco-editor-wrapper"

export default function BattleScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [code, setCode] = useState(`function twoSum(nums, target) {
  // Your code here
  return [];
}`)
  const [activeTab, setActiveTab] = useState(0)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [testResults, setTestResults] = useState([
    { id: 1, input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", actual: "", status: "pending" },
    { id: 2, input: "nums = [3,2,4], target = 6", expected: "[1,2]", actual: "", status: "pending" },
    { id: 3, input: "nums = [3,3], target = 6", expected: "[0,1]", actual: "", status: "pending" },
  ])
  const [opponentProgress, setOpponentProgress] = useState({
    name: "DevNinja",
    elo: 1820,
    testsPassed: 3,
    totalTests: 5,
    status: "Coding...",
    lastUpdate: "2s ago"
  })

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
    // Simulate running test cases
    setTestResults(prev => prev.map(test => ({
      ...test,
      actual: test.id <= 2 ? test.expected : "[]", // Simulate some passing
      status: test.id <= 2 ? "passed" : "failed"
    })))
  }

  const handleSubmitCode = (code: string) => {
    // TODO: Implement actual submission
    console.log("Submitting code:", code)
  }

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
  ]

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="bg-accent-card border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-white font-bold text-lg">Match #{id}</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Time:</span>
            <span className="text-cyan-400 font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
          
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
                <p className="text-gray-300 leading-relaxed mt-3">
                  You can return the answer in any order.
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
                      <div className="text-gray-400 text-sm mt-1">Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</div>
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
                  <li>• Only one valid answer exists.</li>
                </ul>
              </div>

              <button className="w-full py-2 px-4 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors">
                Show Hint
              </button>
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
            <button
              onClick={() => setActiveTab(2)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 2 ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              History
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 0 && (
              <MonacoEditorWrapper
                value={code}
                onChange={(value) => setCode(value || "")}
                language={selectedLanguage}
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
                  <div className="text-red-400">✗ Test case 3 failed</div>
                  <div className="text-gray-500">Expected: [0,1], Got: []</div>
                </div>
              </div>
            )}
            
            {activeTab === 2 && (
              <div className="h-full p-4 text-gray-400 font-mono text-sm overflow-y-auto">
                <div className="space-y-2">
                  <div className="text-gray-500">No submission history yet</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Opponent Progress & Activity */}
        <div className="w-1/4 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Opponent Section */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">Opponent</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white font-bold">
                  {opponentProgress.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold">{opponentProgress.name}</div>
                  <div className="text-gray-400 text-sm">Elo: {opponentProgress.elo}</div>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-cyan-400">{opponentProgress.testsPassed}/{opponentProgress.totalTests}</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(opponentProgress.testsPassed / opponentProgress.totalTests) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm">
                <div className="text-gray-400">Status: <span className="text-cyan-400">{opponentProgress.status}</span></div>
                <div className="text-gray-500">Last update: {opponentProgress.lastUpdate}</div>
              </div>
            </div>

            {/* Your Progress */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">Your Progress</h3>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Tests Passed</span>
                  <span className="text-green-400">2/5</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Opponent submitted - 3/5 passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">You submitted - 4/5 passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm">1,247 spectators watching</span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">1,247</div>
                <div className="text-gray-400 text-sm">Spectators</div>
                <div className="text-gray-500 text-xs">Watching this epic battle</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}