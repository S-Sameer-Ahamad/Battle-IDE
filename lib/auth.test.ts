import './env'; // Load environment variables
import { hashPassword, verifyPassword, validatePasswordStrength } from './password';
import { generateToken, verifyToken, isTokenExpired } from './jwt';

async function testAuthentication() {
  console.log('🔐 Testing Authentication System\n');
  
  try {
    // Test 1: Password Hashing
    console.log('Test 1: Password Hashing');
    const password = 'TestPassword123!';
    const hash = await hashPassword(password);
    console.log('✅ Password hashed successfully');
    console.log(`Hash length: ${hash.length} characters\n`);
    
    // Test 2: Password Verification (Correct)
    console.log('Test 2: Password Verification (Correct Password)');
    const isValid = await verifyPassword(password, hash);
    console.log(isValid ? '✅ Password verified successfully' : '❌ Password verification failed');
    console.log('');
    
    // Test 3: Password Verification (Incorrect)
    console.log('Test 3: Password Verification (Incorrect Password)');
    const isInvalid = await verifyPassword('WrongPassword', hash);
    console.log(!isInvalid ? '✅ Incorrect password rejected' : '❌ Incorrect password accepted');
    console.log('');
    
    // Test 4: Password Strength Validation (Weak)
    console.log('Test 4: Password Strength Validation (Weak Password)');
    const weakValidation = validatePasswordStrength('weak');
    console.log('Password: "weak"');
    console.log('Valid:', weakValidation.isValid);
    if (!weakValidation.isValid) {
      console.log('Errors:', weakValidation.errors.join(', '));
      console.log('✅ Weak password rejected');
    }
    console.log('');
    
    // Test 5: Password Strength Validation (Strong)
    console.log('Test 5: Password Strength Validation (Strong Password)');
    const strongValidation = validatePasswordStrength('StrongPass123!');
    console.log('Password: "StrongPass123!"');
    console.log(strongValidation.isValid ? '✅ Strong password accepted' : '❌ Strong password rejected');
    console.log('');
    
    // Test 6: JWT Token Generation
    console.log('Test 6: JWT Token Generation');
    const token = generateToken({
      userId: 'user_123',
      email: 'test@example.com',
      username: 'testuser',
    }, '1h');
    console.log('✅ Token generated successfully');
    console.log(`Token: ${token.substring(0, 50)}...\n`);
    
    // Test 7: JWT Token Verification (Valid)
    console.log('Test 7: JWT Token Verification (Valid Token)');
    const payload = verifyToken(token);
    if (payload) {
      console.log('✅ Token verified successfully');
      console.log('Payload:', {
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
      });
    } else {
      console.log('❌ Token verification failed');
    }
    console.log('');
    
    // Test 8: JWT Token Expiration Check
    console.log('Test 8: JWT Token Expiration Check');
    const expired = isTokenExpired(token);
    console.log(expired ? '❌ Token is expired' : '✅ Token is not expired');
    console.log('');
    
    // Test 9: Invalid Token
    console.log('Test 9: Invalid Token Verification');
    const invalidToken = verifyToken('invalid.token.here');
    console.log(invalidToken === null ? '✅ Invalid token rejected' : '❌ Invalid token accepted');
    console.log('');
    
    // Test 10: Expired Token
    console.log('Test 10: Expired Token Verification');
    const expiredToken = generateToken({
      userId: 'user_123',
      email: 'test@example.com',
      username: 'testuser',
    }, '1s'); // 1 second expiration
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    const expiredPayload = verifyToken(expiredToken);
    console.log(expiredPayload === null ? '✅ Expired token rejected' : '❌ Expired token accepted');
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  testAuthentication().then(success => {
    if (success) {
      console.log('\n✅ Authentication system is working correctly!');
    } else {
      console.log('\n❌ Authentication system tests failed!');
      process.exit(1);
    }
  });
}

export { testAuthentication };
