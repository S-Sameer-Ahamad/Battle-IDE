import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        problem: true,
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
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ match })
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, startedAt, endedAt } = body

    const match = await prisma.match.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(startedAt && { startedAt: new Date(startedAt) }),
        ...(endedAt && { endedAt: new Date(endedAt) }),
      },
      include: {
        problem: true,
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
    })

    return NextResponse.json({ match })
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
}
