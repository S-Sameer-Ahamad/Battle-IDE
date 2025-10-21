import type React from "react"
export default function AuthCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(0, 255, 255, 0.8), transparent)",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255, 0, 127, 0.8), transparent)",
            animation: "float 8s ease-in-out infinite 1s",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center mb-2 neon-text-cyan">{title}</h1>
          <p className="text-center text-gray-400 mb-8 text-sm">Battle IDE - Code. Compete. Conquer.</p>
          {children}
        </div>
      </div>
    </div>
  )
}
