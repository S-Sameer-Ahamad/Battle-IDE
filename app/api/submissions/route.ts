import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { judge0Service, SUPPORTED_LANGUAGES } from '@/lib/judge0'

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
      include: {
        problem: true,
      },
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

    // Verify language is supported
    const languageId = SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]
    if (!languageId) {
      return NextResponse.json(
        { error: 'Unsupported programming language' },
        { status: 400 }
      )
    }

    // Parse test cases from the problem
    const testCases = JSON.parse(match.problem.testCases)

    // Execute code against test cases
    const { passed, results, passedCount, totalCount } = await judge0Service.validateTestCases(
      code,
      languageId,
      testCases
    )

    // Calculate statistics
    let status = 'wrong_answer'
    let executionTime = 0

    // Determine submission status and get max execution time
    if (passed) {
      status = 'accepted'
    } else {
      const errorResult = results.find(r => r.status.id !== 3)
      if (errorResult) {
        if (errorResult.status.id === 5) status = 'time_limit'
        else if (errorResult.status.id === 6) status = 'memory_limit'
        else if (errorResult.status.id === 7) status = 'runtime_error'
        else if (errorResult.status.id === 11) status = 'compilation_error'
      }
    }

    // Get maximum execution time from all test cases
    executionTime = Math.max(...results.map(r => parseFloat(r.time || '0')))

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        matchId,
        userId,
        code,
        language,
        status,
        testCasesPassed: passedCount,
        totalTestCases: totalCount,
        executionTime: Math.round(executionTime * 1000), // Convert to milliseconds
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

    return NextResponse.json({ 
      submission,
      executionResults: results
    })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
