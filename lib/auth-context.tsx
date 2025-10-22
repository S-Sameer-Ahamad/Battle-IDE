"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface User {
  id: string
  username: string
  email: string
  elo: number
  wins: number
  losses: number
  bio?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthError {
  message: string
  details?: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: AuthError }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isLoading: boolean
  isAuthenticating: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const router = useRouter()

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    await fetchCurrentUser()
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError }> => {
    setIsAuthenticating(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast.success('Login successful!', {
          description: `Welcome back, ${data.user.username}!`,
        })
        return { success: true }
      } else {
        const error: AuthError = {
          message: data.error || 'Login failed',
          details: data.details,
        }
        toast.error('Login failed', {
          description: error.message,
        })
        return { success: false, error }
      }
    } catch (error) {
      console.error('Login error:', error)
      const authError: AuthError = {
        message: 'An unexpected error occurred. Please try again.',
      }
      toast.error('Login failed', {
        description: authError.message,
      })
      return { success: false, error: authError }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const register = async (
    email: string,
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: AuthError }> => {
    setIsAuthenticating(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast.success('Registration successful!', {
          description: `Welcome to Battle-IDE, ${data.user.username}!`,
        })
        return { success: true }
      } else {
        const error: AuthError = {
          message: data.error || 'Registration failed',
          details: data.details,
        }
        toast.error('Registration failed', {
          description: error.message,
        })
        return { success: false, error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      const authError: AuthError = {
        message: 'An unexpected error occurred. Please try again.',
      }
      toast.error('Registration failed', {
        description: authError.message,
      })
      return { success: false, error: authError }
    } finally {
      setIsAuthenticating(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setUser(null)
      toast.success('Logged out successfully')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed', {
        description: 'An error occurred while logging out',
      })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshUser,
        isLoading,
        isAuthenticating,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
