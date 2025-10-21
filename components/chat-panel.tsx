"use client"

import { useState } from "react"

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: Date
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [activeTab, setActiveTab] = useState<"friends" | "chat" | "requests">("friends")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Player 1",
      message: "Hey, want to battle?",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: String(messages.length + 1),
          sender: "You",
          message: newMessage,
          timestamp: new Date(),
        },
      ])
      setNewMessage("")
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: "friends", label: "Friends" },
    { id: "chat", label: "Chat" },
    { id: "requests", label: "Requests" },
  ] as const

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[400px] bg-accent-card border border-cyan-500/20 rounded-lg shadow-xl flex flex-col z-40">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-cyan-500/20">
        <h3 className="text-white font-bold">Messages</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

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
        {activeTab === "friends" && (
          <div className="p-4 space-y-3">
            <h4 className="text-white font-bold mb-3">Top 5 Players</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-2 hover:bg-black/50 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-xs">#1</span>
                  <span className="text-white text-sm">Player 1</span>
                  <span className="text-gray-400 text-xs">(1500+)</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-black/50 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-xs">#2</span>
                  <span className="text-white text-sm">CodeMaster</span>
                  <span className="text-gray-400 text-xs">(1500+)</span>
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-black/50 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-xs">#3</span>
                  <span className="text-white text-sm">Player 3</span>
                  <span className="text-gray-400 text-xs">(1500+)</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-black/50 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-xs">#4</span>
                  <span className="text-white text-sm">AlgoNinja</span>
                  <span className="text-gray-400 text-xs">(1500+)</span>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-black/50 rounded transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-xs">#5</span>
                  <span className="text-white text-sm">Player 5</span>
                  <span className="text-gray-400 text-xs">(1500+)</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-3 py-2 px-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-xs">
              View Full Leaderboard
            </button>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="p-4 space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-400 text-xs font-semibold">{message.sender}</span>
                  <span className="text-gray-500 text-xs">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-white text-sm bg-black/50 rounded p-2">{message.message}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between p-2 bg-black/50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white text-xs font-bold">
                  P
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">Player123</div>
                  <div className="text-xs text-gray-400">Wants to be friends</div>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="px-2 py-1 text-xs bg-cyan-500 text-black rounded hover:bg-cyan-600">
                  Accept
                </button>
                <button className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {activeTab === "chat" && (
        <div className="p-4 border-t border-cyan-500/20 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-black border border-cyan-500/30 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-3 py-2 bg-cyan-500 text-black rounded text-sm font-bold hover:bg-cyan-600"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}