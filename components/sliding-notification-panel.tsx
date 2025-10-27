'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

interface SlidingNotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  time: string
  read: boolean
  icon: string
  data?: string
}

interface UserStats {
  elo: number
  wins: number
  losses: number
  totalMatches: number
  winRate: number
}

export default function SlidingNotificationPanel({ isOpen, onClose }: SlidingNotificationPanelProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Helper to format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  // Fetch notifications and user stats
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Fetch notifications
        const notifResponse = await fetch(`/api/notifications?userId=${user.id}`)
        const notifData = await notifResponse.json()
        
        if (notifData.notifications) {
          setNotifications(notifData.notifications)
          setUnreadCount(notifData.unreadCount || 0)
        }

        // Fetch user stats
        const userResponse = await fetch(`/api/users/${user.id}`)
        const userData = await userResponse.json()
        
        if (userData.user) {
          setUserStats({
            elo: userData.user.elo || 1200,
            wins: userData.user.wins || 0,
            losses: userData.user.losses || 0,
            totalMatches: userData.user.totalMatches || 0,
            winRate: userData.user.winRate || 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen, user?.id])

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const notification = event.detail
      console.log('🔔 Received real-time notification:', notification)

      // Add to notifications list at the top
      setNotifications((prev) => [{
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        time: notification.createdAt,
        read: false,
        icon: getNotificationIcon(notification.type),
        data: notification.data,
      }, ...prev])

      // Increment unread count
      setUnreadCount((prev) => prev + 1)

      // Show toast notification
      toast.info(notification.title, {
        description: notification.message,
      })
    }

    const handleMatchInvitation = (event: CustomEvent) => {
      const invitation = event.detail
      console.log('⚔️ Received match invitation:', invitation)

      // Show toast with action buttons
      toast.info('Match Invitation!', {
        description: `${invitation.senderUsername} invited you to a ${invitation.difficulty} match`,
        action: {
          label: 'Join',
          onClick: () => {
            window.location.href = `/match/${invitation.matchId}`
          },
        },
      })
    }

    window.addEventListener('new-notification', handleNewNotification as EventListener)
    window.addEventListener('match-invitation', handleMatchInvitation as EventListener)

    return () => {
      window.removeEventListener('new-notification', handleNewNotification as EventListener)
      window.removeEventListener('match-invitation', handleMatchInvitation as EventListener)
    }
  }, [])

  // Helper to get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return '👋'
      case 'match_invite':
        return '⚔️'
      case 'match_result':
        return '🏆'
      default:
        return '📢'
    }
  }

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, markAllRead: true }),
      })

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Handle friend request accept
  const handleAcceptFriendRequest = async (notification: Notification) => {
    try {
      const data = notification.data ? JSON.parse(notification.data) : null
      const friendRequestId = data?.friendRequestId

      if (!friendRequestId) {
        toast.error('Invalid friend request')
        return
      }

      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: friendRequestId,
          action: 'accept',
        }),
      })

      if (response.ok) {
        toast.success('Friend request accepted!')
        
        // Mark notification as read and remove it
        await handleMarkAsRead(notification.id)
        
        // Dispatch event to refresh friends list in chat panel
        window.dispatchEvent(new CustomEvent('friend-list-updated'))
        
        // Refresh notifications
        const notifResponse = await fetch(`/api/notifications?userId=${user?.id}`)
        const notifData = await notifResponse.json()
        if (notifData.notifications) {
          setNotifications(notifData.notifications)
          setUnreadCount(notifData.unreadCount || 0)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to accept friend request')
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error)
      toast.error('Failed to accept friend request')
    }
  }

  // Handle friend request decline
  const handleDeclineFriendRequest = async (notification: Notification) => {
    try {
      const data = notification.data ? JSON.parse(notification.data) : null
      const friendRequestId = data?.friendRequestId

      if (!friendRequestId) {
        toast.error('Invalid friend request')
        return
      }

      const response = await fetch('/api/friends', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: friendRequestId,
          action: 'decline',
        }),
      })

      if (response.ok) {
        toast.info('Friend request declined')
        
        // Mark notification as read and remove it
        await handleMarkAsRead(notification.id)
        
        // Refresh notifications
        const notifResponse = await fetch(`/api/notifications?userId=${user?.id}`)
        const notifData = await notifResponse.json()
        if (notifData.notifications) {
          setNotifications(notifData.notifications)
          setUnreadCount(notifData.unreadCount || 0)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to decline friend request')
      }
    } catch (error) {
      console.error('Failed to decline friend request:', error)
      toast.error('Failed to decline friend request')
    }
  }

  // Handle match invite accept
  const handleAcceptMatchInvite = async (notification: Notification) => {
    try {
      const data = notification.data ? JSON.parse(notification.data) : null
      const matchId = data?.matchId
      if (!user?.id || !matchId) {
        toast.error('Invalid match invitation')
        return
      }

      // Join the match as participant (non-host)
      const resp = await fetch(`/api/matches/${matchId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isHost: false }),
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        toast.error(err.error || 'Failed to join match')
        return
      }

      // Mark notification as read
      await handleMarkAsRead(notification.id)

      // Navigate to the match page
      window.location.href = `/match/${matchId}`
    } catch (e) {
      console.error('Failed to accept match invite:', e)
      toast.error('Failed to accept match invite')
    }
  }

  // Handle match invite decline
  const handleDeclineMatchInvite = async (notification: Notification) => {
    try {
      await handleMarkAsRead(notification.id)
      toast.info('Invitation declined')
    } catch (e) {
      console.error('Failed to decline match invite:', e)
      toast.error('Failed to decline invitation')
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-gradient-to-b from-gray-900 to-black border-l border-cyan-500/30 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${
                    notification.read
                      ? 'bg-gray-800/30 border-gray-700/50'
                      : 'bg-cyan-500/10 border-cyan-500/30'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-3xl">{notification.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-white font-semibold text-sm">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{formatRelativeTime(notification.time)}</span>
                        {notification.type === 'friend_request' && !notification.read && notification.message.includes('wants to be friends') && (
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAcceptFriendRequest(notification)
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeclineFriendRequest(notification)
                              }}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {notification.type === 'match_invite' && !notification.read && (
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAcceptMatchInvite(notification)
                              }}
                              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition-colors"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeclineMatchInvite(notification)
                              }}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8 text-sm">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>No notifications yet</p>
                <p className="text-xs mt-2">You&apos;ll see updates here</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/20 bg-black/80 backdrop-blur-sm">
          <h3 className="text-white font-bold text-sm mb-3">Your Stats</h3>
          {loading ? (
            <div className="text-center text-gray-400 py-4 text-sm">Loading stats...</div>
          ) : userStats ? (
            <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{userStats.elo}</div>
                  <div className="text-xs text-gray-400">ELO Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats.wins}/{userStats.losses}</div>
                  <div className="text-xs text-gray-400">Wins/Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{userStats.totalMatches}</div>
                  <div className="text-xs text-gray-400">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{userStats.winRate}%</div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4 text-sm">No stats available</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </>
  )
}
