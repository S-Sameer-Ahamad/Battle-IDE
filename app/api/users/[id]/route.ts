import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        elo: true,
        wins: true,
        losses: true,
        createdAt: true,
        _count: {
          select: {
            matchParticipants: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch recent matches (last 10)
    const recentMatches = await prisma.matchParticipant.findMany({
      where: { userId: id },
      take: 10,
      orderBy: { joinedAt: 'desc' },
      include: {
        match: {
          include: {
            problem: {
              select: {
                id: true,
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
        },
      },
    })

    // Transform matches to include opponent info and result
    const matchHistory = recentMatches.map(mp => {
      const match = mp.match
      const opponent = match.participants.find(p => p.userId !== id)
      const isWinner = match.winnerId === id
      
      // Calculate ELO change (simplified - you can make this more accurate)
      let eloChange = 0
      if (match.winnerId === id) {
        eloChange = 15 // Won
      } else if (match.winnerId === opponent?.userId) {
        eloChange = -12 // Lost
      }

      return {
        id: match.id,
        opponent: opponent?.user.username || 'Unknown',
        opponentElo: opponent?.user.elo || 1200,
        result: match.winnerId === id ? 'Won' : match.winnerId === opponent?.userId ? 'Lost' : 'Draw',
        eloChange: eloChange > 0 ? `+${eloChange}` : `${eloChange}`,
        problem: match.problem.title,
        difficulty: match.problem.difficulty,
        time: match.createdAt,
      }
    })

    // Calculate ELO history by working backwards from current ELO
    // We'll show last 20 matches for the chart
    const eloHistoryMatches = await prisma.matchParticipant.findMany({
      where: { userId: id },
      take: 20,
      orderBy: { joinedAt: 'desc' },
      include: {
        match: {
          select: {
            id: true,
            winnerId: true,
            createdAt: true,
            participants: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    })

    // Build ELO history by calculating backwards
    const eloHistory = []
    let currentElo = user.elo

    // Reverse to go from oldest to newest
    const reversedMatches = [...eloHistoryMatches].reverse()
    
    // Calculate starting ELO (work backwards from current)
    let startingElo = currentElo
    for (const mp of eloHistoryMatches) {
      const match = mp.match
      const opponent = match.participants.find(p => p.userId !== id)
      
      if (match.winnerId === id) {
        startingElo -= 15 // Was a win, so subtract
      } else if (match.winnerId === opponent?.userId) {
        startingElo += 12 // Was a loss, so add back
      }
    }

    // Now build history going forward
    let runningElo = startingElo
    for (const mp of reversedMatches) {
      const match = mp.match
      const opponent = match.participants.find(p => p.userId !== id)
      
      eloHistory.push({
        date: match.createdAt,
        elo: runningElo,
      })

      if (match.winnerId === id) {
        runningElo += 15
      } else if (match.winnerId === opponent?.userId) {
        runningElo -= 12
      }
    }

    // Add current ELO as the latest point
    eloHistory.push({
      date: new Date(),
      elo: user.elo,
    })

    // Calculate win rate
    const totalMatches = user.wins + user.losses
    const winRate = totalMatches > 0 ? Math.round((user.wins / totalMatches) * 100) : 0

    return NextResponse.json({ 
      user: {
        ...user,
        totalMatches,
        winRate,
      },
      recentMatches: matchHistory,
      eloHistory: eloHistory,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
