/**
 * Authentication Integration Test Suite
 * Tests the complete authentication flow via HTTP endpoints
 * 
 * Run with: npx tsx lib/auth-integration.test.ts
 */

import { prisma } from './prisma'

const BASE_URL = 'http://localhost:3000'
const API_URL = `${BASE_URL}/api`

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function makeRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  return response
}

async function runIntegrationTests() {
  log('cyan', '\n╔═══════════════════════════════════════════════════════════╗')
  log('cyan', '║     🧪 AUTHENTICATION INTEGRATION TEST SUITE 🧪          ║')
  log('cyan', '╚═══════════════════════════════════════════════════════════╝\n')

  const timestamp = Date.now().toString().slice(-8) // Last 8 digits
  const testUser = {
    email: `test${timestamp}@battleide.com`,
    username: `user${timestamp}`,
    password: 'SecurePass@2024',
  }

  let passed = 0
  let failed = 0
  let verificationToken = ''
  let resetToken = ''

  // Test 1: User Registration
  log('blue', '📝 Test 1: User Registration')
  try {
    const response = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser),
    })

    const data = await response.json()

    if (!response.ok) {
      // Show detailed error for debugging
      const errorDetails = data.details ? `\n   Details: ${JSON.stringify(data.details)}` : ''
      throw new Error(`${data.error || 'Registration failed'}${errorDetails}`)
    }

    if (!data.success || !data.user) {
      throw new Error('Missing success flag or user data in response')
    }

    log('green', `✅ User registered successfully`)
    log('green', `   Email: ${testUser.email}`)
    log('green', `   Username: ${testUser.username}`)
    passed++
  } catch (error) {
    log('red', `❌ Registration failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 2: Check Verification Token
  log('blue', '🔑 Test 2: Verification Token Generation')
  try {
    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    })

    if (!user) throw new Error('User not found in database')
    if (!user.verificationToken) throw new Error('Verification token not generated')
    if (user.emailVerified) throw new Error('Email should not be verified yet')

    verificationToken = user.verificationToken
    log('green', `✅ Verification token generated`)
    log('green', `   Token: ${verificationToken.substring(0, 32)}...`)
    passed++
  } catch (error) {
    log('red', `❌ Verification token check failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 3: Email Verification
  log('blue', '✉️  Test 3: Email Verification')
  try {
    const response = await makeRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token: verificationToken }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Verification failed')
    }

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    })

    if (!user?.emailVerified) throw new Error('Email not marked as verified')
    if (user.verificationToken) throw new Error('Verification token should be cleared')

    log('green', `✅ Email verified successfully`)
    passed++
  } catch (error) {
    log('red', `❌ Email verification failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 4: Login
  log('blue', '🔐 Test 4: User Login')
  try {
    const response = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    if (!data.success || !data.user) {
      throw new Error('Missing success flag or user data in response')
    }

    log('green', `✅ Login successful`)
    log('green', `   User ID: ${data.user.id}`)
    passed++
  } catch (error) {
    log('red', `❌ Login failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 5: Wrong Password
  log('blue', '🚫 Test 5: Login with Wrong Password')
  try {
    const response = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword123!',
      }),
    })

    if (response.ok) {
      throw new Error('Should not allow login with wrong password')
    }

    log('green', `✅ Correctly rejected wrong password`)
    passed++
  } catch (error) {
    log('red', `❌ Wrong password test failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 6: Forgot Password
  log('blue', '🔑 Test 6: Forgot Password Request')
  try {
    const response = await makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: testUser.email }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Forgot password failed')
    }

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    })

    if (!user?.resetToken) throw new Error('Reset token not generated')
    if (!user.resetTokenExpires) throw new Error('Reset token expiry not set')

    resetToken = user.resetToken
    log('green', `✅ Password reset token generated`)
    log('green', `   Token: ${resetToken.substring(0, 32)}...`)
    passed++
  } catch (error) {
    log('red', `❌ Forgot password failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 7: Reset Password
  log('blue', '🔒 Test 7: Reset Password')
  const newPassword = 'NewSecurePass@2024'
  try {
    const response = await makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: resetToken,
        password: newPassword,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Password reset failed')
    }

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    })

    if (user?.resetToken) throw new Error('Reset token should be cleared')
    if (user?.resetTokenExpires) throw new Error('Reset token expiry should be cleared')

    log('green', `✅ Password reset successfully`)
    passed++
  } catch (error) {
    log('red', `❌ Password reset failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 8: Login with New Password
  log('blue', '🔓 Test 8: Login with New Password')
  try {
    const response = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: newPassword,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login with new password failed')
    }

    log('green', `✅ Login with new password successful`)
    passed++
  } catch (error) {
    log('red', `❌ Login with new password failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 9: Login with Old Password (Should Fail)
  log('blue', '🚫 Test 9: Login with Old Password (Should Fail)')
  try {
    const response = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    })

    if (response.ok) {
      throw new Error('Should not allow login with old password')
    }

    log('green', `✅ Correctly rejected old password`)
    passed++
  } catch (error) {
    log('red', `❌ Old password rejection failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Test 10: Duplicate Registration
  log('blue', '🚫 Test 10: Duplicate Email Registration')
  try {
    const response = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        username: `different${Date.now()}`,
        password: testUser.password,
      }),
    })

    if (response.ok) {
      throw new Error('Should not allow duplicate email')
    }

    log('green', `✅ Correctly rejected duplicate email`)
    passed++
  } catch (error) {
    log('red', `❌ Duplicate email test failed: ${error instanceof Error ? error.message : error}`)
    failed++
  }
  console.log('')

  // Cleanup
  log('yellow', '🧹 Cleaning up test data...')
  try {
    const userExists = await prisma.user.findUnique({
      where: { email: testUser.email },
    })
    
    if (userExists) {
      await prisma.user.delete({
        where: { email: testUser.email },
      })
      log('green', '✅ Test user deleted\n')
    } else {
      log('yellow', '⚠️  No test user to cleanup\n')
    }
  } catch (error) {
    log('red', `⚠️  Failed to cleanup test user: ${error instanceof Error ? error.message : error}\n`)
  }

  // Summary
  const total = passed + failed
  const successRate = ((passed / total) * 100).toFixed(1)

  log('cyan', '╔═══════════════════════════════════════════════════════════╗')
  log('cyan', '║                    📊 TEST SUMMARY                        ║')
  log('cyan', '╚═══════════════════════════════════════════════════════════╝')
  console.log('')
  log('green', `✅ Passed: ${passed}/${total}`)
  log('red', `❌ Failed: ${failed}/${total}`)
  log('cyan', `📈 Success Rate: ${successRate}%`)
  console.log('')

  if (failed === 0) {
    log('green', '🎉 ALL TESTS PASSED! Authentication system is working perfectly!\n')
  } else {
    log('yellow', '⚠️  Some tests failed. Please review the errors above.\n')
  }

  // Google OAuth Info
  log('cyan', '╔═══════════════════════════════════════════════════════════╗')
  log('cyan', '║              🔗 GOOGLE OAUTH MANUAL TEST                 ║')
  log('cyan', '╚═══════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('1. Ensure redirect URI is configured in Google Cloud Console:')
  log('yellow', '   http://localhost:3000/api/auth/google/callback')
  console.log('')
  console.log('2. Visit: http://localhost:3000/auth/login')
  console.log('')
  console.log('3. Click "Continue with Google"')
  console.log('')
  console.log('4. Complete the OAuth flow')
  console.log('')
  console.log('5. You should be redirected to /dashboard')
  console.log('')
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL)
    return response.ok
  } catch {
    return false
  }
}

// Main
async function main() {
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    log('red', '\n❌ Development server is not running!')
    log('yellow', '\nPlease start the server first:')
    log('cyan', '   npm run dev\n')
    process.exit(1)
  }

  await runIntegrationTests()
  process.exit(0)
}

main().catch((error) => {
  log('red', `\n💥 Fatal error: ${error instanceof Error ? error.message : error}\n`)
  process.exit(1)
})
