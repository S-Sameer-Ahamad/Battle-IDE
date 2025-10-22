import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { hashPassword, validatePasswordStrength, generateToken as generateRandomToken } from '@/lib/password'
import { generateToken as generateJWT } from '@/lib/jwt'
import { setAuthCookie, validateEmail, validateUsername, sanitizeUser } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password } = registerSchema.parse(body)

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate username
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid username', details: usernameValidation.errors },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Weak password', details: passwordValidation.errors },
        { status: 400 }
      )
    }

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

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate email verification token
    const verificationToken = generateRandomToken()
    const verificationTokenExpires = new Date()
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24) // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires,
      },
    })

    // Send verification email
    await sendVerificationEmail(user.email, user.username, verificationToken)

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: sanitizeUser(user),
    }, { status: 201 })

    // Set auth cookie
    setAuthCookie(response, token)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
