"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './auth-context'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  onlineFriends: Set<string>
  typingUsers: Map<string, boolean>
  emitTyping: (conversationId: string, isTyping: boolean) => void
  sendMessage: (data: any) => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map())

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Create socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
    const newSocket = io(socketUrl, {
      path: '/socket.io/',
      auth: {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id)
      setIsConnected(true)

      // Announce user is online
      newSocket.emit('user_online', { userId: user.id, username: user.username })
    })

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    // Friend online status events
    newSocket.on('friend_online', ({ userId, username }: { userId: string; username: string }) => {
      console.log(`🟢 Friend online: ${username}`)
      setOnlineFriends((prev) => new Set(prev).add(userId))
    })

    newSocket.on('friend_offline', ({ userId, username }: { userId: string; username: string }) => {
      console.log(`⚫ Friend offline: ${username}`)
      setOnlineFriends((prev) => {
        const updated = new Set(prev)
        updated.delete(userId)
        return updated
      })
    })

    newSocket.on('online_friends_list', ({ friendIds }: { friendIds: string[] }) => {
      console.log(`👥 Online friends list received: ${friendIds.length} friends online`)
      setOnlineFriends(new Set(friendIds))
    })

    // Typing indicator events
    newSocket.on('user_typing', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev)
        updated.set(`${conversationId}-${userId}`, true)
        return updated
      })

      // Auto-clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Map(prev)
          updated.delete(`${conversationId}-${userId}`)
          return updated
        })
      }, 3000)
    })

    newSocket.on('user_stopped_typing', ({ userId, conversationId }: { userId: string; conversationId: string }) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev)
        updated.delete(`${conversationId}-${userId}`)
        return updated
      })
    })

    // Real-time notification event
    newSocket.on('new_notification', (notification: any) => {
      console.log('🔔 New notification:', notification)
      // Trigger a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }))
    })

    // Real-time message event
    newSocket.on('new_message', (message: any) => {
      console.log('💬 New message:', message)
      // Trigger a custom event that components can listen to
      window.dispatchEvent(new CustomEvent('new-message', { detail: message }))
    })

    // Read receipt event
    newSocket.on('messages_read', (data: any) => {
      console.log('📖 Messages read by partner:', data)
      window.dispatchEvent(new CustomEvent('messages-read', { detail: data }))
    })

    // Friend request event
    newSocket.on('new_friend_request', (request: any) => {
      console.log('👋 New friend request:', request)
      window.dispatchEvent(new CustomEvent('new-friend-request', { detail: request }))
    })

    // Friend request accepted event
    newSocket.on('friend_request_accepted', (data: any) => {
      console.log('✅ Friend request accepted:', data)
      window.dispatchEvent(new CustomEvent('friend-request-accepted', { detail: data }))
    })

    // Match invitation event
    newSocket.on('match_invitation', (invitation: any) => {
      console.log('⚔️ Match invitation:', invitation)
      window.dispatchEvent(new CustomEvent('match-invitation', { detail: invitation }))
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [user])

  // Emit typing indicator
  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit(isTyping ? 'typing' : 'stop_typing', { conversationId })
    }
  }, [socket, isConnected])

  // Send message
  const sendMessage = useCallback((data: any) => {
    if (socket && isConnected) {
      socket.emit('send_message', data)
    }
  }, [socket, isConnected])

  // Join a room (for battles, group chats, etc.)
  const joinRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('join_room', { roomId })
    }
  }, [socket, isConnected])

  // Leave a room
  const leaveRoom = useCallback((roomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_room', { roomId })
    }
  }, [socket, isConnected])

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineFriends,
        typingUsers,
        emitTyping,
        sendMessage,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
