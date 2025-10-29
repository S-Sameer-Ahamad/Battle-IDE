"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthCard from "@/components/auth-card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitted(true)
        // Store debug info if available (development only)
        if (data.debug) {
          setDebugInfo(data.debug)
        }
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Navigation - Back to Login */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/auth/login"
          className="group flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Login</span>
        </Link>
      </div>

      <AuthCard title="Reset Password">
      {!submitted ? (
        <>
          <p className="text-gray-400 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              {isLoading ? "Sending..." : "Send Reset Link"}
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
          <p className="text-green-400 text-lg font-semibold mb-2">Check your email!</p>
          <p className="text-gray-400 text-sm mb-6">
            If an account exists with <strong className="text-white">{email}</strong>, you'll receive a password reset link within a few minutes.
          </p>
          <p className="text-gray-400 text-sm">The link will expire in 1 hour.</p>
          
          {/* Development debug info */}
          {debugInfo && (
            <div className={`mt-4 p-3 rounded-lg border text-sm ${
              debugInfo.emailExists 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
              <div className="font-semibold mb-1">
                {debugInfo.emailExists ? '✅ Email Found' : '⚠️ Email Not Found'}
              </div>
              <div className="text-xs opacity-80">{debugInfo.hint}</div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </AuthCard>
    </>
  )
}
