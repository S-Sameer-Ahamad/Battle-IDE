import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSubmissionSchema = z.object({
  matchId: z.string(),
  userId: z.string(),
  code: z.string(),
  language: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matchId, userId, code, language } = createSubmissionSchema.parse(body)

    // Verify match exists and is active
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    if (match.status !== 'active') {
      return NextResponse.json(
        { error: 'Match is not active' },
        { status: 400 }
      )
    }

    // TODO: Add code execution and testing logic here
    // For now, we'll simulate test results
    const testCasesPassed = Math.floor(Math.random() * 5) + 1 // Random 1-5
    const totalTestCases = 5
    const status = testCasesPassed === totalTestCases ? 'accepted' : 'wrong_answer'

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        matchId,
        userId,
        code,
        language,
        status,
        testCasesPassed,
        totalTestCases,
        executionTime: Math.floor(Math.random() * 1000) + 100, // Random 100-1100ms
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        match: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
