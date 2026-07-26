import nodemailer from 'nodemailer';
import { env } from './env';

const CONNECTION_TIMEOUT_MS = 5000;

export const mailTransporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_PORT === 465,
  auth: env.MAIL_USER && env.MAIL_PASS ? { user: env.MAIL_USER, pass: env.MAIL_PASS } : undefined,
  // Without these, an unreachable/unconfigured SMTP host can hang the
  // connection attempt well past any sane request timeout instead of
  // failing fast — email delivery is best-effort (see utils/mailer.ts),
  // so a slow failure here must not block the HTTP request that triggered it.
  connectionTimeout: CONNECTION_TIMEOUT_MS,
  greetingTimeout: CONNECTION_TIMEOUT_MS,
  socketTimeout: CONNECTION_TIMEOUT_MS,
});
