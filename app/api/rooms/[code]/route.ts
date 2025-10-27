import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get room details by code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const room = await prisma.match.findFirst({
      where: {
        roomCode: code,
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            description: true,
            examples: true,
            difficulty: true,
            timeLimit: true,
            memoryLimit: true,
            testCases: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                elo: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      room: {
        id: room.id,
        roomCode: room.roomCode,
        status: room.status,
        maxParticipants: room.maxParticipants,
        timeLimit: room.timeLimit,
        problem: room.problem,
        participants: room.participants.map(p => ({
          userId: p.user.id,
          username: p.user.username,
          elo: p.user.elo,
          isHost: p.isHost,
          joinedAt: p.joinedAt,
        })),
        createdAt: room.createdAt,
        startedAt: room.startedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}
