import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // TODO: Add proper password hashing
    // For now, we'll just create the user
    // In production, use bcrypt or similar

    const user = await prisma.user.create({
      data: {
        email,
        username,
        // password: hashedPassword, // Add this when implementing password hashing
      },
    })

    // Return user data (without sensitive info)
    const { id, username: userUsername, email: userEmail, elo, wins, losses, bio } = user

    return NextResponse.json({
      user: {
        id,
        username: userUsername,
        email: userEmail,
        elo,
        wins,
        losses,
        bio,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
