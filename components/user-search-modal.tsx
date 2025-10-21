"use client"

import { useState } from "react"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([
    { id: "user1", username: "CodeMaster", elo: 1350, isOnline: true },
    { id: "user2", username: "AlgoNinja", elo: 1280, isOnline: false },
    { id: "user3", username: "DataWizard", elo: 1420, isOnline: true },
  ])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual user search API call
    console.log("Searching for:", searchTerm)
    // Filter mock results for demonstration
    setSearchResults(
      [
        { id: "user1", username: "CodeMaster", elo: 1350, isOnline: true },
        { id: "user2", username: "AlgoNinja", elo: 1280, isOnline: false },
        { id: "user3", username: "DataWizard", elo: 1420, isOnline: true },
      ].filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

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
            className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-600 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="max-h-60 overflow-y-auto space-y-3">
          {searchResults.length > 0 ? (
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
                    className="px-3 py-1 text-xs bg-magenta-secondary text-black rounded hover:bg-magenta-primary"
                  >
                    Add Friend
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No users found.</p>
          )}
        </div>
      </div>
    </div>
  )
}