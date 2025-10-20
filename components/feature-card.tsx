"use client"

import type { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  highlight?: "cyan" | "magenta"
}

export default function FeatureCard({ icon, title, description, highlight = "cyan" }: FeatureCardProps) {
  const highlightColor = highlight === "cyan" ? "rgba(0, 255, 255, 0.2)" : "rgba(255, 0, 127, 0.2)"

  const glowColor = highlight === "cyan" ? "rgba(0, 255, 255, 0.3)" : "rgba(255, 0, 127, 0.3)"

  return (
    <div
      className="battle-card p-6 rounded-lg group hover:battle-card-hover cursor-pointer"
      style={{
        background: `linear-gradient(135deg, #1F1F2E 0%, ${highlightColor} 100%)`,
        border: `1px solid ${highlightColor}`,
      }}
    >
      <div className="mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 20px ${glowColor}`,
        }}
      />
    </div>
  )
}
