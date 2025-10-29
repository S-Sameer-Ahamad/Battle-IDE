"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useSocket } from '@/lib/socket-context'
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface AppHeaderProps {
  onChatToggle?: () => void
  onNotificationToggle?: () => void
}

export default function AppHeader({ onChatToggle, onNotificationToggle }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { isConnected } = useSocket()

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-cyan-500/20 bg-black/80">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold neon-text-cyan hover:opacity-80 transition-opacity flex items-center gap-2">
          ⚔️ BATTLE IDE
        </Link>

        {/* Right side - User controls */}
        <div className="flex gap-4 items-center">
          {/* Elo Badge */}
          <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 font-bold text-sm">{user?.elo || 1200}</span>
          </div>

          {/* Notification Bell */}
          <button 
            onClick={onNotificationToggle}
            className="relative p-2 hover:bg-accent-card rounded-lg transition-colors"
            title="Notifications"
          >
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-magenta-secondary rounded-full animate-pulse"></span>
          </button>

          {/* Chat Panel Trigger */}
          <button 
            onClick={onChatToggle}
            className="p-2 hover:bg-accent-card rounded-lg transition-colors"
            title="Messages"
          >
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {!isConnected && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" title="Disconnected"></span>
            )}
          </button>

          {/* User Avatar Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white font-bold hover:opacity-80 transition-opacity hover:scale-110 transform"
              title={user?.username || 'User'}
            >
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-2xl overflow-hidden z-50 animate-fadeIn">
                {/* User Info */}
                <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-cyan-500/20">
                  <div className="text-white font-bold text-sm">{user?.username || 'User'}</div>
                  <div className="text-cyan-400 text-xs">{user?.email || 'user@example.com'}</div>
                  <div className="mt-1 text-xs text-gray-400">
                    ELO: <span className="text-cyan-400 font-bold">{user?.elo || 1200}</span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      router.push(`/profile/${user?.id || '1'}`)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-cyan-500/10 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Your Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      router.push('/settings')
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-cyan-500/10 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </button>
                </div>

                <div className="border-t border-cyan-500/20">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
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