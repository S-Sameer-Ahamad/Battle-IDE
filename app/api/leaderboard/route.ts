import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const timePeriod = searchParams.get('timePeriod') || 'all' // all, week, month
    const userId = searchParams.get('userId') // To get user's rank

    // Build where clause for search
    const whereClause: any = {}
    
    if (search) {
      whereClause.username = {
        contains: search,
      }
    }

    // Time period filter (filter users who joined or have matches in that period)
    if (timePeriod !== 'all') {
      const now = new Date()
      let dateFilter: Date
      
      if (timePeriod === 'week') {
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (timePeriod === 'month') {
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      } else {
        dateFilter = new Date(0) // All time
      }
      
      // Only show users who have been active in the time period
      whereClause.updatedAt = {
        gte: dateFilter,
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where: whereClause })

    // Fetch users
    const users = await prisma.user.findMany({
      where: whereClause,
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
      winRate: user.wins + user.losses > 0 
        ? Math.round((user.wins / (user.wins + user.losses)) * 100) 
        : 0,
    }))

    // Get current user's rank if userId provided
    let userRank = null
    if (userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          elo: true,
          wins: true,
          losses: true,
        },
      })

      if (currentUser) {
        // Count how many users have higher ELO
        const higherRankedCount = await prisma.user.count({
          where: {
            elo: {
              gt: currentUser.elo,
            },
          },
        })

        userRank = {
          ...currentUser,
          rank: higherRankedCount + 1,
          winRate: currentUser.wins + currentUser.losses > 0 
            ? Math.round((currentUser.wins / (currentUser.wins + currentUser.losses)) * 100) 
            : 0,
        }
      }
    }

    return NextResponse.json({ 
      leaderboard,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Math.floor(offset / limit) + 1,
      userRank,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
