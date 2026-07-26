import { mailTransporter } from '../config/mail.config';
import { env } from '../config/env';
import { logger } from './logger';

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

async function sendMail({ to, subject, html }: SendMailInput): Promise<void> {
  try {
    await mailTransporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
  } catch (error) {
    // Email delivery is best-effort in this environment (no SMTP creds in
    // local/dev by default) — log and continue rather than failing the
    // request that triggered it.
    logger.warn(`Failed to send email to ${to}: ${(error as Error).message}`);
  }
}

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const link = `${env.CLIENT_URL}/verify-email/${token}`;
  await sendMail({
    to,
    subject: 'Verify your email address',
    html: `<p>Welcome to the Telemedicine Platform. Please verify your email by clicking the link below:</p>
           <p><a href="${link}">${link}</a></p>
           <p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const link = `${env.CLIENT_URL}/reset-password/${token}`;
  await sendMail({
    to,
    subject: 'Reset your password',
    html: `<p>We received a request to reset your password. Click the link below to choose a new one:</p>
           <p><a href="${link}">${link}</a></p>
           <p>If you did not request this, you can safely ignore this email. This link expires in 1 hour.</p>`,
  });
}

export async function sendWelcomeSetPasswordEmail(to: string, token: string): Promise<void> {
  const link = `${env.CLIENT_URL}/reset-password/${token}`;
  await sendMail({
    to,
    subject: 'Welcome to the Telemedicine Platform',
    html: `<p>An account has been created for you on the Telemedicine Platform. Click the link below to set your password and sign in:</p>
           <p><a href="${link}">${link}</a></p>
           <p>This link expires in 1 hour.</p>`,
  });
}
