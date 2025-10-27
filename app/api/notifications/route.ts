import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 notifications
    })

    // Map to include icon based on type
    const notificationsWithIcons = notifications.map((notif) => {
      let icon = '📢'
      if (notif.type === 'friend_request') icon = '👥'
      else if (notif.type === 'match_invite') icon = '⚔️'
      else if (notif.type === 'match_result') {
        // Parse data to determine win/loss
        try {
          const data = notif.data ? JSON.parse(notif.data) : {}
          icon = data.result === 'won' ? '🏆' : '💔'
        } catch {
          icon = '🎮'
        }
      }

      return {
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        time: notif.createdAt,
        read: notif.isRead,
        icon,
        data: notif.data,
      }
    })

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    return NextResponse.json({
      notifications: notificationsWithIcons,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST: Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, data } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    })

    // TODO: Emit Socket.IO event to notify user in real-time
    // io.to(userId).emit('new_notification', notification)

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PATCH: Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, userId, markAllRead } = body

    if (markAllRead && userId) {
      // Mark all notifications as read for user
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })

      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    } else if (notificationId) {
      // Mark single notification as read
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      })

      return NextResponse.json({ notification })
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or userId with markAllRead is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const notificationId = searchParams.get('notificationId')
    const userId = searchParams.get('userId')
    const deleteAll = searchParams.get('deleteAll') === 'true'

    if (deleteAll && userId) {
      // Delete all read notifications for user
      await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true,
        },
      })

      return NextResponse.json({ success: true, message: 'All read notifications deleted' })
    } else if (notificationId) {
      // Delete single notification
      await prisma.notification.delete({
        where: { id: notificationId },
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or userId with deleteAll is required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
