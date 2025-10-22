"use client"

import { useState } from "react"
import AppHeader from "@/components/app-header"
import SlidingChatPanel from "@/components/sliding-chat-panel"
import SlidingNotificationPanel from "@/components/sliding-notification-panel"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <AppHeader 
        onChatToggle={() => {
          setIsChatOpen(!isChatOpen)
          setIsNotificationOpen(false) // Close notifications when opening chat
        }}
        onNotificationToggle={() => {
          setIsNotificationOpen(!isNotificationOpen)
          setIsChatOpen(false) // Close chat when opening notifications
        }}
      />
      
      {/* Main Content - Pushed left when panels are open */}
      <main 
        className={`pt-20 transition-all duration-300 ease-in-out ${
          isChatOpen || isNotificationOpen ? 'mr-[380px] lg:mr-[400px]' : ''
        }`}
      >
        {children}
      </main>

      {/* Sliding Panels */}
      <SlidingChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <SlidingNotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </div>
  )
}
