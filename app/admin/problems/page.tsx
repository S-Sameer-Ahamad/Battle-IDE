"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"

interface Problem {
  id: number
  title: string
  difficulty: string
  createdAt: string
  _count?: {
    matches: number
  }
}

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")

  useEffect(() => {
    fetchProblems()
  }, [filter])

  const fetchProblems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter) params.append('difficulty', filter)
      params.append('limit', '100')
      
      const response = await fetch(`/api/problems?${params}`)
      if (!response.ok) throw new Error('Failed to fetch problems')
      
      const data = await response.json()
      setProblems(data.problems)
    } catch (error) {
      toast.error("Failed to load problems")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this problem? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/problems/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete problem')
      }

      setProblems(problems.filter(p => p.id !== id))
      toast.success("Problem deleted successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete problem")
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-cyan-500/20 bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold neon-text-cyan hover:opacity-80">
            ADMIN PANEL
          </Link>
          <button className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Manage Problems</h1>
            <Link
              href="/admin/problems/new"
              className="px-6 py-2 rounded-lg font-bold"
              style={{
                background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                color: "#0A0A0F",
              }}
            >
              Create Problem
            </Link>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "" 
                  ? "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400" 
                  : "bg-black border border-cyan-500/30 text-white hover:bg-black/50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("Easy")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "Easy" 
                  ? "bg-green-500/20 border-2 border-green-500 text-green-400" 
                  : "bg-black border border-cyan-500/30 text-white hover:bg-black/50"
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setFilter("Medium")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "Medium" 
                  ? "bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400" 
                  : "bg-black border border-cyan-500/30 text-white hover:bg-black/50"
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilter("Hard")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "Hard" 
                  ? "bg-red-500/20 border-2 border-red-500 text-red-400" 
                  : "bg-black border border-cyan-500/30 text-white hover:bg-black/50"
              }`}
            >
              Hard
            </button>
          </div>

          {/* Problems Table */}
          {loading ? (
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
              <p className="text-white mt-4">Loading problems...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-12 text-center">
              <p className="text-white text-lg mb-4">No problems found</p>
              <Link
                href="/admin/problems/new"
                className="inline-block px-6 py-2 rounded-lg font-bold"
                style={{
                  background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                  color: "#0A0A0F",
                }}
              >
                Create First Problem
              </Link>
            </div>
          ) : (
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyan-500/20 bg-black/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Difficulty</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => (
                    <tr key={problem.id} className="border-b border-cyan-500/10 hover:bg-black/50">
                      <td className="px-6 py-4 text-gray-400">#{problem.id}</td>
                      <td className="px-6 py-4 text-white font-semibold">{problem.title}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            problem.difficulty === "Easy"
                              ? "bg-green-500/20 text-green-400"
                              : problem.difficulty === "Medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <Link
                          href={`/admin/problems/${problem.id}/edit`}
                          className="px-3 py-1 rounded text-sm bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(problem.id)}
                          className="px-3 py-1 rounded text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
