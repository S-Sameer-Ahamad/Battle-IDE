"use client"

import { useState } from "react"
import AuthenticatedLayout from "@/components/authenticated-layout"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [username, setUsername] = useState("username")
  const [bio, setBio] = useState("Competitive coder")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
    <AuthenticatedLayout>
      <main className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-cyan-500/20">
            <button
              onClick={() => setActiveTab(0)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 0 ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 1 ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-white"
              }`}
            >
              Account
            </button>
          </div>

          <div>
            {activeTab === 0 && (
                <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-1">Can be changed once every 30 days</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      rows={4}
                    />
                  </div>

                  <button
                    className="w-full py-2 rounded-lg font-bold transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                      color: "#0A0A0F",
                    }}
                  >
                    Save Changes
                  </button>
                </div>
            )}

            {activeTab === 1 && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <button
                      className="w-full py-2 rounded-lg font-bold transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                        color: "#0A0A0F",
                      }}
                    >
                      Update Password
                    </button>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
                    <h2 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h2>
                    <p className="text-gray-400 mb-4">Permanently delete your account and all associated data.</p>
                    <button className="px-6 py-2 rounded-lg font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </main>
    </AuthenticatedLayout>
  )
}
