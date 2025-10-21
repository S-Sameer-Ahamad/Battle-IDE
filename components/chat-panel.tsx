"use client"

import { useState } from "react"

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: Date
}

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false)
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow z-40"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-96 bg-accent-card border border-cyan-500/20 rounded-lg shadow-xl flex flex-col z-40">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-cyan-500/20">
        <h3 className="text-white font-bold">Messages</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyan-500/20">
        {["friends", "chat", "requests"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === "friends" && (
          <div className="space-y-2">
            {["Player 1", "Player 2", "Player 3"].map((player) => (
              <div key={player} className="flex items-center gap-3 p-2 hover:bg-black/50 rounded-lg cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white text-xs font-bold">
                  {player[0]}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold">{player}</div>
                  <div className="text-xs text-gray-400">Online</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="text-cyan-400 font-semibold text-xs">{msg.sender}</div>
                <div className="text-gray-300">{msg.message}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-2">
            {["Player 4", "Player 5"].map((player) => (
              <div key={player} className="flex items-center justify-between p-2 bg-black/50 rounded-lg">
                <div className="text-white text-sm font-semibold">{player}</div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 text-xs bg-cyan-500 text-black rounded hover:bg-cyan-600">Accept</button>
                  <button className="px-2 py-1 text-xs border border-cyan-500/30 text-white rounded hover:bg-black/50">
                    Decline
                  </button>
                </div>
              </div>
            ))}
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
