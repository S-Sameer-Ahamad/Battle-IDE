'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface SlidingNotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SlidingNotificationPanel({ isOpen, onClose }: SlidingNotificationPanelProps) {
  const { user } = useAuth()

  // Mock notifications - replace with real data
  const notifications = [
    {
      id: '1',
      type: 'friend_request',
      title: 'New friend request',
      message: 'Player123 wants to be friends',
      time: '2 minutes ago',
      read: false,
      icon: '👥',
    },
    {
      id: '2',
      type: 'match_invite',
      title: 'Match invitation',
      message: 'CodeMaster challenged you to a 1v1 battle',
      time: '5 minutes ago',
      read: false,
      icon: '⚔️',
    },
    {
      id: '3',
      type: 'match_result',
      title: 'Victory!',
      message: 'You won against AlgoNinja (+15 ELO)',
      time: '1 hour ago',
      read: true,
      icon: '🏆',
    },
    {
      id: '4',
      type: 'match_result',
      title: 'Match completed',
      message: 'You lost against ProCoder (-12 ELO)',
      time: '2 hours ago',
      read: true,
      icon: '💔',
    },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

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
        className={`fixed top-0 right-0 h-full w-[400px] bg-gradient-to-b from-gray-900 to-black border-l border-cyan-500/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </span>
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${
                  notification.read
                    ? 'bg-gray-800/30 border-gray-700/50'
                    : 'bg-cyan-500/10 border-cyan-500/30'
                }`}
              >
                <div className="flex gap-3">
                  <div className="text-3xl">{notification.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{notification.time}</span>
                      {notification.type === 'match_invite' && (
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition-colors">
                            Accept
                          </button>
                          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/20 bg-black/80 backdrop-blur-sm">
          <h3 className="text-white font-bold text-sm mb-3">Your Stats</h3>
          <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{user?.elo || 1250}</div>
                <div className="text-xs text-gray-400">ELO Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12/8</div>
                <div className="text-xs text-gray-400">Wins/Losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">20</div>
                <div className="text-xs text-gray-400">Total Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">60%</div>
                <div className="text-xs text-gray-400">Win Rate</div>
              </div>
            </div>
          </div>
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
