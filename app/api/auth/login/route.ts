import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // TODO: Add proper password hashing and verification
    // For now, we'll just check if user exists
    // In production, use bcrypt or similar

    // Return user data (without sensitive info)
    const { id, username, email: userEmail, elo, wins, losses, bio } = user

    return NextResponse.json({
      user: {
        id,
        username,
        email: userEmail,
        elo,
        wins,
        losses,
        bio,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
