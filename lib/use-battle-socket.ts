"use client"

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './auth-context'

export interface BattleParticipant {
  userId: string
  username: string
  elo?: number
}

export interface BattleState {
  matchId: string
  participants: BattleParticipant[]
  status: 'waiting' | 'active' | 'completed'
  startedAt?: Date
  winnerId?: string
}

export interface ChatMessage {
  userId: string
  username: string
  message: string
  timestamp: Date
}

export interface SubmissionNotification {
  userId: string
  username: string
  language?: string
  result?: string
  passedTests?: number
  totalTests?: number
  executionTime?: number
  memory?: number
  success?: boolean
  timestamp: Date
}

export interface EloChange {
  playerId: string
  oldRating: number
  newRating: number
  change: number
}

export interface BattleCompletedEvent {
  winnerId: string
  winnerUsername: string
  eloChanges?: EloChange[]
}

export function useBattleSocket(matchId: string | null) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [submissions, setSubmissions] = useState<SubmissionNotification[]>([])
  const [eloChanges, setEloChanges] = useState<EloChange[] | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  useEffect(() => {
    if (!matchId || !user) return

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: maxReconnectAttempts,
    })

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected')
      setConnected(true)
      reconnectAttempts.current = 0

      // Authenticate with token
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (token) {
        newSocket.emit('auth', token)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      setConnected(false)
    })

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnect attempt ${attempt}/${maxReconnectAttempts}`)
      reconnectAttempts.current = attempt
    })

    // Auth handlers
    newSocket.on('auth_success', ({ username }) => {
      console.log(`✅ Authenticated as ${username}`)
      // Join the battle room
      newSocket.emit('join_battle', { matchId })
    })

    newSocket.on('auth_error', (error) => {
      console.error('❌ Auth error:', error)
    })

    // Battle room handlers
    newSocket.on('room_state', (state: BattleState) => {
      console.log('📊 Room state received:', state)
      setBattleState(state)
    })

    newSocket.on('user_joined', ({ user: joinedUser, participantCount }) => {
      console.log(`👥 ${joinedUser.username} joined (${participantCount} total)`)
      setBattleState(prev => prev ? {
        ...prev,
        participants: [...prev.participants, joinedUser],
      } : null)
    })

    newSocket.on('user_left', ({ userId, username, participantCount }) => {
      console.log(`👋 ${username} left (${participantCount} remaining)`)
      setBattleState(prev => prev ? {
        ...prev,
        participants: prev.participants.filter(p => p.userId !== userId),
      } : null)
    })

    newSocket.on('battle_started', ({ startedAt }) => {
      console.log('🎮 Battle started!')
      setBattleState(prev => prev ? {
        ...prev,
        status: 'active',
        startedAt: new Date(startedAt),
      } : null)
    })

    newSocket.on('battle_completed', (event: BattleCompletedEvent) => {
      console.log(`🏆 Battle completed! Winner: ${event.winnerId}`)
      
      if (event.eloChanges) {
        setEloChanges(event.eloChanges)
        console.log('📊 ELO Changes:', event.eloChanges)
      }
      
      setBattleState(prev => prev ? {
        ...prev,
        status: 'completed',
        winnerId: event.winnerId,
      } : null)
    })

    // Submission handlers
    newSocket.on('submission_started', (notification: SubmissionNotification) => {
      console.log(`📝 ${notification.username} started submission`)
      setSubmissions(prev => [...prev, { ...notification, result: 'Running...' }])
    })

    newSocket.on('submission_completed', (notification: SubmissionNotification) => {
      console.log(`✅ ${notification.username} submission completed: ${notification.result}`)
      setSubmissions(prev => [...prev, notification])
    })

    newSocket.on('submission_error', ({ error }) => {
      console.error('❌ Submission error:', error)
    })

    // Chat handlers
    newSocket.on('chat_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg])
    })

    // Error handler
    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })

    setSocket(newSocket)

    // Cleanup
    return () => {
      if (matchId) {
        newSocket.emit('leave_battle', { matchId })
      }
      newSocket.close()
    }
  }, [matchId, user])

  // Helper functions
  const startBattle = () => {
    if (socket && matchId) {
      socket.emit('start_battle', { matchId })
    }
  }

  const submitCode = (code: string, language: string) => {
    if (socket && matchId) {
      socket.emit('code_submit', { matchId, code, language })
    }
  }

  const sendMessage = (message: string) => {
    if (socket && matchId) {
      socket.emit('chat_message', { matchId, message })
    }
  }

  const updateCode = (code: string) => {
    if (socket && matchId) {
      socket.emit('code_update', { matchId, code })
    }
  }

  const completeBattle = (winnerId: string) => {
    if (socket && matchId) {
      socket.emit('complete_battle', { matchId, winnerId })
    }
  }

  const leaveBattle = () => {
    if (socket && matchId) {
      socket.emit('leave_battle', { matchId })
    }
  }

  return {
    socket,
    connected,
    battleState,
    messages,
    submissions,
    eloChanges,
    startBattle,
    submitCode,
    sendMessage,
    updateCode,
    completeBattle,
    leaveBattle,
  }
}
