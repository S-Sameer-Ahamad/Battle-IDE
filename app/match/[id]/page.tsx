"use client"

import { useState, useEffect, use } from "react"
import MonacoEditorWrapper from "@/components/monaco-editor-wrapper"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface Problem {
  id: string
  title: string
  difficulty: string
  description: string
  examples: any
  testCases: any
  timeLimit: number
  memoryLimit: number
}

interface Match {
  id: string
  problemId: string
  status: string
  timeLimit: number
  problem: Problem
}

// Helper function to get default code templates
function getDefaultCode(language: string, problem: Problem): string {
  const templates: Record<string, string> = {
    python: `def solution():\n    # Your code here\n    pass\n`,
    javascript: `function solution() {\n  // Your code here\n  return null;\n}`,
    java: `public class Solution {\n    public void solution() {\n        // Your code here\n    }\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  }
  return templates[language] || templates.python
}

export default function BattleScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [match, setMatch] = useState<Match | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("python")
  const [code, setCode] = useState("")
  const [activeTab, setActiveTab] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)

  // Mock data for now (WebSocket will be implemented later)
  const [connected] = useState(true)
  const [battleState] = useState({
    matchId: id,
    participants: [
      { userId: user?.id || '1', username: user?.username || 'You', elo: user?.elo || 1200 },
      { userId: '2', username: 'Opponent', elo: 1350 }
    ],
    status: 'active' as const,
    startedAt: new Date()
  })
  const [messages] = useState([])
  const [submissions] = useState([])

  // Fetch match and problem data
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(`/api/matches/${id}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Match not found: ${errorData.error || 'Unknown error'}`)
        }
        
        const data = await response.json()
        setMatch(data.match) // Fix: API returns { match } object
        setTimeLeft(data.match.problem.timeLimit * 60) // Convert minutes to seconds
        
        // Set default code based on language and problem
        const defaultCode = getDefaultCode(selectedLanguage, data.match.problem)
        setCode(defaultCode)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch match:', error)
        router.push('/dashboard')
      }
    }
    fetchMatch()
  }, [id, router, selectedLanguage])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === 0) return
    
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
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRunCode = async (code: string) => {
    // TODO: Run code locally without submitting
    console.log("Running code:", code)
  }

  const handleSubmitCode = async (code: string) => {
    if (!match) return
    // TODO: Implement actual submission
    console.log("Submitting code:", code, "Language:", selectedLanguage)
  }

  const languages = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
  ]

  // Get participants from battleState
  const participants = battleState?.participants || []
  const opponent = participants.find(p => p.userId !== user?.id)
  const currentUser = participants.find(p => p.userId === user?.id)
  
  // Get opponent's latest submission
  const opponentSubmissions = submissions.filter(s => s.userId !== user?.id)
  const latestOpponentSubmission = opponentSubmissions[opponentSubmissions.length - 1]

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading battle...</div>
      </div>
    )
  }

  const problem = match.problem
  const examples = typeof problem.examples === 'string' ? JSON.parse(problem.examples) : problem.examples

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
                <span className={`px-2 py-1 text-xs font-bold rounded ${
                  problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                  problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {problem.difficulty.toUpperCase()}
                </span>
                <span className="text-gray-400 text-sm">Problem #{problem.id}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{problem.title}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-white font-bold mb-3">Description</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {problem.description}
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3">Examples</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {problem.examples}
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
            {opponent && (
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-white font-bold mb-4">Opponent</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white font-bold">
                    {opponent.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{opponent.username}</div>
                    <div className="text-gray-400 text-sm">Elo: {opponent.elo || 1500}</div>
                  </div>
                </div>
                
                {latestOpponentSubmission && (
                  <div className="text-sm">
                    <div className="text-gray-400">Latest submission:</div>
                    <div className="text-cyan-400">{latestOpponentSubmission.language}</div>
                    <div className="text-gray-500">
                      {new Date(latestOpponentSubmission.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Your Progress */}
            {currentUser && (
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-white font-bold mb-4">Your Progress</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Submissions</span>
                    <span className="text-green-400">
                      {submissions.filter(s => s.userId === user?.id).length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Participants */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">Participants ({participants.length})</h3>
              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${participant.userId === user?.id ? 'bg-cyan-500' : 'bg-magenta-secondary'}`}></div>
                    <span className="text-gray-300 text-sm">
                      {participant.username} {participant.userId === user?.id && '(You)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-4">Activity</h3>
              <div className="space-y-3">
                {submissions.slice(-5).reverse().map((submission, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${submission.userId === user?.id ? 'bg-cyan-500' : 'bg-magenta-secondary'}`}></div>
                    <span className="text-gray-300 text-sm">
                      {submission.userId === user?.id ? 'You' : 'Opponent'} submitted
                    </span>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <div className="text-gray-500 text-sm">No activity yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}