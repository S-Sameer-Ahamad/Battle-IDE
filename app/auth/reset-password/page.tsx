"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthCard from "@/components/auth-card"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setIsLoading(true)
    // TODO: Implement actual password reset logic
    setTimeout(() => {
      setIsLoading(false)
      setSuccess(true)
    }, 1000)
  }

  return (
    <AuthCard title="Set New Password">
      {!success ? (
        <>
          <p className="text-gray-400 text-sm mb-6">Enter your new password below.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-lg font-bold text-lg transition-all duration-300 neon-glow"
              style={{
                background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                color: "#0A0A0F",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <p className="text-green-400 mb-4 text-lg font-semibold">Password Reset Successful!</p>
          <p className="text-gray-400 text-sm mb-6">You can now sign in with your new password.</p>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-2 rounded-lg font-bold"
            style={{
              background: "linear-gradient(135deg, #00FFFF, #FF007F)",
              color: "#0A0A0F",
            }}
          >
            Sign In
          </Link>
        </div>
      )}
    </AuthCard>
  )
}
