"use client"

import { useState, use, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import AuthenticatedLayout from "@/components/authenticated-layout"
import { useAuth } from "@/lib/auth-context"
import { io, Socket } from "socket.io-client"

interface Participant {
  userId: string
  username: string
  elo: number
  isHost: boolean
  joinedAt?: string
}

interface Problem {
  id: number
  title: string
  description: string
  difficulty: string
}

interface RoomData {
  id: string
  roomCode: string
  status: string
  maxParticipants: number
  timeLimit: number
  problem: Problem | null
  participants: Participant[]
  createdAt: string
  startedAt: string | null
}

interface ChatMessage {
  userId: string
  username: string
  message: string
  timestamp: Date
}

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProblemId, setSelectedProblemId] = useState<string>("")
  const [problems, setProblems] = useState<Problem[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({})
  
  const socketRef = useRef<Socket | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const isHost = roomData?.participants.find(p => p.userId === user?.id)?.isHost || false
  const canStart = isHost && roomData && roomData.participants.length >= 2

  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/rooms/${code}`)
        const data = await response.json()

        if (response.ok) {
          setRoomData(data.room)
          if (data.room.problem) {
            setSelectedProblemId(data.room.problem.id.toString())
          }
        } else {
          setError(data.error || 'Failed to load room')
        }
      } catch (err) {
        console.error('Error fetching room:', err)
        setError('Failed to load room')
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [code])

  // Fetch available problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/problems')
        const data = await response.json()
        if (data.problems) {
          setProblems(data.problems)
        }
      } catch (err) {
        console.error('Error fetching problems:', err)
      }
    }

    fetchProblems()
  }, [])

  // Socket.IO connection
  useEffect(() => {
    if (!user?.id || !roomData) return

    // Connect to Socket.IO with auth
    const socket = io({
      path: '/socket.io/',
      auth: {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO')
      // Join the room
      socket.emit('join_battle', { matchId: roomData.id })
    })

    // Handle user joined
    socket.on('user_joined', ({ user: joinedUser, participantCount }) => {
      console.log(`👥 ${joinedUser.username} joined the room`)
      // Refresh room data
      fetchRoomUpdate()
    })

    // Handle user left
    socket.on('user_left', ({ username, participantCount }) => {
      console.log(`👋 ${username} left the room`)
      fetchRoomUpdate()
    })

    // Handle battle started
    socket.on('battle_started', ({ startedAt }) => {
      console.log('🎮 Battle started!')
      // Redirect to match page
      router.push(`/match/${roomData.id}`)
    })

    // Handle chat messages
    socket.on('chat_message', ({ userId, username, message, timestamp }) => {
      setChatMessages(prev => [...prev, { userId, username, message, timestamp }])
    })

    // Handle room state updates
    socket.on('room_state', ({ participants, status }) => {
      setRoomData(prev => prev ? { ...prev, participants, status } : null)
    })

    socket.on('error', (errorMessage) => {
      console.error('Socket error:', errorMessage)
    })

    return () => {
      if (socket.connected) {
        socket.emit('leave_battle', { matchId: roomData.id })
        socket.disconnect()
      }
    }
  }, [user?.id, roomData?.id, router])

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const fetchRoomUpdate = async () => {
    try {
      const response = await fetch(`/api/rooms/${code}`)
      const data = await response.json()
      if (response.ok) {
        setRoomData(data.room)
      }
    } catch (err) {
      console.error('Error refreshing room:', err)
    }
  }

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/room/${code}`
    navigator.clipboard.writeText(link)
    alert('Invite link copied to clipboard!')
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !socketRef.current || !roomData) return

    socketRef.current.emit('chat_message', {
      matchId: roomData.id,
      message: messageInput.trim(),
    })

    setMessageInput('')
  }

  const handleStartMatch = async () => {
    if (!canStart || !user?.id || !roomData) return

    try {
      const response = await fetch(`/api/rooms/${code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          problemId: selectedProblemId || roomData.problem?.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Emit socket event to notify all participants
        if (socketRef.current) {
          socketRef.current.emit('start_battle', { matchId: roomData.id })
        }
        // The socket will receive 'battle_started' and redirect
      } else {
        alert(data.error || 'Failed to start match')
      }
    } catch (err) {
      console.error('Error starting match:', err)
      alert('Failed to start match')
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <main className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
            <div className="text-cyan-400 text-lg">Loading room...</div>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  if (error || !roomData) {
    return (
      <AuthenticatedLayout>
        <main className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
            <div className="text-red-400 text-lg mb-4">{error || 'Room not found'}</div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">Custom Room</h1>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              roomData.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
              roomData.status === 'active' ? 'bg-green-500/20 text-green-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {roomData.status === 'waiting' ? '⏳ Waiting' :
               roomData.status === 'active' ? '🎮 In Progress' :
               '✅ Completed'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Room Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Invite Card */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Room Code</h3>
                <div className="bg-black/50 p-4 rounded-lg mb-4 font-mono text-center text-cyan-400 font-bold text-2xl tracking-wider">
                  {code}
                </div>
                <button
                  onClick={handleCopyInviteLink}
                  className="w-full py-2 rounded-lg font-bold transition-colors"
                  style={{
                    background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                    color: "#0A0A0F",
                  }}
                >
                  📋 Copy Invite Link
                </button>
              </div>

              {/* Room Settings */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Settings</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Players</span>
                    <span className="text-white font-semibold">{roomData.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Limit</span>
                    <span className="text-white font-semibold">{roomData.timeLimit} min</span>
                  </div>
                  {roomData.problem && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Difficulty</span>
                      <span className={`font-semibold ${
                        roomData.problem.difficulty === 'Easy' ? 'text-green-400' :
                        roomData.problem.difficulty === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {roomData.problem.difficulty}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">
                  Participants ({roomData.participants.length}/{roomData.maxParticipants})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {roomData.participants.map((participant) => (
                    <div key={participant.userId} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white font-bold">
                        {participant.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">
                            {participant.username}
                            {participant.userId === user?.id && ' (You)'}
                          </span>
                          {participant.isHost && (
                            <span className="text-xs bg-cyan-500 text-black px-2 py-0.5 rounded font-semibold">
                              HOST
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          ELO: {participant.elo}
                          {participant.joinedAt && ` • Joined ${formatRelativeTime(participant.joinedAt)}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Problem Info/Selector */}
              {isHost ? (
                <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                  <h3 className="text-white font-bold mb-4">Select Problem</h3>
                  {roomData.problem ? (
                    <div className="mb-4 p-4 bg-black/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-semibold">{roomData.problem.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          roomData.problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                          roomData.problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {roomData.problem.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{roomData.problem.description}</p>
                    </div>
                  ) : null}
                  
                  {roomData.status === 'waiting' && (
                    <>
                      <select
                        value={selectedProblemId}
                        onChange={(e) => setSelectedProblemId(e.target.value)}
                        className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500 mb-4"
                      >
                        <option value="">Choose a problem...</option>
                        {problems.map(problem => (
                          <option key={problem.id} value={problem.id}>
                            {problem.title} ({problem.difficulty})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleStartMatch}
                        disabled={!canStart}
                        className="w-full py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: canStart ? "linear-gradient(135deg, #00FFFF, #FF007F)" : "#374151",
                          color: canStart ? "#0A0A0F" : "#9CA3AF",
                        }}
                        title={!canStart ? 'Need at least 2 participants to start' : ''}
                      >
                        🎮 Start Match
                      </button>
                      {!canStart && roomData.participants.length < 2 && (
                        <p className="text-sm text-gray-400 text-center mt-2">
                          Waiting for more players... ({roomData.participants.length}/2 minimum)
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                  <div className="text-center py-8">
                    {roomData.problem && (
                      <div className="mb-4 p-4 bg-black/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-semibold">{roomData.problem.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            roomData.problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            roomData.problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {roomData.problem.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{roomData.problem.description}</p>
                      </div>
                    )}
                    <div className="text-gray-400 flex flex-col items-center gap-3">
                      <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg">Waiting for host to start the match...</p>
                      <p className="text-sm">
                        {roomData.participants.length}/{roomData.maxParticipants} players in room
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat */}
              <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">💬 Room Chat</h3>
                <div className="bg-black/50 rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-2">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg, index) => (
                      <div key={index} className="text-sm">
                        <span className={`font-semibold ${
                          msg.userId === user?.id ? 'text-cyan-400' : 'text-magenta-secondary'
                        }`}>
                          {msg.username}:
                        </span>
                        <span className="text-gray-300 ml-2">{msg.message}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No messages yet. Say hi! 👋
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
