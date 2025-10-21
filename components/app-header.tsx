"use client"

import Link from "next/link"
import { useState } from "react"

export default function AppHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-cyan-500/20 bg-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold neon-text-cyan hover:opacity-80 transition-opacity">
          ⚔️ BATTLE IDE
        </Link>

        {/* Right side - User controls */}
        <div className="flex gap-4 items-center">
          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-accent-card rounded-lg transition-colors">
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

          {/* Chat Panel Trigger */}
          <button className="p-2 hover:bg-accent-card rounded-lg transition-colors">
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
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white font-bold hover:opacity-80 transition-opacity"
            >
              U
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-accent-card border border-cyan-500/20 rounded-lg shadow-lg overflow-hidden">
                <Link
                  href="/profile/1"
                  className="block px-4 py-2 text-white hover:bg-black/50 transition-colors text-sm"
                >
                  Your Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-white hover:bg-black/50 transition-colors text-sm"
                >
                  Settings
                </Link>
                <button className="w-full text-left px-4 py-2 text-white hover:bg-black/50 transition-colors text-sm border-t border-cyan-500/20">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
