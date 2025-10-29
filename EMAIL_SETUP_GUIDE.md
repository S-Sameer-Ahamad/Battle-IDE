# Email Setup Guide for Battle-IDE

## Gmail SMTP Configuration

Your Battle-IDE platform is now configured to send actual emails for password resets and email verification using Gmail SMTP.

### Step 1: Enable 2-Step Verification on Your Google Account

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click on **2-Step Verification**
3. Follow the prompts to enable 2-Step Verification (required for App Passwords)

### Step 2: Generate a Gmail App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - **Important:** You must have 2-Step Verification enabled first
2. Click on "Select app" → Choose "Mail"
3. Click on "Select device" → Choose "Other (Custom name)"
4. Enter a name like "Battle-IDE" or "Password Reset"
5. Click **Generate**
6. Google will show you a 16-character password (e.g., `abcd efgh ijkl mnop`)
7. **Copy this password immediately** - you won't be able to see it again

### Step 3: Add App Password to .env File

1. Open your `.env` file in Battle-IDE
2. Find the `EMAIL_PASSWORD` line
3. Paste the 16-character App Password (remove spaces):
   ```
   EMAIL_PASSWORD="abcdefghijklmnop"
   ```
4. Save the file

### Step 4: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm run dev
```

### Step 5: Test Email Sending

1. Go to http://localhost:3000/auth/forgot-password
2. Enter your email address: `shaiksameer5861@gmail.com`
3. Click "Send Reset Link"
4. Check your email inbox (and spam folder) for the password reset email

## Current Configuration

Your `.env` file should have these settings:

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="shaiksameer5861@gmail.com"
EMAIL_PASSWORD="your-16-char-app-password-here"
EMAIL_FROM="shaiksameer5861@gmail.com"
```

## Troubleshooting

### Issue: "Username and Password not accepted"
- **Solution:** Make sure you're using an App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled on your Google Account

### Issue: "Connection timeout"
- **Solution:** Check your internet connection
- Try port 465 with secure: true (update EMAIL_PORT in .env)

### Issue: Emails going to spam
- **Solution:** This is normal for localhost development
- In production with a proper domain, configure SPF, DKIM, and DMARC records

### Issue: Still seeing console logs instead of sending
- **Solution:** Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env
- Restart your development server after changing .env

## Email Templates

Your platform sends these types of emails:

1. **Password Reset** (`/auth/forgot-password`)
   - Contains a secure one-time link
   - Expires in 1 hour

2. **Email Verification** (`/auth/register`)
   - Sent when new users register
   - Expires in 24 hours

3. **Welcome Email** (after verification)
   - Sent automatically when email is verified

## Security Best Practices

✅ **DO:**
- Use App Passwords for Gmail
- Keep your App Password secret
- Add `.env` to `.gitignore` (already done)
- Use environment variables in production

❌ **DON'T:**
- Never commit `.env` file to Git
- Don't share your App Password
- Don't use your regular Gmail password

## Production Deployment

For production, consider using:
- **SendGrid** - Reliable, free tier available
- **AWS SES** - Cost-effective for high volume
- **Resend** - Modern, developer-friendly
- **Postmark** - Great for transactional emails

The current Nodemailer setup will work in production too, but dedicated email services offer better deliverability and analytics.

## Need Help?

If you encounter issues:
1. Check the server console for error messages
2. Verify your App Password is correct (no spaces)
3. Make sure 2-Step Verification is enabled
4. Try regenerating a new App Password

---

**Ready to test!** Once you've added your App Password, restart the server and test the forgot password feature.
