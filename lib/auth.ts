import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, decodeToken } from './jwt';
import { prisma } from './prisma';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

/**
 * Get authenticated user from request cookies
 * @param request - NextRequest object
 * @returns Promise<AuthUser | null> - User if authenticated, null otherwise
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const payload = verifyToken(token);
    
    if (!payload) {
      return null;
    }
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });
    
    return user;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Middleware to require authentication
 * Returns user if authenticated, sends 401 response if not
 */
export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | NextResponse> {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }
  
  return { user };
}

/**
 * Set authentication cookie
 * @param response - NextResponse object
 * @param token - JWT token
 * @param maxAge - Cookie max age in seconds (default: 7 days)
 */
export function setAuthCookie(response: NextResponse, token: string, maxAge: number = 7 * 24 * 60 * 60): void {
  response.cookies.set('auth_token', token, {
    httpOnly: true, // Prevent JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge: maxAge,
    path: '/',
  });
}

/**
 * Clear authentication cookie
 * @param response - NextResponse object
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete('auth_token');
}

/**
 * Get user from token without database lookup (faster, but less secure)
 * Use this for non-critical operations
 */
export function getUserFromToken(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  
  if (!payload) {
    return null;
  }
  
  return {
    id: payload.userId,
    email: payload.email,
    username: payload.username,
  };
}

/**
 * Check if user is authenticated (returns boolean)
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getAuthUser(request);
  return user !== null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be at most 20 characters long');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize user data for client response (remove sensitive fields)
 */
export function sanitizeUser(user: any): any {
  const { password, ...safeUser } = user;
  return safeUser;
}
