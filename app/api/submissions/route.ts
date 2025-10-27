import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { judge0Service, SUPPORTED_LANGUAGES } from '@/lib/judge0'
import { battleSocket } from '@/lib/socket-server'
import { calculateBattleElo, type EloResult } from '@/lib/elo'

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
        passedTests: passedCount,
        totalTests: totalCount,
        executionTime: Math.round(executionTime * 1000), // Convert to milliseconds
        memory: 0, // Default memory usage
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
            type: true,
          },
        },
      },
    })

    // If this submission is accepted, complete the match (API fallback path)
    if (submission.status === 'accepted') {
      try {
        // Complete match and determine ELO for 1v1
        const matchWithParticipants = await prisma.match.update({
          where: { id: matchId },
          data: {
            status: 'completed',
            winnerId: userId,
            endedAt: new Date(),
          },
          include: {
            type: true,
            participants: {
              include: { user: true },
            },
          } as any,
        }) as any

        let eloResults: EloResult[] | null = null
        if (matchWithParticipants.type === '1v1' && matchWithParticipants.participants?.length === 2) {
          const winner = matchWithParticipants.participants.find((p: any) => p.userId === userId)
          const loser = matchWithParticipants.participants.find((p: any) => p.userId !== userId)
          if (winner && loser) {
            const [winnerElo, loserElo] = calculateBattleElo({
              winnerId: winner.userId,
              winnerRating: winner.user.elo,
              loserId: loser.userId,
              loserRating: loser.user.elo,
            })
            eloResults = [winnerElo, loserElo]

            // Persist ELO changes and win/loss
            await prisma.user.update({
              where: { id: winner.userId },
              data: { elo: winnerElo.newRating, wins: { increment: 1 } },
            })
            await prisma.user.update({
              where: { id: loser.userId },
              data: { elo: loserElo.newRating, losses: { increment: 1 } },
            })
          }
        }

        // Notify room via Socket.IO if available (so connected clients redirect)
        const io = battleSocket.getIO()
        if (io) {
          const winnerUsername = submission.user.username
          io.to(matchId).emit('battle_completed', {
            winnerId: userId,
            winnerUsername,
            eloChanges: eloResults || undefined,
          })
        }
      } catch (e) {
        console.error('Failed to complete match on accepted submission:', e)
      }
    }

    return NextResponse.json({
      submission,
      executionResults: results,
    })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
