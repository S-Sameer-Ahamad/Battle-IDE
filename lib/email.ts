/**
 * Email service for sending verification and password reset emails
 * Uses Nodemailer with Gmail SMTP
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = 'Battle-IDE';

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

// Create transporter for sending emails
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && EMAIL_USER && EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Send an email using Nodemailer
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailer = getTransporter();
    
    // If email is not configured, log to console (fallback for development)
    if (!mailer) {
      console.log('\n⚠️ Email not configured. Set EMAIL_USER and EMAIL_PASSWORD in .env');
      console.log('📧 Email would be sent:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body:\n', options.text || options.html);
      console.log('---\n');
      return true;
    }
    
    // Send email
    const info = await mailer.sendMail({
      from: `"${APP_NAME}" <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  token: string
): Promise<boolean> {
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00FFFF, #FF007F); padding: 20px; text-align: center; }
          .header h1 { color: #0A0A0F; margin: 0; }
          .content { background: #f4f4f4; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #00FFFF, #FF007F); color: #0A0A0F; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${APP_NAME}</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${username}!</h2>
            <p>Thank you for joining ${APP_NAME}. To complete your registration, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with ${APP_NAME}, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Welcome to ${APP_NAME}, ${username}!

To complete your registration, please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with ${APP_NAME}, you can safely ignore this email.
  `;
  
  return sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            background-color: #000000;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #000000;
          }
          .header {
            background: linear-gradient(135deg, #00FFFF 0%, #FF007F 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .logo-container {
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50px;
            padding: 12px 30px;
          }
          .logo-text {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 4px;
            color: #FFFFFF;
            margin: 0;
            text-transform: uppercase;
          }
          .logo-separator {
            display: inline-block;
            width: 3px;
            height: 24px;
            background: #FFFFFF;
            margin: 0 12px;
            vertical-align: middle;
          }
          .tagline {
            color: #FFFFFF;
            font-size: 14px;
            margin: 15px 0 0 0;
            opacity: 0.9;
            letter-spacing: 2px;
          }
          .content {
            background: #0A0A0F;
            padding: 40px 30px;
            border-left: 1px solid rgba(0, 255, 255, 0.1);
            border-right: 1px solid rgba(0, 255, 255, 0.1);
          }
          .greeting {
            color: #FFFFFF;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 20px 0;
          }
          .text {
            color: #A0A0A0;
            font-size: 16px;
            margin: 15px 0;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .reset-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #00FFFF, #FF007F);
            color: #0A0A0F;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
          }
          .link-text {
            color: #00FFFF;
            word-break: break-all;
            font-size: 13px;
            margin: 20px 0;
          }
          .warning-box {
            background: rgba(255, 193, 7, 0.1);
            border-left: 4px solid #FFC107;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .warning-title {
            color: #FFC107;
            font-weight: 600;
            font-size: 14px;
            margin: 0 0 8px 0;
          }
          .warning-text {
            color: #D0D0D0;
            font-size: 14px;
            margin: 0;
          }
          .footer {
            background: #000000;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid rgba(0, 255, 255, 0.1);
          }
          .footer-text {
            color: #666666;
            font-size: 12px;
            margin: 5px 0;
          }
          .footer-link {
            color: #00FFFF;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <!-- Header with Logo -->
          <div class="header">
            <div class="logo-container">
              <h1 class="logo-text">
                BATTLE<span class="logo-separator"></span>IDE
              </h1>
            </div>
            <p class="tagline">CODE. COMPETE. CONQUER.</p>
          </div>

          <!-- Content -->
          <div class="content">
            <h2 class="greeting">Password Reset Request</h2>
            <p class="text">Hello, <strong style="color: #FFFFFF;">${username}</strong>!</p>
            <p class="text">We received a request to reset your password for your Battle-IDE account.</p>
            <p class="text">Click the button below to create a new password:</p>

            <div class="button-container">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>

            <p class="text" style="color: #808080; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p class="link-text">${resetUrl}</p>

            <p class="text" style="margin-top: 30px;">
              <strong style="color: #FFFFFF;">This link will expire in 1 hour.</strong>
            </p>

            <div class="warning-box">
              <p class="warning-title">⚠️ Security Notice</p>
              <p class="warning-text">If you didn't request a password reset, please ignore this email and your password will remain unchanged. Your account is secure.</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">© ${new Date().getFullYear()} Battle-IDE. All rights reserved.</p>
            <p class="footer-text">
              <a href="${APP_URL}" class="footer-link">Visit Dashboard</a> • 
              <a href="${APP_URL}/support" class="footer-link">Get Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
BATTLE-IDE - CODE. COMPETE. CONQUER.

Password Reset Request

Hello, ${username}!

We received a request to reset your password for your Battle-IDE account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

SECURITY NOTICE: If you didn't request a password reset, please ignore this email and your password will remain unchanged.

---
© ${new Date().getFullYear()} Battle-IDE. All rights reserved.
Visit: ${APP_URL}
  `;
  
  return sendEmail({
    to: email,
    subject: `Reset your Battle-IDE password`,
    html,
    text,
  });
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
  email: string,
  username: string
): Promise<boolean> {
  const dashboardUrl = `${APP_URL}/dashboard`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00FFFF, #FF007F); padding: 20px; text-align: center; }
          .header h1 { color: #0A0A0F; margin: 0; }
          .content { background: #f4f4f4; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #00FFFF, #FF007F); color: #0A0A0F; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${APP_NAME}</h1>
          </div>
          <div class="content">
            <h2>🎉 Welcome to ${APP_NAME}!</h2>
            <p>Hello, ${username}!</p>
            <p>Your email has been verified successfully. You're all set to start competing in coding battles!</p>
            <p>Get started:</p>
            <ul>
              <li>Join a 1v1 match</li>
              <li>Create or join group battles</li>
              <li>Climb the leaderboard</li>
              <li>Connect with other coders</li>
            </ul>
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            <p>Happy coding! 💻</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Welcome to ${APP_NAME}!

Hello, ${username}!

Your email has been verified successfully. You're all set to start competing in coding battles!

Get started:
- Join a 1v1 match
- Create or join group battles
- Climb the leaderboard
- Connect with other coders

Visit your dashboard: ${dashboardUrl}

Happy coding! 💻
  `;
  
  return sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME}!`,
    html,
    text,
  });
}
