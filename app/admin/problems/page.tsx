"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState([
    { id: 1, title: "Two Sum", difficulty: "Easy", submissions: 1234 },
    { id: 2, title: "Add Two Numbers", difficulty: "Medium", submissions: 856 },
    { id: 3, title: "Longest Substring", difficulty: "Medium", submissions: 645 },
  ])

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this problem?")) {
      setProblems(problems.filter(p => p.id !== id))
      toast.success("Problem deleted successfully!")
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

          {/* Problems Table */}
          <div className="bg-accent-card border border-cyan-500/20 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-black/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Submissions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-cyan-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id} className="border-b border-cyan-500/10 hover:bg-black/50">
                    <td className="px-6 py-4 text-white font-semibold">{problem.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          problem.difficulty === "Easy"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{problem.submissions}</td>
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
        </div>
      </main>
    </div>
  )
}
