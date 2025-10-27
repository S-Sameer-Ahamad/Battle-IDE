"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

interface User {
  id: string
  username: string
  elo: number
  isOnline: boolean
}

interface UserSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite?: (userId: string) => void
  onAddFriend?: (userId: string) => void
  mode: "invite" | "friend"
}

export default function UserSearchModal({ isOpen, onClose, onInvite, onAddFriend, mode }: UserSearchModalProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}&exclude=${user?.id || ''}`)
      const data = await response.json()
      
      if (data.users) {
        setSearchResults(data.users)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setSearchResults([])
      setHasSearched(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === "invite" ? "Invite User" : "Add Friend"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? "..." : "Search"}
          </button>
        </form>

        <div className="max-h-60 overflow-y-auto space-y-3">
          {isSearching ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
              Searching users...
            </div>
          ) : !hasSearched ? (
            <p className="text-center text-gray-400 py-8">Enter a username to search</p>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-secondary flex items-center justify-center text-white text-xs font-bold">
                    {user.username[0]}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{user.username}</div>
                    <div className="text-xs text-gray-400">
                      {user.elo} Elo • {user.isOnline ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
                {mode === "invite" && (
                  <button
                    onClick={() => {
                      onInvite?.(user.id)
                      onClose()
                    }}
                    className="px-3 py-1 text-xs bg-cyan-500 text-black rounded hover:bg-cyan-600"
                  >
                    Invite
                  </button>
                )}
                {mode === "friend" && (
                  <button
                    onClick={() => {
                      onAddFriend?.(user.id)
                      onClose()
                    }}
                    className="px-3 py-1 text-xs bg-cyan-500 text-black rounded hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  >
                    Add Friend
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-8">No users found matching &quot;{searchTerm}&quot;</p>
          )}
        </div>
      </div>
    </div>
  )
}