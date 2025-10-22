import './env' // Auto-load environment variables

export interface GoogleUser {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl(): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  
  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
  }

  const qs = new URLSearchParams(options)
  return `${rootUrl}?${qs.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function getGoogleTokens(code: string): Promise<{
  access_token: string
  expires_in: number
  refresh_token?: string
  scope: string
  token_type: string
  id_token: string
}> {
  const url = 'https://oauth2.googleapis.com/token'
  
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
    grant_type: 'authorization_code',
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Google OAuth tokens')
  }

  return response.json()
}

/**
 * Get Google user profile
 */
export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
  const url = 'https://www.googleapis.com/oauth2/v2/userinfo'
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Google user profile')
  }

  return response.json()
}
