import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude similar looking chars
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// POST - Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hostId, hostUsername, maxParticipants = 5, timeLimit = 15 } = body

    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      )
    }

    // Generate unique room code
    let roomCode = generateRoomCode()
    let existing = await prisma.match.findFirst({
      where: { roomCode },
    })

    // Ensure uniqueness
    while (existing) {
      roomCode = generateRoomCode()
      existing = await prisma.match.findFirst({
        where: { roomCode },
      })
    }

    // Get a random problem (you can make this selectable later)
    const problems = await prisma.problem.findMany()
    if (problems.length === 0) {
      return NextResponse.json(
        { error: 'No problems available' },
        { status: 404 }
      )
    }

    const randomProblem = problems[Math.floor(Math.random() * problems.length)]

    // Create match/room
    const match = await prisma.match.create({
      data: {
        problemId: randomProblem.id,
        type: 'group',
        status: 'waiting',
        roomCode,
        timeLimit,
        maxParticipants,
      },
    })

    // Add host as first participant
    await prisma.matchParticipant.create({
      data: {
        matchId: match.id,
        userId: hostId,
        isHost: true,
      },
    })

    return NextResponse.json({
      success: true,
      match: {
        id: match.id,
        roomCode: match.roomCode,
        status: match.status,
        maxParticipants: match.maxParticipants,
        timeLimit: match.timeLimit,
      },
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

// GET - Get all active rooms (for room browser)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'waiting'

    const rooms = await prisma.match.findMany({
      where: {
        type: 'group',
        status,
        roomCode: {
          not: null,
        },
      },
      include: {
        problem: {
          select: {
            title: true,
            difficulty: true,
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    const roomList = rooms.map(room => ({
      id: room.id,
      roomCode: room.roomCode,
      problem: room.problem,
      status: room.status,
      participants: room.participants.map(p => ({
        userId: p.user.id,
        username: p.user.username,
        elo: p.user.elo,
        isHost: p.isHost,
      })),
      participantCount: room.participants.length,
      maxParticipants: room.maxParticipants,
      timeLimit: room.timeLimit,
      createdAt: room.createdAt,
    }))

    return NextResponse.json({ rooms: roomList })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}
