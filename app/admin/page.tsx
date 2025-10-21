"use client"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-cyan-500/20 bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-xl font-bold neon-text-cyan">ADMIN PANEL</div>
          <button className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Users", value: "1,234" },
              { label: "Active Matches", value: "45" },
              { label: "Total Problems", value: "256" },
              { label: "Reports", value: "12" },
            ].map((stat) => (
              <div key={stat.label} className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
                <div className="text-gray-400 text-sm mb-2">{stat.label}</div>
                <div className="text-3xl font-bold text-cyan-400">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/admin/problems"
              className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 hover:border-cyan-500/40 transition-all"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Manage Problems</h2>
              <p className="text-gray-400 mb-4">Create, edit, and delete coding problems</p>
              <button
                className="px-6 py-2 rounded-lg font-bold"
                style={{
                  background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                  color: "#0A0A0F",
                }}
              >
                Go to Problems
              </button>
            </Link>

            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-2">User Reports</h2>
              <p className="text-gray-400 mb-4">Review and manage user reports</p>
              <button className="px-6 py-2 rounded-lg font-bold border border-cyan-500/30 text-white hover:bg-black/50 transition-colors">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
