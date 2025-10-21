"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface AppHeaderProps {
  onChatToggle?: () => void
}

export default function AppHeader({ onChatToggle }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isNotificationOpen) {
        setIsNotificationOpen(false)
      }
      if (isProfileOpen) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationOpen, isProfileOpen])

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-cyan-500/20 bg-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold neon-text-cyan hover:opacity-80 transition-opacity">
          ⚔️ BATTLE IDE
        </Link>

        {/* Right side - User controls */}
        <div className="flex gap-4 items-center">
          {/* Elo Badge */}
          <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 font-bold text-sm">{user?.elo || 1200}</span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 hover:bg-accent-card rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-magenta-secondary rounded-full"></span>
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-accent-card border border-cyan-500/20 rounded-lg shadow-xl overflow-hidden z-50 max-h-96">
                <div className="px-4 py-3 border-b border-cyan-500/20">
                  <h3 className="text-white font-bold text-sm">Notifications</h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-black/50 transition-colors">
                    <div className="text-white text-sm font-semibold">New friend request</div>
                    <div className="text-gray-400 text-xs">Player123 wants to be friends</div>
                  </div>
                  <div className="px-4 py-3 hover:bg-black/50 transition-colors">
                    <div className="text-white text-sm font-semibold">Match invitation</div>
                    <div className="text-gray-400 text-xs">CodeMaster challenged you</div>
                  </div>
                </div>
                <div className="p-3 border-t border-cyan-500/20">
                  <button className="w-full text-center text-cyan-400 text-sm hover:text-white transition-colors mb-3">
                    View All Notifications
                  </button>
                  
                  {/* Your Stats Section */}
                  <div className="bg-black/30 rounded-lg p-3">
                    <h4 className="text-white font-bold text-sm mb-2">Your Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Elo</span>
                        <span className="text-cyan-400 font-bold">1250</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">W/L</span>
                        <span className="text-white">12/8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Matches</span>
                        <span className="text-cyan-400 font-bold">20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rate</span>
                        <span className="text-cyan-400 font-bold">60%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel Trigger */}
          <button 
            onClick={onChatToggle}
            className="p-2 hover:bg-accent-card rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>

          {/* User Avatar Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white font-bold hover:opacity-80 transition-opacity"
            >
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-accent-card border border-cyan-500/20 rounded-lg shadow-lg overflow-hidden z-50">
                <Link
                  href={`/profile/${user?.id || '1'}`}
                  className="block px-4 py-2 text-sm text-white hover:bg-black/50 transition-colors"
                >
                  Your Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-white hover:bg-black/50 transition-colors"
                >
                  Settings
                </Link>
                <div className="border-t border-cyan-500/20">
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-black/50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}