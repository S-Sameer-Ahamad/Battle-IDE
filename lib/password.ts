import crypto from 'crypto';

/**
 * Password hashing and verification utilities using Node.js crypto
 * This uses PBKDF2 (Password-Based Key Derivation Function 2) which is secure and built-in
 */

const SALT_LENGTH = 32; // 32 bytes
const HASH_LENGTH = 64; // 64 bytes
const ITERATIONS = 100000; // Number of iterations for PBKDF2
const DIGEST = 'sha512'; // Hash algorithm

/**
 * Hash a password using PBKDF2
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password in format: salt:hash
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    
    // Hash the password with the salt
    crypto.pbkdf2(password, salt, ITERATIONS, HASH_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      
      // Store salt and hash together
      const hash = derivedKey.toString('hex');
      resolve(`${salt}:${hash}`);
    });
  });
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param storedHash - Stored hash in format: salt:hash
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Split the stored hash into salt and hash
    const [salt, originalHash] = storedHash.split(':');
    
    if (!salt || !originalHash) {
      return resolve(false);
    }
    
    // Hash the provided password with the same salt
    crypto.pbkdf2(password, salt, ITERATIONS, HASH_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      
      const hash = derivedKey.toString('hex');
      // Compare the hashes using timing-safe comparison
      const originalBuffer = Buffer.from(originalHash);
      const hashBuffer = Buffer.from(hash);
      resolve(crypto.timingSafeEqual(originalBuffer as any, hashBuffer as any));
    });
  });
}

/**
 * Generate a random token (for email verification, password reset, etc.)
 * @param length - Length of the token in bytes (default: 32)
 * @returns string - Random token in hex format
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns object - Validation result with isValid and errors
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
