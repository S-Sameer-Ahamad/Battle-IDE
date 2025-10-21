"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import AuthCard from "@/components/auth-card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement password reset email logic
    setTimeout(() => {
      setIsLoading(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <AuthCard title="Reset Password">
      {!submitted ? (
        <>
          <p className="text-gray-400 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
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
          <p className="text-green-400 mb-4">Check your email for a password reset link!</p>
          <p className="text-gray-400 text-sm mb-6">The link will expire in 24 hours.</p>
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
  )
}
