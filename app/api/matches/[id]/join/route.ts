import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const joinMatchSchema = z.object({
  userId: z.string(),
  isHost: z.boolean().optional().default(false),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userId, isHost } = joinMatchSchema.parse(body)

    // Check if match exists and is in waiting status
    const match = await prisma.match.findUnique({
      where: { id },
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
          matchId: id,
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
        matchId: id,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation, etc.
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'User is already in this match' },
          { status: 400 }
        )
      }
    }
    console.error('Error joining match:', error)
    return NextResponse.json(
      { error: 'Failed to join match' },
      { status: 500 }
    )
  }
}
