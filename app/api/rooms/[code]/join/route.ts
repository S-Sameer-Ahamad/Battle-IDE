import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Join a room by code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Find the room
    const room = await prisma.match.findFirst({
      where: {
        roomCode: code,
        status: 'waiting', // Only allow joining waiting rooms
      },
      include: {
        participants: true,
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or already started' },
        { status: 404 }
      )
    }

    // Check if room is full
    if (room.participants.length >= room.maxParticipants) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      )
    }

    // Check if user is already in the room
    const existingParticipant = room.participants.find(p => p.userId === userId)
    if (existingParticipant) {
      return NextResponse.json(
        { error: 'You are already in this room' },
        { status: 400 }
      )
    }

    // Add participant
    await prisma.matchParticipant.create({
      data: {
        matchId: room.id,
        userId,
        isHost: false,
      },
    })

    return NextResponse.json({
      success: true,
      matchId: room.id,
      roomCode: room.roomCode,
    })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}
