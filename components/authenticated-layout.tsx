"use client"

import { useState } from "react"
import AppHeader from "@/components/app-header"
import ChatPanel from "@/components/chat-panel"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <AppHeader onChatToggle={() => setIsChatOpen(!isChatOpen)} />
      <main className="pt-20">
        {children}
      </main>
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  )
}
