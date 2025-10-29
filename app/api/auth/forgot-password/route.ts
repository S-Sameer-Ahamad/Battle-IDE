import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/password'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      // In development, log helpful info
      if (process.env.NODE_ENV !== 'production') {
        console.log(`⚠️  Password reset requested for non-existent email: ${email}`)
      }
      
      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent',
        success: true,
        // Include debug info only in development
        ...(process.env.NODE_ENV !== 'production' && {
          debug: {
            emailExists: false,
            hint: 'This email is not registered in the database'
          }
        })
      })
    }

    // Generate reset token
    const resetToken = generateToken()
    const resetTokenExpires = new Date()
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1) // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.username, resetToken)

    // In development, log success
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Password reset email sent to: ${user.email}`)
    }

    return NextResponse.json({
      message: 'Password reset email sent successfully',
      success: true,
      // Include debug info only in development
      ...(process.env.NODE_ENV !== 'production' && {
        debug: {
          emailExists: true,
          emailSent: true,
          hint: 'Check your inbox and spam folder'
        }
      })
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
