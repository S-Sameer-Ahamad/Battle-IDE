import { NextRequest, NextResponse } from 'next/server'
import { getGoogleTokens, getGoogleUser } from '@/lib/google-oauth'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/jwt'
import { setAuthCookie } from '@/lib/auth'

/**
 * Handle Google OAuth callback
 * GET /api/auth/google/callback?code=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      return NextResponse.redirect(
        `${appUrl}/auth/login?error=oauth_cancelled`
      )
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    // Exchange code for tokens
    const tokens = await getGoogleTokens(code)
    
    // Get user profile
    const googleUser = await getGoogleUser(tokens.access_token)

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    })

    // If no user with googleId, check if email exists
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      })

      if (user) {
        // Link existing account with Google
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            emailVerified: googleUser.verified_email,
            avatarUrl: googleUser.picture,
          },
        })
      } else {
        // Create new user
        // Generate unique username from email
        let username = googleUser.email.split('@')[0]
        
        // Check if username exists and make it unique
        let usernameExists = await prisma.user.findUnique({
          where: { username },
        })
        
        let counter = 1
        while (usernameExists) {
          username = `${googleUser.email.split('@')[0]}${counter}`
          usernameExists = await prisma.user.findUnique({
            where: { username },
          })
          counter++
        }

        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            username,
            googleId: googleUser.id,
            emailVerified: googleUser.verified_email,
            avatarUrl: googleUser.picture,
            // Password is null for OAuth users
          },
        })
      }
    }

    // Generate JWT token
    const jwtToken = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    // Create response with redirect
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = NextResponse.redirect(`${appUrl}/dashboard`)

    // Set auth cookie
    setAuthCookie(response, jwtToken)

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(
      `${appUrl}/auth/login?error=oauth_failed`
    )
  }
}
