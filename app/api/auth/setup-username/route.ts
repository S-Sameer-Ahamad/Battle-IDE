import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { verifyToken } from '@/lib/jwt'

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
})

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { username } = usernameSchema.parse(body)

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser && existingUser.id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Update user's username and clear the needsUsernameSetup flag
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        username,
        needsUsernameSetup: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        elo: true,
        wins: true,
        losses: true,
        avatarUrl: true,
        emailVerified: true,
        needsUsernameSetup: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Username updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Setup username error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred while updating username' },
      { status: 500 }
    )
  }
}
