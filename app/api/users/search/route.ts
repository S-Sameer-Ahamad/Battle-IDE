import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    const excludeUserId = searchParams.get('exclude') // Exclude current user from results

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ users: [] })
    }

    // Search users by username (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
        },
        ...(excludeUserId && {
          id: {
            not: excludeUserId,
          },
        }),
      },
      select: {
        id: true,
        username: true,
        elo: true,
        createdAt: true,
      },
      take: limit,
      orderBy: {
        elo: 'desc', // Order by ELO (highest first)
      },
    })

    // For now, we'll mark all users as online: false
    // Later this can be enhanced with real-time presence tracking via Socket.IO
    const usersWithStatus = users.map((user: any) => ({
      id: user.id,
      username: user.username,
      elo: user.elo,
      isOnline: false, // TODO: Implement real-time presence tracking
    }))

    return NextResponse.json({ users: usersWithStatus })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
}
