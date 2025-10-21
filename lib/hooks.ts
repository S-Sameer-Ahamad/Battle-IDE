"use client"

import { useState, useEffect } from 'react'

// Generic hook for API calls
export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(url, options)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, JSON.stringify(options)])

  return { data, loading, error }
}

// Hook for problems
export function useProblems(difficulty?: string) {
  const url = difficulty 
    ? `/api/problems?difficulty=${difficulty}`
    : '/api/problems'
  
  return useApi<{ problems: any[] }>(url)
}

// Hook for a single problem
export function useProblem(id: string) {
  return useApi<{ problem: any }>(`/api/problems/${id}`)
}

// Hook for matches
export function useMatches(status?: string, type?: string) {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (type) params.append('type', type)
  
  const url = params.toString() 
    ? `/api/matches?${params.toString()}`
    : '/api/matches'
  
  return useApi<{ matches: any[] }>(url)
}

// Hook for a single match
export function useMatch(id: string) {
  return useApi<{ match: any }>(`/api/matches/${id}`)
}

// Hook for users
export function useUsers(search?: string) {
  const url = search 
    ? `/api/users?search=${encodeURIComponent(search)}`
    : '/api/users'
  
  return useApi<{ users: any[] }>(url)
}

// Hook for a single user
export function useUser(id: string) {
  return useApi<{ user: any }>(`/api/users/${id}`)
}

// Hook for leaderboard
export function useLeaderboard(limit = 50, offset = 0) {
  return useApi<{ leaderboard: any[] }>(`/api/leaderboard?limit=${limit}&offset=${offset}`)
}
