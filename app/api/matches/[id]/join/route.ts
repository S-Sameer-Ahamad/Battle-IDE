import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const joinMatchSchema = z.object({
  userId: z.string(),
  isHost: z.boolean().optional().default(false),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId, isHost } = joinMatchSchema.parse(body)

    // Check if match exists and is in waiting status
    const match = await prisma.match.findUnique({
      where: { id: params.id },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    if (match.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Match is not accepting new participants' },
        { status: 400 }
      )
    }

    // Check if user is already in the match
    const existingParticipant = await prisma.matchParticipant.findUnique({
      where: {
        matchId_userId: {
          matchId: params.id,
          userId,
        },
      },
    })

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'User is already in this match' },
        { status: 400 }
      )
    }

    // Add user to match
    const participant = await prisma.matchParticipant.create({
      data: {
        matchId: params.id,
        userId,
        isHost,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            elo: true,
          },
        },
      },
    })

    return NextResponse.json({ participant })
  } catch (error) {
    console.error('Error joining match:', error)
    return NextResponse.json(
      { error: 'Failed to join match' },
      { status: 500 }
    )
  }
}
