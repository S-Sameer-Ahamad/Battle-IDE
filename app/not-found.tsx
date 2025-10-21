"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-lg font-bold"
          style={{
            background: "linear-gradient(135deg, #00FFFF, #FF007F)",
            color: "#0A0A0F",
          }}
        >
          Go to Home
        </Link>
      </div>
    </div>
  )
}
