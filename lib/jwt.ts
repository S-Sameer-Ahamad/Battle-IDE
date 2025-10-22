import crypto from 'crypto';

/**
 * JWT (JSON Web Token) implementation using Node.js crypto
 * This is a simple, dependency-free JWT implementation
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRATION = '7d'; // 7 days

interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

/**
 * Base64 URL encoding (for JWT)
 */
function base64URLEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL decoding (for JWT)
 */
function base64URLDecode(str: string): string {
  // Add padding if needed
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString();
}

/**
 * Create HMAC signature for JWT
 */
function createSignature(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Parse expiration time string to milliseconds
 */
function parseExpirationTime(expiration: string): number {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiration format. Use format like: 1d, 7d, 24h, 60m');
  }
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  return value * units[unit];
}

/**
 * Generate a JWT token
 * @param payload - Data to encode in the token
 * @param expiresIn - Expiration time (e.g., '7d', '24h', '60m')
 * @returns string - JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = JWT_EXPIRATION): string {
  const header = {
    alg: JWT_ALGORITHM,
    typ: 'JWT',
  };
  
  const now = Math.floor(Date.now() / 1000);
  const expirationMs = parseExpirationTime(expiresIn);
  const exp = now + Math.floor(expirationMs / 1000);
  
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: exp,
  };
  
  // Encode header and payload
  const encodedHeader = base64URLEncode(JSON.stringify(header));
  const encodedPayload = base64URLEncode(JSON.stringify(fullPayload));
  
  // Create signature
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
  
  // Return complete JWT
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns JWTPayload | null - Decoded payload if valid, null otherwise
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payload: JWTPayload = JSON.parse(base64URLDecode(encodedPayload));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 * @param token - JWT token to decode
 * @returns JWTPayload | null - Decoded payload if valid format, null otherwise
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const payload: JWTPayload = JSON.parse(base64URLDecode(parts[1]));
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - JWT token to check
 * @returns boolean - True if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  
  if (!payload || !payload.exp) {
    return true;
  }
  
  return payload.exp < Math.floor(Date.now() / 1000);
}

/**
 * Get time until token expires (in seconds)
 * @param token - JWT token to check
 * @returns number | null - Seconds until expiration, null if invalid or expired
 */
export function getTokenExpiration(token: string): number | null {
  const payload = decodeToken(token);
  
  if (!payload || !payload.exp) {
    return null;
  }
  
  const secondsUntilExpiration = payload.exp - Math.floor(Date.now() / 1000);
  return secondsUntilExpiration > 0 ? secondsUntilExpiration : null;
}
