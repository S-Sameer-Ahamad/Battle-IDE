# Branded Email Setup for Battle-IDE

## Current Issue
Your emails are showing as coming from your personal Gmail (`shaiksameer5861@gmail.com`), which isn't professional for a platform.

## Recommended Solutions

### 🚀 Option 1: Brevo (Sendinblue) - RECOMMENDED FOR PRODUCTION

**Why Brevo?**
- ✅ Free tier: 300 emails/day (9,000/month)
- ✅ Professional branded email (no-reply@yourdomain.com)
- ✅ Better deliverability than Gmail
- ✅ Email analytics and tracking
- ✅ No credit card required for free tier

**Setup Steps:**

1. **Sign up for Brevo**
   - Go to https://www.brevo.com/
   - Sign up for a free account
   - Verify your email

2. **Get your SMTP credentials**
   - Go to Settings → SMTP & API
   - Copy your SMTP credentials:
     - Login: Your email
     - Password: SMTP key (click "Create a new SMTP key")
     - Server: smtp-relay.brevo.com
     - Port: 587

3. **Update your `.env` file:**
   ```env
   EMAIL_HOST="smtp-relay.brevo.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-brevo-email@example.com"
   EMAIL_PASSWORD="your-brevo-smtp-key"
   EMAIL_FROM="Battle-IDE <noreply@battle-ide.com>"
   ```

4. **Verify a sender email:**
   - In Brevo dashboard, go to "Senders, Domains & Dedicated IPs"
   - Add and verify your sender email
   - You can use any email you own (even Gmail for testing)

**Benefits:**
- Professional sender name and email
- Detailed delivery reports
- No Gmail daily sending limits
- Better spam score
- Easy to scale later

---

### 🎯 Option 2: Gmail with Branded Display Name - CURRENT SETUP

**What you have now:**
Your `.env` is already configured to show:
```
From: Battle-IDE <noreply@battle-ide.com>
```

But emails still send through `shaiksameer5861@gmail.com`

**Setup Steps:**

1. **Generate Gmail App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Enable 2-Step Verification (required)
   - Generate an App Password for "Mail"
   - Copy the 16-character password

2. **Update `.env` with your App Password:**
   ```env
   EMAIL_PASSWORD="your-16-char-app-password"
   ```

3. **Restart your server:**
   ```bash
   pnpm run dev
   ```

**What recipients will see:**
- **From:** Battle-IDE <noreply@battle-ide.com>
- **Reply-to:** shaiksameer5861@gmail.com (in headers)

**Limitations:**
- Gmail has sending limits (500-2000/day depending on account age)
- Some spam filters may flag it
- Not suitable for high-volume production

---

### 🏢 Option 3: Custom Domain Email (Professional)

If you buy a domain (e.g., `battle-ide.com`), you can use:

**A) Google Workspace ($6/month)**
- Professional email: admin@battle-ide.com
- Best deliverability
- Full email suite

**B) Zoho Mail (Free tier available)**
- Free for up to 5 users
- Custom domain email
- Good deliverability

**C) Your domain registrar's email**
- Most domain registrars include free email forwarding
- Can use with SMTP

---

## Quick Comparison

| Feature | Gmail + Display Name | Brevo Free | Custom Domain |
|---------|---------------------|-----------|---------------|
| **Cost** | Free | Free | $6+/month |
| **Daily Limit** | 500-2000 | 300 | Unlimited |
| **Deliverability** | Good | Excellent | Excellent |
| **Branding** | Partial | Full | Full |
| **Analytics** | No | Yes | Depends |
| **Setup Time** | 5 min | 15 min | 1-2 hours |
| **Best For** | Development | MVP/Production | Established Platform |

---

## My Recommendation

**For NOW (Development/Testing):**
Use Gmail with branded display name (already set up!)
- Just add the App Password to `.env`
- Quick to test
- No sign-ups needed

**For LAUNCH (Going Live):**
Switch to Brevo immediately
- Free tier is generous
- Professional appearance
- Better deliverability
- Takes 15 minutes to set up

**For SCALE (Established Platform):**
Get a custom domain with professional email
- Ultimate professionalism
- Full control
- Best deliverability

---

## Current Status

Your `.env` is configured with:
```env
EMAIL_FROM="Battle-IDE <noreply@battle-ide.com>"
```

This means emails will show:
- **Display Name:** Battle-IDE
- **Email:** noreply@battle-ide.com (visual only, actually sends from Gmail)

To activate:
1. Add your Gmail App Password to `EMAIL_PASSWORD` in `.env`
2. Restart server
3. Test!

Emails will look professional to recipients, even though they're sent via Gmail behind the scenes.

---

## Next Steps

**Right now:**
```bash
# 1. Get Gmail App Password from:
https://myaccount.google.com/apppasswords

# 2. Add to .env:
EMAIL_PASSWORD="abcd efgh ijkl mnop"  # (no spaces)

# 3. Restart server:
pnpm run dev

# 4. Test:
http://localhost:3000/auth/forgot-password
```

**Before launch:**
- Sign up for Brevo (free)
- Switch SMTP credentials in `.env`
- Much better deliverability!

---

## Need Help?

**Gmail App Password Issues:**
- Make sure 2-Step Verification is enabled
- Use the password WITHOUT spaces
- Generate a new one if it's not working

**Want Brevo Instead:**
- I can walk you through the Brevo setup
- Takes about 15 minutes
- Much better for production

**Questions about custom domains:**
- Need help choosing a domain?
- Want help setting up email?
- Just ask!
