import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { battleSocket } from '@/lib/socket-server'
import { notifyMatchInvite } from '@/lib/notifications'

// POST - Send match invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, matchId, problemTitle } = body

    if (!senderId || !receiverId || !matchId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get sender info
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { username: true },
    })

    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      )
    }

    // Get match info
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        problem: {
          select: {
            title: true,
            difficulty: true,
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Create notification
    try {
      await notifyMatchInvite(receiverId, sender.username, matchId)
    } catch (error) {
      console.error('Failed to create notification:', error)
    }

    // Send Socket.IO event
    battleSocket.sendMatchInvitation(receiverId, {
      matchId: match.id,
      roomCode: match.roomCode,
      senderId,
      senderUsername: sender.username,
      problemTitle: match.problem.title,
      difficulty: match.problem.difficulty,
      timeLimit: match.timeLimit,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending match invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
