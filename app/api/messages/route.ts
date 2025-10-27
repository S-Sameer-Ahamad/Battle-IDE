import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { battleSocket } from '@/lib/socket-server'

// GET: Fetch user's messages (conversations)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            elo: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            elo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 messages
    })

    // Group messages by conversation partner
    const conversations = new Map<string, any>()
    
    messages.forEach((msg) => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId
      const partner = msg.senderId === userId ? msg.receiver : msg.sender
      
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          partnerUsername: partner.username,
          partnerElo: partner.elo,
          messages: [],
          lastMessage: msg,
          unreadCount: 0,
        })
      }
      
      const conv = conversations.get(partnerId)
      conv.messages.push({
        id: msg.id,
        text: msg.content,
        from: msg.senderId === userId ? 'You' : partner.username,
        fromId: msg.senderId,
        time: msg.createdAt,
        isRead: msg.isRead,
      })
      
      // Count unread messages from partner
      if (msg.receiverId === userId && !msg.isRead) {
        conv.unreadCount++
      }
    })

    // We fetched latest 50 in desc order; reverse each conversation's messages
    // so the UI renders them chronologically (oldest → newest)
    for (const conv of conversations.values()) {
      conv.messages.reverse()
    }

    return NextResponse.json({
      conversations: Array.from(conversations.values()),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, content } = body

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    // Emit Socket.IO event to notify receiver in real-time (works even if sender socket is offline)
    try {
      battleSocket.sendDirectMessage(receiverId, {
        senderId: message.senderId,
        senderUsername: message.sender.username,
        content: message.content,
        conversationId: receiverId,
        timestamp: new Date(),
      })
    } catch (e) {
      console.error('Failed to emit real-time message from API:', e)
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PATCH: Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, partnerId } = body

    if (!userId || !partnerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mark all messages from partner as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
