'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useSocket } from '@/lib/socket-context'
import { toast } from 'sonner'

interface SlidingChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Friend {
  id: string
  username: string
  elo: number
  online: boolean
}

interface Message {
  id: string
  from: string
  fromId: string
  text: string
  time: string
  isRead: boolean
}

interface Conversation {
  partnerId: string
  partnerUsername: string
  partnerElo: number
  messages: Message[]
  lastMessage: any
  unreadCount: number
}

interface FriendRequest {
  id: string
  userId: string
  username: string
  elo: number
  createdAt: string
}

export default function SlidingChatPanel({ isOpen, onClose }: SlidingChatPanelProps) {
  const { user } = useAuth()
  const { socket, isConnected, onlineFriends, emitTyping, sendMessage, typingUsers } = useSocket()
  const [activeTab, setActiveTab] = useState<'friends' | 'chat' | 'requests'>('friends')
  const [message, setMessage] = useState('')
  const [friends, setFriends] = useState<Friend[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  

  // Helper to format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Fetch friends, messages, and friend requests
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Fetch friends (accepted friend requests)
        const friendsResponse = await fetch(`/api/friends?userId=${user.id}&type=accepted`)
        const friendsData = await friendsResponse.json()
        if (friendsData.friends) {
          // Update online status from Socket.IO
          const friendsWithStatus = friendsData.friends.map((friend: Friend) => ({
            ...friend,
            online: onlineFriends.has(friend.id),
          }))
          setFriends(friendsWithStatus)
        }

        // Fetch messages/conversations
        const messagesResponse = await fetch(`/api/messages?userId=${user.id}`)
        const messagesData = await messagesResponse.json()
        if (messagesData.conversations) {
          setConversations(messagesData.conversations)
        }

        // Fetch pending friend requests
        const requestsResponse = await fetch(`/api/friends?userId=${user.id}&type=received`)
        const requestsData = await requestsResponse.json()
        if (requestsData.requests) {
          setFriendRequests(requestsData.requests)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen, user?.id, onlineFriends])

  // Update friends' online status when onlineFriends changes
  useEffect(() => {
    setFriends((prev) =>
      prev.map((friend) => ({
        ...friend,
        online: onlineFriends.has(friend.id),
      }))
    )
  }, [onlineFriends])

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const messageData = event.detail
      console.log('📨 Received new message:', messageData)

      // Add message to conversation
      const newMessage: Message = {
        id: Math.random().toString(),
        from: messageData.senderUsername,
        fromId: messageData.senderId,
        text: messageData.content,
        time: new Date().toISOString(),
        isRead: false,
      }

      // Update conversations
      setConversations((prev) => {
        const existing = prev.find((conv) => conv.partnerId === messageData.senderId)
        if (existing) {
          return prev.map((conv) =>
            conv.partnerId === messageData.senderId
              ? { ...conv, messages: [...conv.messages, newMessage], unreadCount: conv.unreadCount + 1 }
              : conv
          )
        }
        return prev
      })

      // Update selected conversation
      if (selectedConversation && selectedConversation.partnerId === messageData.senderId) {
        setSelectedConversation((prev) =>
          prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
        )

        // If we're viewing this conversation, immediately mark as read and emit read receipt
        if (user?.id) {
          ;(async () => {
            try {
              await fetch('/api/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, partnerId: messageData.senderId }),
              })
              setConversations(prev => prev.map(c => c.partnerId === messageData.senderId ? { ...c, unreadCount: 0 } : c))
              if (socket && isConnected) {
                socket.emit('messages_read', { partnerId: messageData.senderId })
              }
            } catch (e) {
              console.error('Failed to mark incoming message as read:', e)
            }
          })()
        }
      }

      // Show toast notification only if panel is closed or different conversation is open
      const isViewingThisConversation = !!selectedConversation && selectedConversation.partnerId === messageData.senderId
      const shouldToast = !isOpen || activeTab !== 'chat' || !isViewingThisConversation
      if (shouldToast) {
        toast.info(`New message from ${messageData.senderUsername}`, {
          description: messageData.content.substring(0, 50) + (messageData.content.length > 50 ? '...' : ''),
        })
      }
    }

    const handleNewFriendRequest = (event: CustomEvent) => {
      const request = event.detail
      console.log('👋 Received new friend request:', request)
      
      setFriendRequests((prev) => [...prev, request])
      toast.success('New friend request!', {
        description: `${request.senderUsername} wants to be friends`,
      })
    }

    const handleFriendRequestAccepted = async (event: CustomEvent) => {
      const data = event.detail
      console.log('✅ Friend request accepted:', data)
      
      toast.success('Friend request accepted!', {
        description: `${data.username} accepted your friend request`,
      })

      // Refresh friends list
      try {
        const friendsResponse = await fetch(`/api/friends?userId=${user?.id}&type=accepted`)
        const friendsData = await friendsResponse.json()
        
        if (friendsData.friends) {
          setFriends(friendsData.friends.map((friend: any) => ({
            ...friend,
            online: onlineFriends.has(friend.id),
          })))
        }
      } catch (error) {
        console.error('Failed to refresh friends list:', error)
      }
    }

    const handleFriendListUpdated = async () => {
      console.log('🔄 Refreshing friends list...')
      
      // Refresh friends list
      try {
        const friendsResponse = await fetch(`/api/friends?userId=${user?.id}&type=accepted`)
        const friendsData = await friendsResponse.json()
        
        if (friendsData.friends) {
          setFriends(friendsData.friends.map((friend: any) => ({
            ...friend,
            online: onlineFriends.has(friend.id),
          })))
        }
      } catch (error) {
        console.error('Failed to refresh friends list:', error)
      }
    }

    // Read receipts from partner: mark our outgoing messages as read
    const handleMessagesRead = (event: CustomEvent) => {
      const data = event.detail as { readerId: string; timestamp?: string }
      // Update conversations list
      setConversations(prev => prev.map(conv => {
        if (conv.partnerId === data.readerId) {
          return {
            ...conv,
            messages: conv.messages.map(m => m.from === 'You' ? { ...m, isRead: true } : m),
          }
        }
        return conv
      }))

      // Update selected conversation view if it matches
      if (selectedConversation && data.readerId === selectedConversation.partnerId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: prev.messages.map(m => m.from === 'You' ? { ...m, isRead: true } : m),
        } : prev)
      }
    }

    window.addEventListener('new-message', handleNewMessage as EventListener)
    window.addEventListener('new-friend-request', handleNewFriendRequest as EventListener)
    window.addEventListener('friend-request-accepted', handleFriendRequestAccepted as any)
    window.addEventListener('friend-list-updated', handleFriendListUpdated)
    window.addEventListener('messages-read', handleMessagesRead as any)

    return () => {
      window.removeEventListener('new-message', handleNewMessage as EventListener)
      window.removeEventListener('new-friend-request', handleNewFriendRequest as EventListener)
      window.removeEventListener('friend-request-accepted', handleFriendRequestAccepted as any)
      window.removeEventListener('friend-list-updated', handleFriendListUpdated)
      window.removeEventListener('messages-read', handleMessagesRead as any)
    }
  }, [selectedConversation])

  // Helper: near-bottom detection
  const isNearBottom = () => {
    const el = messagesScrollRef.current
    if (!el) return true
    const threshold = 120
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }

  // Auto-scroll to bottom of messages (smart)
  useEffect(() => {
    if (!selectedConversation) return
    const last = selectedConversation.messages[selectedConversation.messages.length - 1]
    const ownLast = last?.from === 'You'
    if (ownLast || isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation?.messages])


  // Mark as read when viewing conversation
  useEffect(() => {
    const markRead = async () => {
      if (!user?.id || !selectedConversation) return
      try {
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, partnerId: selectedConversation.partnerId }),
        })
        setConversations(prev => prev.map(c => c.partnerId === selectedConversation.partnerId ? { ...c, unreadCount: 0 } : c))
        
        // Emit read receipt to partner
        if (socket && isConnected) {
          socket.emit('messages_read', { partnerId: selectedConversation.partnerId })
        }
      } catch (e) {
        console.error('Failed to mark messages as read:', e)
      }
    }
    if (isOpen && activeTab === 'chat' && selectedConversation) {
      markRead()
    }
  }, [isOpen, activeTab, selectedConversation?.partnerId])

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedConversation) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Emit typing event if not already typing
    if (!isTyping) {
      setIsTyping(true)
      emitTyping(selectedConversation.partnerId, true)
    }

    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      emitTyping(selectedConversation.partnerId, false)
    }, 2000)
  }

  // Send a message
  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id || !selectedConversation) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedConversation.partnerId,
          content: message.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Emit real-time message to receiver via Socket.IO
        if (isConnected) {
          sendMessage({
            receiverId: selectedConversation.partnerId,
            content: message.trim(),
            conversationId: selectedConversation.partnerId,
          })
        }

        // Add message to conversation
        const newMessage: Message = {
          id: data.message.id,
          from: 'You',
          fromId: user.id,
          text: message.trim(),
          time: new Date().toISOString(),
          isRead: false,
        }

        setConversations(prev => 
          prev.map(conv => 
            conv.partnerId === selectedConversation.partnerId
              ? { ...conv, messages: [...conv.messages, newMessage] }
              : conv
          )
        )

        setSelectedConversation(prev => 
          prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
        )

        setMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Accept friend request
  const handleAcceptFriend = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'accept',
        }),
      })

      if (response.ok) {
        // Remove from requests list
        setFriendRequests(prev => prev.filter(req => req.id !== requestId))
        // Refresh friends list
        const friendsResponse = await fetch(`/api/friends?userId=${user?.id}&type=accepted`)
        const friendsData = await friendsResponse.json()
        if (friendsData.friends) {
          setFriends(friendsData.friends)
        }
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error)
    }
  }

  // Decline friend request
  const handleDeclineFriend = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action: 'decline',
        }),
      })

      if (response.ok) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId))
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error)
    }
  }

  // Start chat with a friend
  const handleStartChat = (friend: Friend) => {
    // Find existing conversation or create new one
    const existing = conversations.find(conv => conv.partnerId === friend.id)
    if (existing) {
      setSelectedConversation(existing)
    } else {
      // Create empty conversation
      const newConv: Conversation = {
        partnerId: friend.id,
        partnerUsername: friend.username,
        partnerElo: friend.elo,
        messages: [],
        lastMessage: null,
        unreadCount: 0,
      }
      setConversations(prev => [newConv, ...prev])
      setSelectedConversation(newConv)
    }
    setActiveTab('chat')
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-gradient-to-b from-gray-900 to-black border-l border-cyan-500/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-black/50 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cyan-500/20 bg-black/30">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'friends'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'chat'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'requests'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Requests
            <span className="absolute top-2 right-2 w-2 h-2 bg-magenta-secondary rounded-full"></span>
          </button>
        </div>

        {/* Content Area */}
        <div className="h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="p-4 space-y-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Online Friends ({friends.filter(f => f.online).length})
                </h3>
                <button
                  onClick={() => {
                    // Open user search modal in friend mode
                    const event = new CustomEvent('open-user-search', { detail: { mode: 'friend' } })
                    window.dispatchEvent(event)
                  }}
                  className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs rounded hover:bg-cyan-500/30 transition-colors"
                  title="Add Friend"
                >
                  + Add Friend
                </button>
              </div>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading friends...</div>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {friend.username[0].toUpperCase()}
                      </div>
                      {friend.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{friend.username}</span>
                        {friend.online && (
                          <span className="text-xs text-green-400">●</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>ELO: {friend.elo}</span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleStartChat(friend)}
                        className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8 text-sm">
                  <p>No friends yet</p>
                  <p className="text-xs mt-2">Add friends to chat with them!</p>
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-cyan-500/20 bg-black/30">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="p-1 hover:bg-gray-800 rounded transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {selectedConversation.partnerUsername[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{selectedConversation.partnerUsername}</div>
                        {/* ELO hidden for cleaner chat header */}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={messagesScrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto relative">
                    {selectedConversation.messages.length > 0 ? (
                      <>
                        {selectedConversation.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.from === 'You' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.from === 'You'
                                  ? 'bg-cyan-600 text-white'
                                  : 'bg-gray-800 text-white'
                              }`}
                            >
                              {/* Hide sender label in 1:1 chats */}
                              <div className="text-sm">{msg.text}</div>
                              <div className="text-xs opacity-60 mt-1">{formatRelativeTime(msg.time)}</div>
                            </div>
                          </div>
                        ))}
                        {/* Read receipt for last outgoing message */}
                        {(() => {
                          const msgs = selectedConversation.messages
                          const lastOutgoing = [...msgs].reverse().find(m => m.from === 'You')
                          if (!lastOutgoing) return null
                          return (
                            <div className="text-right text-[10px] text-gray-500 pr-1">
                              {lastOutgoing.isRead ? 'Seen' : 'Sent'}
                            </div>
                          )
                        })()}
                        <div ref={messagesEndRef} />
                        {/* New messages chip removed as requested */}
                      </>
                    ) : (
                      <div className="text-center text-gray-400 py-8 text-sm">
                        No messages yet. Start a conversation!
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-cyan-500/20 bg-black/50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value)
                          handleTyping()
                        }}
                        placeholder="Type a message..."
                        className={`flex-1 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSendMessage()
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        className={`px-4 py-2 rounded-lg transition-colors bg-cyan-600 hover:bg-cyan-700 text-white`}
                        title={'Send message'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                    {/* Sending will still work over HTTP even if socket is reconnecting */}
                    {selectedConversation && typingUsers?.get(`${selectedConversation.partnerId}-${selectedConversation.partnerId}`) && (
                      <p className="text-xs text-gray-400 mt-2">Typing…</p>
                    )}
                  </div>
                </>
              ) : (
                /* Conversations List */
                <div className="p-4 space-y-2">
                  {loading ? (
                    <div className="text-center text-gray-400 py-8">Loading conversations...</div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conv) => (
                      <div
                        key={conv.partnerId}
                        onClick={() => setSelectedConversation(conv)}
                        className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {conv.partnerUsername[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-semibold text-sm">{conv.partnerUsername}</span>
                            {conv.lastMessage && (
                              <span className="text-xs text-gray-400">{formatRelativeTime(conv.lastMessage.createdAt)}</span>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <div className="text-xs text-gray-400 truncate">
                              {conv.lastMessage.content}
                            </div>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8 text-sm">
                      <p>No conversations yet</p>
                      <p className="text-xs mt-2">Message a friend to start chatting!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-center text-gray-400 py-8">Loading requests...</div>
              ) : friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <div key={request.id} className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        {request.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">{request.username}</div>
                        <div className="text-xs text-gray-400">
                          Wants to be friends • {formatRelativeTime(request.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptFriend(request.id)}
                        className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineFriend(request.id)}
                        className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400 text-sm">No pending requests</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </>
  )
}
