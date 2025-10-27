import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Start a room (host only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { userId, problemId } = body

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
        status: 'waiting',
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

    // Check if user is the host
    const host = room.participants.find(p => p.userId === userId && p.isHost)
    if (!host) {
      return NextResponse.json(
        { error: 'Only the host can start the room' },
        { status: 403 }
      )
    }

    // Check if there are at least 2 participants
    if (room.participants.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 participants are required to start' },
        { status: 400 }
      )
    }

    // Update the match status and problem if provided
    const updateData: any = {
      status: 'active',
      startedAt: new Date(),
    }

    if (problemId) {
      updateData.problemId = parseInt(problemId)
    }

    const updatedMatch = await prisma.match.update({
      where: { id: room.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      matchId: updatedMatch.id,
      status: updatedMatch.status,
      startedAt: updatedMatch.startedAt,
    })
  } catch (error) {
    console.error('Error starting room:', error)
    return NextResponse.json(
      { error: 'Failed to start room' },
      { status: 500 }
    )
  }
}
