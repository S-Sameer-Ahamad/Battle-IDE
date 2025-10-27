import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import redis from '@/lib/redis'

const findMatchSchema = z.object({
  userId: z.string(),
  preferredDifficulty: z.enum(['Easy', 'Medium', 'Hard']),
})

const DIFFICULTIES: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard']
const QUEUE_KEY = (difficulty: string) => `matchmaking:queue:${difficulty}`
const USER_KEY = (userId: string) => `matchmaking:user:${userId}`
const NOTIF_KEY = (userId: string) => `matchmaking:notification:${userId}`

// TTLs
const NOTIF_TTL_SECONDS = 120 // 2 minutes
const QUEUE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferredDifficulty } = findMatchSchema.parse(body)

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, elo: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If there's a pending notification in Redis, return it and delete
    const existingNotif = await redis.get(NOTIF_KEY(userId))
    if (existingNotif) {
      await redis.del(NOTIF_KEY(userId))
      return NextResponse.json(JSON.parse(existingNotif))
    }

    const queueKey = QUEUE_KEY(preferredDifficulty)

    // Check if user is already queued
    const isMember = await redis.zscore(queueKey, userId)
    if (isMember !== null) {
      return NextResponse.json({ status: 'searching', message: 'Already in queue' })
    }

    // Fetch all queued userIds in this difficulty
    const queuedIds: string[] = await redis.zrange(queueKey, 0, -1)

    // Try to find best opponent within ±200 ELO
    let opponent: { id: string; username?: string; elo?: number } | null = null
    let bestMatchId: string | null = null
    let smallestEloDiff = Infinity

    for (const id of queuedIds) {
      if (id === user.id) continue
      const data = await redis.get(USER_KEY(id))
      if (!data) continue
      let queued
      try {
        queued = JSON.parse(data)
      } catch (e) {
        continue
      }

      const eloDiff = Math.abs((user.elo || 1500) - (queued.elo || 1500))
      if (eloDiff <= 200 && eloDiff < smallestEloDiff) {
        // Confirm opponent still exists in DB (username/elo may be stale)
        const potentialOpponent = await prisma.user.findUnique({
          where: { id },
          select: { id: true, username: true, elo: true },
        })
        if (potentialOpponent) {
          opponent = potentialOpponent
          bestMatchId = id
          smallestEloDiff = eloDiff
        }
      }
    }

    // If we found an opponent, remove them from the queue and create match
    if (opponent && bestMatchId) {
      await redis.zrem(queueKey, bestMatchId)
      // Also remove stored user data for matched opponent and the current user if present
      await redis.del(USER_KEY(bestMatchId))

      // Choose problem (prefer chosen difficulty)
      let problems = await prisma.problem.findMany({ where: { difficulty: preferredDifficulty } })
      if (problems.length === 0) {
        const fallbackOrder: Array<'Easy' | 'Medium' | 'Hard'> =
          preferredDifficulty === 'Easy' ? ['Medium', 'Hard'] :
          preferredDifficulty === 'Hard' ? ['Medium', 'Easy'] : ['Easy', 'Hard']
        for (const level of fallbackOrder) {
          const alt = await prisma.problem.findMany({ where: { difficulty: level } })
          if (alt.length > 0) {
            problems = alt
            break
          }
        }
        if (problems.length === 0) {
          return NextResponse.json({ error: 'No problems available in the database' }, { status: 404 })
        }
      }

      const randomProblem = problems[Math.floor(Math.random() * problems.length)]

      const minutesByDifficulty: Record<'Easy' | 'Medium' | 'Hard', number> = {
        Easy: 10,
        Medium: 20,
        Hard: 30,
      }
      const chosenDifficulty = (preferredDifficulty && problems.some(p => p.difficulty === preferredDifficulty)
        ? preferredDifficulty
        : (randomProblem.difficulty as 'Easy' | 'Medium' | 'Hard'))
      const timeLimitMinutes = minutesByDifficulty[chosenDifficulty]

      const match = await prisma.match.create({
        data: {
          problemId: randomProblem.id,
          type: '1v1',
          status: 'active',
          timeLimit: timeLimitMinutes,
          startedAt: new Date(),
          participants: {
            create: [
              { userId: user.id, isHost: true },
              { userId: opponent.id, isHost: false },
            ],
          },
        },
        include: {
          problem: true,
          participants: {
            include: {
              user: {
                select: { id: true, username: true, elo: true },
              },
            },
          },
        },
      })

      // Notify opponent via Redis key with TTL so their next poll returns the match
      const notifPayload = {
        status: 'matched',
        match,
        opponent: {
          id: user.id,
          username: user.username,
          elo: user.elo,
        },
        difficulty: chosenDifficulty,
      }
      await redis.set(NOTIF_KEY(opponent.id), JSON.stringify(notifPayload), 'EX', NOTIF_TTL_SECONDS)

      return NextResponse.json({
        status: 'matched',
        match,
        opponent: {
          id: opponent.id,
          username: opponent.username,
          elo: opponent.elo,
        },
        difficulty: chosenDifficulty,
      })
    }

    // No opponent found: add current user to queue
    const now = Date.now()
    const userPayload = { userId: user.id, elo: user.elo || 1500, joinedAt: new Date(now).toISOString() }
    await redis.set(USER_KEY(user.id), JSON.stringify(userPayload))
    await redis.zadd(queueKey, now.toString(), user.id)

    // Clean up old queue entries across difficulties
    const cutoff = Date.now() - QUEUE_EXPIRY_MS
    for (const level of DIFFICULTIES) {
      const key = QUEUE_KEY(level)
      // find old members by score
      const oldIds: string[] = await redis.zrangebyscore(key, '-inf', `${cutoff}`)
      if (oldIds.length > 0) {
        for (const id of oldIds) {
          await redis.zrem(key, id)
          await redis.del(USER_KEY(id))
        }
      }
    }

    // Return searching status with queue size
    const queueSize = await redis.zcard(queueKey)
    return NextResponse.json({ status: 'searching', message: 'Added to matchmaking queue', queueSize })
  } catch (error) {
    console.error('Error in matchmaking:', error)
    return NextResponse.json({ error: 'Failed to find match' }, { status: 500 })
  }
}

// Cancel matchmaking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    for (const level of DIFFICULTIES) {
      await redis.zrem(QUEUE_KEY(level), userId)
    }
    await redis.del(USER_KEY(userId))
    await redis.del(NOTIF_KEY(userId))

    return NextResponse.json({ message: 'Removed from queue' })
  } catch (error) {
    console.error('Error canceling matchmaking:', error)
    return NextResponse.json({ error: 'Failed to cancel matchmaking' }, { status: 500 })
  }
}

// Get queue status
export async function GET() {
  try {
    const result: Record<string, any> = {}
    for (const level of DIFFICULTIES) {
      const key = QUEUE_KEY(level)
      const size = await redis.zcard(key)
      const ids: string[] = await redis.zrange(key, 0, -1)
      const users: Array<{ userId: string; elo?: number; waitingTime: number }> = []
      for (const id of ids) {
        const data = await redis.get(USER_KEY(id))
        if (!data) continue
        try {
          const parsed = JSON.parse(data)
          const waitingTime = Math.floor((Date.now() - new Date(parsed.joinedAt).getTime()) / 1000)
          users.push({ userId: parsed.userId, elo: parsed.elo, waitingTime })
        } catch (e) {
          // ignore malformed
        }
      }
      result[level] = { size, users }
    }
    return NextResponse.json({ queues: result })
  } catch (error) {
    console.error('Error fetching queues:', error)
    return NextResponse.json({ error: 'Failed to fetch queues' }, { status: 500 })
  }
}
