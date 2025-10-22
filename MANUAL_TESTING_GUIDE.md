# 🧪 Manual Testing Guide for Battle-IDE Authentication

## Prerequisites
1. **Start the development server:**
   ```bash
   cd C:\CursorIDE\Battle-IDE
   npm run dev
   ```
2. **Open your browser:** Navigate to `http://localhost:3000`

---

## ✅ Test 1: User Registration

### Steps:
1. Go to `http://localhost:3000/auth/register`
2. Fill in the form:
   - Email: `yourtest@example.com`
   - Username: `testuser123`
   - Password: `Test@123456`
3. Click **"Sign Up"**

### Expected Results:
✅ You should be redirected to `/dashboard`  
✅ Check the **server console** for verification email output:
```
📧 Email would be sent:
To: yourtest@example.com
Subject: Verify your Battle-IDE account
Body: [verification link]
```
✅ Copy the verification token from the console

### Database Check:
```bash
npx prisma studio
```
- Open `User` table
- Find your user
- Check: `emailVerified = false`
- Check: `verificationToken` exists

---

## ✅ Test 2: Email Verification

### Steps:
1. Copy the verification token from the console log
2. Use Postman, Thunder Client, or curl:
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d "{\"token\":\"YOUR_TOKEN_HERE\"}"
   ```

### Expected Results:
✅ Response: `{ "message": "Email verified successfully", "success": true }`  
✅ Console shows welcome email being sent

### Database Check:
- `emailVerified = true`
- `verificationToken = null`

---

## ✅ Test 3: Login

### Steps:
1. Go to `http://localhost:3000/auth/login`
2. Enter your credentials:
   - Email: `yourtest@example.com`
   - Password: `Test@123456`
3. Click **"Sign In"**

### Expected Results:
✅ Redirected to `/dashboard`  
✅ You should see your username in the header  
✅ Toast notification: "Login successful"

---

## ✅ Test 4: Logout

### Steps:
1. While logged in, open browser DevTools (F12)
2. Go to Console and run:
   ```javascript
   fetch('/api/auth/logout', { method: 'POST' })
     .then(r => r.json())
     .then(console.log)
   ```
   OR manually navigate to another page and check if auth cookie is cleared

### Expected Results:
✅ Response: `{ "success": true }`  
✅ Auth cookie cleared  
✅ Visiting `/dashboard` redirects to `/auth/login`

---

## ✅ Test 5: Password Reset Flow

### Steps:
1. Go to `http://localhost:3000/auth/forgot-password`
2. Enter your email: `yourtest@example.com`
3. Click **"Send Reset Link"**
4. Check **server console** for reset email
5. Copy the reset token from console
6. Use Postman or curl:
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d "{\"token\":\"YOUR_RESET_TOKEN\",\"password\":\"NewPass@2024\"}"
   ```

### Expected Results:
✅ Reset email appears in console  
✅ Password reset API returns success  
✅ Can login with new password `NewPass@2024`  
✅ Cannot login with old password

### Database Check:
- `resetToken = null`
- `resetTokenExpires = null`
- Password hash changed

---

## ✅ Test 6: Google OAuth Login

### Setup:
1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. Select your project
3. Go to **APIs & Services → Credentials**
4. Find your OAuth 2.0 Client ID:
   ```
   1095050078785-mpp7bkmt80tm4clameuko7epg1tgkrp0.apps.googleusercontent.com
   ```
5. Click **Edit**
6. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
7. Click **Save**

### Steps:
1. Go to `http://localhost:3000/auth/login`
2. Click **"Continue with Google"** button
3. Select your Google account
4. Grant permissions
5. You should be redirected back to Battle-IDE

### Expected Results:
✅ Redirected to `/dashboard` after OAuth flow  
✅ New user created in database (if first time)  
✅ User logged in automatically  
✅ Database shows `googleId` populated  
✅ `emailVerified = true` (Google already verified)

### Database Check:
- New user with `googleId` field populated
- `email` matches your Google email
- `username` generated from email (e.g., `yourname` from `yourname@gmail.com`)
- `password = null` (OAuth users don't need passwords)
- `avatarUrl` populated with Google profile picture

---

## ✅ Test 7: Duplicate Registration Prevention

### Steps:
1. Try to register again with same email
2. Try to register with same username (different email)

### Expected Results:
✅ Both should fail with appropriate error messages:
- "Email already exists"
- "Username already taken"

---

## ✅ Test 8: Password Strength Validation

### Steps:
1. Try to register with weak passwords:
   - `weak`
   - `12345678`
   - `password`
   - `NoSpecial123`
   - `nouppercas3!`

### Expected Results:
✅ All should be rejected with specific error messages

---

## ✅ Test 9: Invalid Token Handling

### Steps:
1. Try to verify email with invalid token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d "{\"token\":\"invalid_token_123\"}"
   ```

2. Try to reset password with expired/invalid token

### Expected Results:
✅ Both return: "Invalid or expired token" error

---

## ✅ Test 10: Session Persistence

### Steps:
1. Login to your account
2. Note the `auth_token` cookie (in DevTools → Application → Cookies)
3. Close browser
4. Reopen browser and go to `http://localhost:3000/dashboard`

### Expected Results:
✅ You should still be logged in  
✅ Dashboard loads without redirect to login

---

## 🔧 Debugging Tips

### Check Auth Cookie:
1. Open DevTools (F12)
2. Go to **Application** → **Cookies** → `http://localhost:3000`
3. Look for `auth_token`
4. Copy the token value
5. Decode it at [jwt.io](https://jwt.io/)

### Check Server Logs:
- All email templates are logged to console in development
- Look for verification tokens, reset tokens in console output
- Check for any error messages

### Check Database:
```bash
npx prisma studio
```
- View all users, tokens, and verification status
- Manually update fields if needed for testing

### Reset Database:
```bash
npx prisma db push --force-reset
```
⚠️ This will delete all data!

---

## 📊 Testing Checklist

- [ ] User registration works
- [ ] Verification email logged to console
- [ ] Email verification endpoint works
- [ ] Login with correct password works
- [ ] Login with wrong password fails
- [ ] Logout clears session
- [ ] Forgot password generates reset token
- [ ] Password reset works
- [ ] Can login with new password
- [ ] Old password no longer works
- [ ] Google OAuth button redirects to Google
- [ ] OAuth callback creates/updates user
- [ ] OAuth users logged in automatically
- [ ] Duplicate email rejected
- [ ] Duplicate username rejected
- [ ] Weak passwords rejected
- [ ] Invalid tokens rejected
- [ ] Session persists across browser restarts

---

## 🎯 Next Steps After Testing

Once all authentication tests pass:

1. **Create frontend pages:**
   - Email verification page (`app/auth/verify-email/page.tsx`)
   - Update forgot password page
   - Update reset password page

2. **Integrate real email service:**
   - Setup SendGrid or Resend
   - Update `lib/email.ts`
   - Test in production

3. **Move to core features:**
   - Real-time battle system
   - Matchmaking
   - Leaderboard
   - Problem management

---

## ❓ Common Issues

### Server won't start:
```bash
# Kill any process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Restart
npm run dev
```

### Prisma Client out of sync:
```bash
npx prisma generate
```

### Database locked:
```bash
# Close Prisma Studio
# Then:
npx prisma db push
```

### Google OAuth not working:
1. Check redirect URI is exactly: `http://localhost:3000/api/auth/google/callback`
2. Check client secret in `.env` is correct
3. Check OAuth consent screen is configured
4. Try in incognito mode

---

**Happy Testing! 🚀**
