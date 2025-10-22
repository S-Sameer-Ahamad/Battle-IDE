'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

interface SlidingChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SlidingChatPanel({ isOpen, onClose }: SlidingChatPanelProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'friends' | 'chat' | 'requests'>('friends')
  const [message, setMessage] = useState('')

  // Mock data - replace with real data from API/Socket.IO
  const friends = [
    { id: '1', username: 'Player 1', elo: 1500, online: true },
    { id: '2', username: 'CodeMaster', elo: 1500, online: true },
    { id: '3', username: 'Player 3', elo: 1500, online: false },
    { id: '4', username: 'AlgoNinja', elo: 1650, online: true },
    { id: '5', username: 'Player 5', elo: 1500, online: false },
  ]

  const messages = [
    { id: '1', from: 'CodeMaster', text: 'Ready for a rematch?', time: '2m ago' },
    { id: '2', from: 'You', text: 'Sure! Let me finish this match first', time: '1m ago' },
  ]

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
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Online Friends ({friends.filter(f => f.online).length})
                </h3>
              </div>
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {friend.username[0]}
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
                    <button className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {messages.map((msg) => (
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
                      {msg.from !== 'You' && (
                        <div className="text-xs text-cyan-400 font-semibold mb-1">{msg.from}</div>
                      )}
                      <div className="text-sm">{msg.text}</div>
                      <div className="text-xs opacity-60 mt-1">{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-cyan-500/20 bg-black/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && message.trim()) {
                        // Handle send message
                        console.log('Send:', message)
                        setMessage('')
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (message.trim()) {
                        console.log('Send:', message)
                        setMessage('')
                      }
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="p-4 space-y-3">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">Player123</div>
                    <div className="text-xs text-gray-400">Wants to be friends</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                    Decline
                  </button>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                    C
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm">CodeNinja</div>
                    <div className="text-xs text-gray-400">Challenge request</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
                    Accept Battle
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                    Decline
                  </button>
                </div>
              </div>

              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-sm">No more requests</p>
              </div>
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
