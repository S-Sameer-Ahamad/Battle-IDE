/**
 * Email service for sending verification and password reset emails
 * Currently logs to console. Replace with actual email service (SendGrid, Resend, etc.)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = 'Battle-IDE';

/**
 * Send an email (currently logs to console)
 * TODO: Integrate with SendGrid, Resend, or another email service
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // For development: log to console
    console.log('\n📧 Email would be sent:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:\n', options.text || options.html);
    console.log('---\n');
    
    // TODO: Implement actual email sending
    // Example with SendGrid:
    // await sgMail.send({
    //   to: options.to,
    //   from: process.env.EMAIL_FROM,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00FFFF, #FF007F); padding: 20px; text-align: center; }
          .header h1 { color: #0A0A0F; margin: 0; }
          .content { background: #f4f4f4; padding: 30px; }
          .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #00FFFF, #FF007F); color: #0A0A0F; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${APP_NAME}</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello, ${username}!</p>
            <p>We received a request to reset your password for your ${APP_NAME} account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 ${APP_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  const text = `
Password Reset Request

Hello, ${username}!

We received a request to reset your password for your ${APP_NAME} account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.
  `;
  
  return sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
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
