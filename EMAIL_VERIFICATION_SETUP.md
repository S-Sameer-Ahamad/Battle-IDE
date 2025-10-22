# Email Verification & Password Reset Setup

This document explains the email verification and password reset system that has been implemented in Battle-IDE.

## Overview

The authentication system now includes:
1. ✅ Email verification for new user registrations
2. ✅ Password reset functionality
3. ✅ Google OAuth integration
4. ✅ Secure token-based verification

## Environment Variables

Add these to your `.env` file:

```env
# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Google OAuth
GOOGLE_CLIENT_ID="1095050078785-mpp7bkmt80tm4clameuko7epg1tgkrp0.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

⚠️ **Important:** You need to add your Google OAuth Client Secret to the `.env` file.

## Database Schema

The User model now includes:

```prisma
model User {
  // Email verification
  emailVerified Boolean  @default(false)
  verificationToken String?
  verificationTokenExpires DateTime?
  
  // Password reset
  resetToken String?
  resetTokenExpires DateTime?
  
  // OAuth
  googleId  String?  @unique
  avatarUrl String?
  password  String?  // Optional for OAuth users
}
```

## API Endpoints

### Email Verification

**1. Verify Email**
- Endpoint: `POST /api/auth/verify-email`
- Body: `{ "token": "verification_token" }`
- Action: Marks email as verified, sends welcome email

**2. Resend Verification Email**
- Endpoint: `POST /api/auth/resend-verification`
- Body: `{ "email": "user@example.com" }`
- Action: Generates new token, sends verification email

### Password Reset

**3. Request Password Reset**
- Endpoint: `POST /api/auth/forgot-password`
- Body: `{ "email": "user@example.com" }`
- Action: Generates reset token, sends reset email

**4. Reset Password**
- Endpoint: `POST /api/auth/reset-password`
- Body: `{ "token": "reset_token", "password": "new_password" }`
- Action: Verifies token, updates password

### Google OAuth

**5. Initiate Google OAuth**
- Endpoint: `GET /api/auth/google`
- Action: Redirects to Google OAuth consent screen

**6. Google OAuth Callback**
- Endpoint: `GET /api/auth/google/callback?code=...`
- Action: Exchanges code for tokens, creates/updates user, logs in

## User Registration Flow

1. User submits registration form
2. System creates user with:
   - Hashed password (PBKDF2)
   - Verification token (32-byte random)
   - Token expiration (24 hours)
   - `emailVerified = false`
3. Verification email sent with link:
   ```
   http://localhost:3000/auth/verify-email?token={token}
   ```
4. User clicks link → Frontend calls `/api/auth/verify-email`
5. System verifies token → Updates `emailVerified = true`
6. Welcome email sent

## Password Reset Flow

1. User clicks "Forgot Password?"
2. Enters email → Frontend calls `/api/auth/forgot-password`
3. System generates reset token (1 hour expiration)
4. Reset email sent with link:
   ```
   http://localhost:3000/auth/reset-password?token={token}
   ```
5. User clicks link → Frontend shows reset password form
6. User submits new password → Frontend calls `/api/auth/reset-password`
7. System verifies token → Updates password → Clears reset token

## Google OAuth Flow

1. User clicks "Continue with Google" button
2. Browser redirects to `/api/auth/google`
3. Server redirects to Google OAuth consent screen
4. User grants permission → Google redirects to callback URL
5. Server exchanges authorization code for access token
6. Server fetches user profile from Google
7. System creates new user OR links to existing account
8. User is logged in and redirected to dashboard

## Email Service

Currently using **console logging** for development:

```typescript
// lib/email.ts
export async function sendVerificationEmail(email: string, username: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
  
  console.log(`
=== VERIFICATION EMAIL ===
To: ${email}
Subject: Verify your Battle-IDE account
Link: ${verificationUrl}
==========================
  `)
}
```

### Production Email Setup

To integrate a real email service (SendGrid/Resend/AWS SES):

1. Install email package:
   ```bash
   pnpm add @sendgrid/mail
   # or
   pnpm add resend
   ```

2. Update `lib/email.ts`:
   ```typescript
   import sgMail from '@sendgrid/mail'
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
   
   export async function sendVerificationEmail(email: string, username: string, token: string) {
     const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
     
     await sgMail.send({
       to: email,
       from: 'noreply@battle-ide.com',
       subject: 'Verify your Battle-IDE account',
       html: `<p>Hi ${username},</p><p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
     })
   }
   ```

## Security Features

1. **Token Expiration:**
   - Verification tokens: 24 hours
   - Reset tokens: 1 hour

2. **Token Format:**
   - 32-byte cryptographically secure random values
   - Hex encoded (64 characters)
   - Generated using Node.js `crypto.randomBytes()`

3. **Password Requirements:**
   - Minimum 8 characters
   - At least 1 lowercase letter
   - At least 1 uppercase letter
   - At least 1 number
   - At least 1 special character

4. **Privacy Protection:**
   - Forgot password endpoint doesn't reveal if email exists
   - Returns success message regardless

## Google OAuth Configuration

### Setup Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Go to "APIs & Services" → "Credentials"
4. Create OAuth 2.0 Client ID
5. Configure consent screen
6. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
7. For production, add:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```
8. Copy Client ID and Client Secret to `.env`

### OAuth Scopes Requested

- `userinfo.profile` - Name, profile picture
- `userinfo.email` - Email address

## Frontend Pages Needed

The following frontend pages need to be created:

### 1. Email Verification Page
**File:** `app/auth/verify-email/page.tsx`
- Get token from URL query params
- Call `/api/auth/verify-email` on mount
- Show success/error message
- Redirect to dashboard after 3 seconds

### 2. Forgot Password Page (Already exists at `app/auth/forgot-password/page.tsx`)
- Email input form
- Call `/api/auth/forgot-password`
- Show success message

### 3. Reset Password Page (Already exists at `app/auth/reset-password/page.tsx`)
- Get token from URL query params
- New password input form
- Call `/api/auth/reset-password`
- Redirect to login after success

## Testing

### Test Email Verification

1. Register a new user
2. Check console for verification link
3. Open link in browser
4. Verify email is marked as verified in database

### Test Password Reset

1. Go to `/auth/forgot-password`
2. Enter email address
3. Check console for reset link
4. Open link in browser
5. Enter new password
6. Login with new password

### Test Google OAuth

1. Set `GOOGLE_CLIENT_SECRET` in `.env`
2. Click "Continue with Google" on login/register page
3. Complete Google OAuth flow
4. Verify user is created/updated in database
5. Verify login is successful

## File Structure

```
app/
  api/
    auth/
      register/route.ts          # Updated with verification email
      verify-email/route.ts      # NEW: Verify email endpoint
      resend-verification/route.ts # NEW: Resend verification email
      forgot-password/route.ts   # NEW: Request password reset
      reset-password/route.ts    # NEW: Reset password
      google/
        route.ts                 # NEW: Initiate Google OAuth
        callback/route.ts        # NEW: Handle OAuth callback
  auth/
    verify-email/page.tsx        # TODO: Create verification page
    forgot-password/page.tsx     # Exists, may need updates
    reset-password/page.tsx      # Exists, may need updates
    login/page.tsx               # Updated with Google OAuth button
    register/page.tsx            # Updated with Google OAuth button

lib/
  email.ts                       # NEW: Email service (console logging)
  google-oauth.ts                # NEW: Google OAuth helpers
```

## Next Steps

1. ✅ API endpoints created
2. ✅ Google OAuth routes created  
3. ✅ Login/Register pages updated
4. ⏳ Create email verification page
5. ⏳ Update forgot/reset password pages
6. ⏳ Set Google Client Secret in `.env`
7. ⏳ Test all flows
8. ⏳ Integrate real email service for production

## Notes

- All tokens are stored in the database
- Tokens are automatically cleared after use
- Expired tokens are rejected
- OAuth users can skip email verification (Google already verified)
- OAuth users don't need passwords (password field is nullable)
- Users can link Google account to existing email-based account
