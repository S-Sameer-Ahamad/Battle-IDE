import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get the first user to add as a participant
    const user = await prisma.user.findFirst()
    
    if (!user) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      )
    }

    // Create a test match with the first problem
    const problem = await prisma.problem.findFirst()
    
    if (!problem) {
      return NextResponse.json(
        { error: 'No problems found' },
        { status: 404 }
      )
    }

    const match = await prisma.match.create({
      data: {
        problemId: problem.id,
        type: '1v1',
        status: 'waiting',
        participants: {
          create: {
            userId: user.id,
            isHost: true,
          }
        }
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
    console.error('Error creating test match:', error)
    return NextResponse.json(
      { error: 'Failed to create test match' },
      { status: 500 }
    )
  }
}
