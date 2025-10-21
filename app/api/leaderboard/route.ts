import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { elo: 'desc' },
      select: {
        id: true,
        username: true,
        elo: true,
        wins: true,
        losses: true,
        createdAt: true,
      },
    })

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: offset + index + 1,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
