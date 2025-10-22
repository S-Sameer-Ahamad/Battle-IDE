import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/google-oauth'

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 */
export async function GET(request: NextRequest) {
  try {
    const authUrl = getGoogleAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    )
  }
}
