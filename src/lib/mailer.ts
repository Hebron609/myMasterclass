import nodemailer from "nodemailer";

interface BaseMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Returns a configured nodemailer SMTP transporter.
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/^["']|["']$/g, ""); // strip quotes if present

  if (!user || !pass) {
    console.warn("⚠️ [Mailer] SMTP_USER or SMTP_PASS is missing in environment variables.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * HTML wrapper with Diba Leagleship Institute branding
 */
function renderBrandedEmailTemplate(title: string, bodyContent: string): string {
  const brandGold = "#DB911E";
  const brandDark = "#151F38";
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #374151;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f8fa; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #e5e7eb;" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: ${brandDark}; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                DIBA <span style="color: ${brandGold};">LEAGLESHIP</span> INSTITUTE
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">
                Vision 2535 Mentorship Platform
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 40px 32px 40px;">
              <h2 style="margin: 0 0 18px 0; font-size: 20px; font-weight: 700; color: #111827;">
                ${title}
              </h2>
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                This message was sent from the <strong>Vision 2535 Mentorship Platform</strong>.<br />
                If you did not expect this communication, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                &copy; ${currentYear} Diba Leagleship Institute. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generic dispatch helper
 */
async function sendMail({ to, subject, text, html }: BaseMailOptions) {
  const fromName = process.env.SMTP_FROM_NAME || "Diba Leagleship Institute";
  const fromAddress = process.env.SMTP_USER || "dibaleagleship@gmail.com";
  const transporter = getMailTransporter();

  return transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    text,
    html,
  });
}

/**
 * 1. Password Reset Email
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  name,
}: {
  to: string;
  resetUrl: string;
  name?: string;
}) {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const subject = "Reset Your Password - Diba Leagleship Platform";
  const text = `${greeting}\n\nYou recently requested to reset your password for your Leagleship account. Use the link below to set a new password:\n\n${resetUrl}\n\nIf you did not make this request, please disregard this email.`;

  const html = renderBrandedEmailTemplate(
    "Password Reset Request",
    `
      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        ${greeting}
      </p>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        We received a request to reset your password for your <strong>Diba Leagleship</strong> account. Click the button below to choose a new password:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #DB911E; color: #ffffff; padding: 13px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 2px 6px rgba(219,145,30,0.3);">
          Reset Password
        </a>
      </div>
      <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #6b7280;">
        Or copy and paste this link into your browser:<br />
        <a href="${resetUrl}" style="color: #DB911E; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="margin: 20px 0 0 0; font-size: 12px; color: #9ca3af; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        This reset link will expire in 60 minutes for security reasons.
      </p>
    `
  );

  return sendMail({ to, subject, text, html });
}

/**
 * 2. OTP Code Verification Email
 */
export async function sendOtpEmail({
  to,
  otpCode,
  name,
}: {
  to: string;
  otpCode: string;
  name?: string;
}) {
  const greeting = name ? `Hello ${name},` : "Hello,";
  const subject = `Your Verification Code: ${otpCode} - Diba Leagleship`;
  const text = `${greeting}\n\nYour one-time verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.`;

  const html = renderBrandedEmailTemplate(
    "Verify Your Account",
    `
      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        ${greeting}
      </p>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Please use the one-time verification code below to verify your account or complete your sign-in:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #DB911E; border-radius: 12px; padding: 16px 36px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.2em; color: #151F38; font-family: monospace;">
            ${otpCode}
          </span>
        </div>
      </div>
      <p style="margin: 20px 0 0 0; font-size: 13px; text-align: center; color: #6b7280;">
        This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
      </p>
    `
  );

  return sendMail({ to, subject, text, html });
}

/**
 * 3. Welcome / Account Invitation Email
 */
export async function sendWelcomeUserEmail({
  to,
  name,
  role,
  temporaryPassword,
  loginUrl,
}: {
  to: string;
  name: string;
  role: "mentor" | "mentee" | "admin" | string;
  temporaryPassword?: string;
  loginUrl?: string;
}) {
  const targetLoginUrl =
    loginUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
  const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
  const subject = `Welcome to Diba Leagleship Institute (${formattedRole})`;
  const text = `Hello ${name},\n\nYou have been invited to join the Vision 2535 Mentorship Platform as a ${formattedRole}.\n\nLogin URL: ${targetLoginUrl}\nEmail: ${to}\n${
    temporaryPassword ? `Temporary Password: ${temporaryPassword}\n` : ""
  }\nPlease sign in and complete your profile onboarding.`;

  const html = renderBrandedEmailTemplate(
    `Welcome to Vision 2535, ${name}!`,
    `
      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        An administrator has created your account on the <strong>Vision 2535 Mentorship Platform</strong> with the role of <strong>${formattedRole}</strong>.
      </p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
          <strong>Email:</strong> ${to}
        </p>
        ${
          temporaryPassword
            ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
                <strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${temporaryPassword}</code>
              </p>
              <p style="margin: 0; font-size: 12px; color: #d97706;">
                * You will be prompted to choose a permanent secure password upon initial sign in.
              </p>`
            : `<p style="margin: 0; font-size: 13px; color: #6b7280;">Use the password provided by your administrator or set up during registration.</p>`
        }
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${targetLoginUrl}" style="background-color: #DB911E; color: #ffffff; padding: 13px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
          Sign In to Your Account
        </a>
      </div>
    `
  );

  return sendMail({ to, subject, text, html });
}

/**
 * 4. Certificate Issued Notification Email
 */
export async function sendCertificateEmail({
  to,
  menteeName,
  certificateTitle,
  certificateUrl,
}: {
  to: string;
  menteeName: string;
  certificateTitle: string;
  certificateUrl: string;
}) {
  const subject = `Congratulations! You've been awarded: ${certificateTitle}`;
  const text = `Hello ${menteeName},\n\nCongratulations! Your certificate "${certificateTitle}" has been issued on the Vision 2535 Mentorship Platform.\n\nYou can view and download your certificate here:\n${certificateUrl}`;

  const html = renderBrandedEmailTemplate(
    "Certificate of Achievement Issued!",
    `
      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Dear <strong>${menteeName}</strong>,
      </p>
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        We are thrilled to announce that your certificate of completion has been officially issued by the <strong>Diba Leagleship Institute</strong>:
      </p>
      <div style="background-color: #FFF6EA; border: 1px solid #FCD34D; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 28px; display: block; margin-bottom: 8px;">🎓</span>
        <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #92400E;">
          ${certificateTitle}
        </h3>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #B45309;">
          Vision 2535 Mentorship Program
        </p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${certificateUrl}" style="background-color: #DB911E; color: #ffffff; padding: 13px 32px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
          View & Download Certificate
        </a>
      </div>
    `
  );

  return sendMail({ to, subject, text, html });
}

/**
 * 5. Session Booking Confirmation Email
 */
export async function sendSessionBookingEmail({
  mentorEmail,
  menteeEmail,
  mentorName,
  menteeName,
  sessionTitle,
  scheduledAt,
  meetingLink,
}: {
  mentorEmail: string;
  menteeEmail: string;
  mentorName: string;
  menteeName: string;
  sessionTitle: string;
  scheduledAt: string;
  meetingLink?: string;
}) {
  const subject = `Session Confirmed: ${sessionTitle} with ${mentorName}`;
  const text = `A mentorship session has been scheduled between ${menteeName} and ${mentorName}.\n\nSession: ${sessionTitle}\nScheduled Date & Time: ${scheduledAt}\n${
    meetingLink ? `Meeting Link: ${meetingLink}\n` : ""
  }`;

  const html = renderBrandedEmailTemplate(
    "Mentorship Session Confirmed",
    `
      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        A new 1-on-1 mentorship session has been scheduled:
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Session:</strong> ${sessionTitle}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Mentor:</strong> ${mentorName} (${mentorEmail})</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Mentee:</strong> ${menteeName} (${menteeEmail})</p>
        <p style="margin: 0; font-size: 14px;"><strong>Scheduled Time:</strong> ${scheduledAt}</p>
      </div>
      ${
        meetingLink
          ? `<div style="text-align: center; margin: 28px 0;">
              <a href="${meetingLink}" style="background-color: #151F38; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
                Join Video Meeting
              </a>
            </div>`
          : ""
      }
    `
  );

  // Send to both parties
  await sendMail({ to: mentorEmail, subject, text, html });
  return sendMail({ to: menteeEmail, subject, text, html });
}
