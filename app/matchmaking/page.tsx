"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MatchmakingModal from "@/components/matchmaking-modal"

export default function MatchmakingPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(true)

  useEffect(() => {
    if (!isModalOpen) {
      router.push("/dashboard")
    }
  }, [isModalOpen, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <MatchmakingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
