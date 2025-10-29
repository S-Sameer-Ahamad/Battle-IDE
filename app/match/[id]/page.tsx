"use client"

import { useState, useEffect, use, useRef } from "react"
import MonacoEditorWrapper from "@/components/monaco-editor-wrapper"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useBattleSocket } from "@/lib/use-battle-socket"

interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  examples: string
  testCases: string
  timeLimit: number
}

interface Participant {
  userId: string
  username: string
  elo: number
}

interface Match {
  id: string
  problemId: string
  status: string
  timeLimit: number
  startedAt: string | null
  problem: Problem
  participants?: Array<{
    user: {
      id: string
      username: string
      elo: number
    }
  }>
}

interface Submission {
  id: string
  userId: string
  matchId: string
  problemId: string
  code: string
  language: string
  status: string
  passedTests: number
  totalTests: number
  executionTime: number | null
  submittedAt: string
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
  const [userMatchNumber, setUserMatchNumber] = useState<number>(0)

  // WebSocket integration for real-time updates
  const {
    connected,
    battleState,
    messages,
    submissions: socketSubmissions,
    sendMessage,
    submitCode: submitCodeViaSocket,
    startBattle,
  } = useBattleSocket(id)

  // Use real submissions from API or socket
  const [localSubmissions, setLocalSubmissions] = useState<Submission[]>([])
  const submissions = socketSubmissions.length > 0 ? socketSubmissions : localSubmissions

  // For accurate timer sync across clients
  const endTimeRef = useRef<number | null>(null)

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
        
        // Fetch user's match count
        if (user?.id) {
          try {
            const userMatchesResponse = await fetch(`/api/users/${user.id}`)
            const userData = await userMatchesResponse.json()
            if (userData.user?._count?.matchParticipants) {
              setUserMatchNumber(userData.user._count.matchParticipants)
            }
          } catch (err) {
            console.error('Failed to fetch user match count:', err)
          }
        }
        
        // Load participants and submissions from API
        if (data.match.submissions) {
          setLocalSubmissions(data.match.submissions.map((s: any) => ({
            id: s.id,
            userId: s.userId,
            code: s.code,
            language: s.language,
            status: s.status,
            passedTests: s.passedTests,
            totalTests: s.totalTests,
            executionTime: s.executionTime,
            memory: s.memory,
            timestamp: s.submittedAt,
            submittedAt: s.submittedAt,
          })))
        }
        
        // If match already started, compute a shared endTime; otherwise show full time but don't start countdown until start event
        if (data.match.startedAt) {
          const startTime = new Date(data.match.startedAt).getTime()
          endTimeRef.current = startTime + data.match.timeLimit * 60 * 1000
          const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
          setTimeLeft(remaining)
        } else {
          // Not started yet; display full time but wait for battle_started to begin ticking
          setTimeLeft(data.match.timeLimit * 60)
          endTimeRef.current = null
        }

        // If the user isn't a participant yet and the match is waiting, auto-join via API
        if (user?.id && data.match.status === 'waiting') {
          const alreadyIn = (data.match.participants || []).some((p: any) => p.user?.id === user.id)
          if (!alreadyIn) {
            try {
              const joinRes = await fetch(`/api/matches/${id}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, isHost: false }),
              })
              // Ignore 400 "already in" to be idempotent
              if (!joinRes.ok && joinRes.status !== 400) {
                const e = await joinRes.json().catch(() => ({}))
                console.warn('Auto-join failed:', e.error || joinRes.status)
              }
            } catch (e) {
              console.warn('Auto-join request error:', e)
            }
          }
        }
        
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
  }, [id, router, selectedLanguage, user?.id])

  // Timer countdown synced to endTimeRef to avoid drift and keep both clients aligned
  useEffect(() => {
    const timer = setInterval(() => {
      if (!endTimeRef.current) return
      const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // When server announces battle start, sync timer to server start time
  useEffect(() => {
    if (!battleState?.startedAt || !match) return
    const startMs = new Date(battleState.startedAt).getTime()
    endTimeRef.current = startMs + match.timeLimit * 60 * 1000
    const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000))
    setTimeLeft(remaining)
  }, [battleState?.startedAt, match?.timeLimit])

  // Auto-start battle when both participants are present and we're still waiting
  useEffect(() => {
    if (!connected || !battleState || battleState.status !== 'waiting') return
    const count = battleState.participants?.length || 0
    if (count >= 2) {
      startBattle?.()
    }
  }, [connected, battleState?.participants?.length, battleState?.status])

  // Navigate to results when server marks battle completed
  useEffect(() => {
    if (battleState?.status === 'completed') {
      router.push(`/match/${id}/results`)
    }
  }, [battleState?.status, id, router])

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
    if (!match || !user) return
    
    // Validate code is not empty
    if (!code || code.trim().length === 0) {
      alert('Please write some code before submitting!')
      return
    }
    
    try {
      // Submit via Socket.IO if connected
      if (connected && submitCodeViaSocket) {
        console.log('📤 Submitting via Socket.IO...')
        submitCodeViaSocket(code, selectedLanguage)
      } else {
        console.log('📤 Submitting via API (socket not connected)...')
        // Fallback to API if socket not connected
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchId: id,
            userId: user.id,
            code,
            language: selectedLanguage,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Submission failed')
        }
        
        const result = await response.json()
        console.log('Submission result:', result)
        
        // Update local submissions
        setLocalSubmissions(prev => [...prev, {
          id: result.submission.id,
          userId: user.id,
          matchId: id,
          problemId: match?.problemId || '',
          code,
          language: selectedLanguage,
          status: result.submission.status,
          passedTests: result.submission.passedTests,
          totalTests: result.submission.totalTests,
          executionTime: result.submission.executionTime,
          submittedAt: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Failed to submit code:', error)
      alert('Failed to submit code. Please try again.')
    }
  }

  const languages = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
  ]

  // Get participants - use battleState from socket if available, otherwise from match data
  const participants = battleState?.participants || 
    (match?.participants?.map(p => ({
      userId: p.user.id,
      username: p.user.username,
      elo: p.user.elo
    })) ?? [])
    
  const opponent = participants.find(p => p.userId !== user?.id)
  const currentUser = participants.find(p => p.userId === user?.id)
  
  // Determine whether to show a pre-battle lobby (waiting for opponent)
  const showLobby = (!match?.startedAt) && (battleState?.status !== 'active')
  
  const inviteUrl = typeof window !== 'undefined'
    ? window.location.origin + `/match/${id}`
    : `/match/${id}`
  
  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      alert('Invite link copied to clipboard!')
    } catch (e) {
      console.error('Failed to copy invite link:', e)
      alert('Failed to copy link')
    }
  }
  
  // Get opponent's latest submission
  const opponentSubmissions = submissions.filter((s: any) => s.userId !== user?.id)
  const latestOpponentSubmission = opponentSubmissions[opponentSubmissions.length - 1]

  if (loading || !match) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading battle...</div>
      </div>
    )
  }

  const problem = match.problem
  
  // Safely parse examples - handle both JSON strings and plain text
  let examples: any = []
  try {
    if (typeof problem.examples === 'string') {
      // Try to parse as JSON first
      try {
        examples = JSON.parse(problem.examples)
      } catch {
        // If not valid JSON, treat as plain text/markdown
        examples = [{ input: '', output: problem.examples }]
      }
    } else {
      examples = problem.examples
    }
  } catch (err) {
    console.error('Error parsing examples:', err)
    examples = []
  }

  // Render LOBBY while waiting (no startedAt and not active via socket)
  if (showLobby) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="bg-accent-card border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {/* Back Button */}
            <button
              onClick={() => router.push('/dashboard')}
              className="group flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors"
              title="Back to Dashboard"
            >
              <svg 
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h1 className="text-white font-bold text-lg">Match Lobby</h1>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Waiting for opponent…</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyInvite}
              className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50"
            >
              Copy Invite Link
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50"
            >
              Leave
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-accent-card border border-cyan-500/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Invite your friend</h2>
            <p className="text-gray-400 mb-6">
              Share the link below. Once your friend joins, the battle will start automatically.
            </p>
            <div className="flex gap-3 mb-6">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white"
              />
              <button
                onClick={handleCopyInvite}
                className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50"
              >
                Copy
              </button>
            </div>
            <div className="bg-black/40 border border-cyan-500/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-white font-semibold">Participants</div>
                <div className="text-gray-400 text-sm">{participants.length}/2</div>
              </div>
              <div className="mt-3 space-y-2">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className={`w-2 h-2 rounded-full ${p.userId === user?.id ? 'bg-cyan-500' : 'bg-magenta-secondary'}`}></div>
                    <span>{p.username}{p.userId === user?.id ? ' (You)' : ''}</span>
                  </div>
                ))}
                {participants.length < 2 && (
                  <div className="text-gray-500 text-sm">Waiting for your friend to join…</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Otherwise render full battle screen (either active or startedAt present)
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="bg-accent-card border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="group flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors"
            title="Leave Match"
          >
            <svg 
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-white font-bold text-lg">
            Match #{userMatchNumber > 0 ? userMatchNumber : '...'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Time:</span>
            <span className="text-cyan-400 font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
          {/* Difficulty Badge */}
          <span className={`px-2 py-1 text-xs font-bold rounded ${
            problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
            problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {problem.difficulty}
          </span>
          {/* Connection Status */}
          {connected ? (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
              API Mode
            </span>
          )}
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
                <div className="space-y-4">
                  {(() => {
                    try {
                      const examples = JSON.parse(problem.examples)
                      return examples.map((ex: any, idx: number) => (
                        <div key={idx} className="bg-gray-900/50 border border-cyan-500/10 rounded-lg p-4">
                          <div className="font-bold text-white mb-2">Example {idx + 1}:</div>
                          <div className="space-y-2 font-mono text-sm">
                            <div>
                              <span className="text-gray-400">Input: </span>
                              <span className="text-cyan-400">{ex.input}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Output: </span>
                              <span className="text-green-400">{ex.output}</span>
                            </div>
                            {ex.explanation && (
                              <div>
                                <span className="text-gray-400">Explanation: </span>
                                <span className="text-gray-300">{ex.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    } catch {
                      // Fallback for markdown format
                      return (
                        <div className="space-y-4">
                          {problem.examples.split(/\*\*Example \d+:\*\*/).filter(Boolean).map((example: string, idx: number) => {
                            const lines = example.trim().split('\n').filter(line => line.trim())
                            return (
                              <div key={idx} className="bg-gray-900/50 border border-cyan-500/10 rounded-lg p-4">
                                <div className="font-bold text-white mb-2">Example {idx + 1}:</div>
                                <div className="space-y-2 font-mono text-sm">
                                  {lines.map((line: string, lineIdx: number) => {
                                    const cleaned = line.replace(/^```|```$/g, '').trim()
                                    if (cleaned.startsWith('Input:')) {
                                      return (
                                        <div key={lineIdx}>
                                          <span className="text-gray-400">Input: </span>
                                          <span className="text-cyan-400">{cleaned.replace('Input:', '').trim()}</span>
                                        </div>
                                      )
                                    } else if (cleaned.startsWith('Output:')) {
                                      return (
                                        <div key={lineIdx}>
                                          <span className="text-gray-400">Output: </span>
                                          <span className="text-green-400">{cleaned.replace('Output:', '').trim()}</span>
                                        </div>
                                      )
                                    } else if (cleaned.startsWith('Explanation:')) {
                                      return (
                                        <div key={lineIdx}>
                                          <span className="text-gray-400">Explanation: </span>
                                          <span className="text-gray-300">{cleaned.replace('Explanation:', '').trim()}</span>
                                        </div>
                                      )
                                    }
                                    return null
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    }
                  })()}
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
                      {new Date(
                        'submittedAt' in latestOpponentSubmission 
                          ? latestOpponentSubmission.submittedAt 
                          : latestOpponentSubmission.timestamp
                      ).toLocaleTimeString()}
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