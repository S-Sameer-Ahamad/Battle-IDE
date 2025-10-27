"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface ChatMessage {
  id: string
  sender: string
  senderId: string
  message: string
  type: 'text' | 'emote'
  timestamp: Date
}

interface Participant {
  userId: string
  username: string
  elo: number
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
  matchId: string
  matchStatus: 'active' | 'completed'
  participants: Participant[]
}

// Available emotes during active battle
const BATTLE_EMOTES = [
  { emoji: "👍", label: "Nice!" },
  { emoji: "🔥", label: "On fire!" },
  { emoji: "😮", label: "Wow!" },
  { emoji: "💪", label: "Strong!" },
  { emoji: "🤔", label: "Thinking..." },
  { emoji: "⚡", label: "Fast!" },
  { emoji: "🎯", label: "Good move!" },
  { emoji: "👏", label: "GG!" },
]

export default function ChatPanel({ isOpen, onClose, matchId, matchStatus, participants }: ChatPanelProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"participants" | "chat">("participants")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showEmotePicker, setShowEmotePicker] = useState(false)
  const [loading, setLoading] = useState(true)

  const isBattleActive = matchStatus === 'active'

  // Fetch match messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!matchId) return

      try {
        setLoading(true)
        // TODO: Implement match chat API
        // const response = await fetch(`/api/matches/${matchId}/chat`)
        // const data = await response.json()
        // setMessages(data.messages || [])
        setMessages([])
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen, matchId])

  // Send emote (during active battle)
  const handleSendEmote = (emoji: string, label: string) => {
    if (!user || !isBattleActive) return

    const emoteMessage: ChatMessage = {
      id: String(Date.now()),
      sender: user.username || 'You',
      senderId: user.id,
      message: `${emoji} ${label}`,
      type: 'emote',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, emoteMessage])
    setShowEmotePicker(false)

    // TODO: Send via Socket.IO
    // socket.emit('match_emote', { matchId, emote: emoji, label })
  }

  // Send text message (post-match only)
  const handleSendMessage = () => {
    if (!user || isBattleActive || !newMessage.trim()) return

    const textMessage: ChatMessage = {
      id: String(Date.now()),
      sender: user.username || 'You',
      senderId: user.id,
      message: newMessage.trim(),
      type: 'text',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, textMessage])
    setNewMessage("")

    // TODO: Send via Socket.IO or API
    // socket.emit('match_message', { matchId, message: newMessage.trim() })
  }

  if (!isOpen) return null

  const tabs = [
    { id: "participants", label: "Participants" },
    { id: "chat", label: isBattleActive ? "Emotes" : "Chat" },
  ] as const

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-accent-card border border-cyan-500/20 rounded-lg shadow-xl flex flex-col z-40">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold">Battle Chat</h3>
          {isBattleActive && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
              Live
            </span>
          )}
          {!isBattleActive && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              Ended
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Battle Status Message */}
      {isBattleActive && (
        <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
          <p className="text-yellow-400 text-xs flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Text chat disabled during battle. Use emotes!
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-cyan-500/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "participants" && (
          <div className="p-4 space-y-3">
            <h4 className="text-white font-bold mb-3">Match Participants ({participants.length})</h4>
            {loading ? (
              <div className="text-center text-gray-400 py-4 text-sm">Loading...</div>
            ) : participants.length > 0 ? (
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-3 p-3 bg-black/30 hover:bg-black/50 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {participant.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">
                          {participant.username}
                        </span>
                        {participant.userId === user?.id && (
                          <span className="text-xs text-cyan-400">(You)</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs">ELO: {participant.elo}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${participant.userId === user?.id ? 'bg-cyan-500' : 'bg-magenta-secondary'}`}></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-4 text-sm">No participants</div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="p-4 space-y-2 flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${message.senderId === user?.id ? 'text-cyan-400' : 'text-magenta-secondary'}`}>
                        {message.sender}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`text-sm rounded p-2 ${
                      message.type === 'emote' 
                        ? 'bg-purple-500/20 text-purple-200' 
                        : message.senderId === user?.id
                          ? 'bg-cyan-500/20 text-cyan-100'
                          : 'bg-black/50 text-white'
                    }`}>
                      {message.message}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8 text-sm">
                  {isBattleActive ? (
                    <>
                      <span className="text-4xl mb-2 block">🎮</span>
                      <p>Send emotes to react!</p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl mb-2 block">💬</span>
                      <p>Start a conversation!</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Emote Picker (Battle Active) */}
            {isBattleActive && showEmotePicker && (
              <div className="grid grid-cols-4 gap-2 p-2 bg-black/50 rounded-lg border border-cyan-500/20">
                {BATTLE_EMOTES.map((emote) => (
                  <button
                    key={emote.emoji}
                    onClick={() => handleSendEmote(emote.emoji, emote.label)}
                    className="flex flex-col items-center gap-1 p-2 hover:bg-cyan-500/20 rounded transition-colors"
                    title={emote.label}
                  >
                    <span className="text-2xl">{emote.emoji}</span>
                    <span className="text-xs text-gray-400">{emote.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      {activeTab === "chat" && (
        <div className="p-4 border-t border-cyan-500/20">
          {isBattleActive ? (
            /* Emote Button (Battle Active) */
            <button
              onClick={() => setShowEmotePicker(!showEmotePicker)}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">😊</span>
              {showEmotePicker ? 'Hide Emotes' : 'Send Emote'}
            </button>
          ) : (
            /* Text Input (Post-Match) */
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Discuss the match..."
                className="flex-1 px-3 py-2 bg-black border border-cyan-500/30 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-cyan-500 text-black rounded text-sm font-bold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}