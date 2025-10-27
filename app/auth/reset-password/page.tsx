"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import AuthCard from "@/components/auth-card"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      setValidating(false)
      setTokenValid(false)
    } else {
      setValidating(false)
      setTokenValid(true)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (validating) {
    return (
      <AuthCard title="Reset Password">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-gray-400 mt-4">Validating reset link...</p>
        </div>
      </AuthCard>
    )
  }

  if (!tokenValid) {
    return (
      <AuthCard title="Invalid Link">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 text-lg font-semibold mb-2">{error}</p>
          <p className="text-gray-400 text-sm mb-6">The reset link may have expired or is invalid.</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block px-8 py-2 rounded-lg font-bold"
            style={{
              background: "linear-gradient(135deg, #00FFFF, #FF007F)",
              color: "#0A0A0F",
            }}
          >
            Request New Link
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Set New Password">
      {!success ? (
        <>
          <p className="text-gray-400 text-sm mb-6">Enter your new password below.</p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
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
                minLength={8}
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
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
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-400 text-lg font-semibold mb-2">Password Reset Successful!</p>
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
