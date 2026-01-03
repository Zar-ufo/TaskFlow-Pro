import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  port: Number(process.env.PORT ?? '4000'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: required('DATABASE_URL'),

  jwtSecret: required('JWT_SECRET'),

  // Email (optional). If not set, emails are logged to console.
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:5173',
  emailFrom: process.env.EMAIL_FROM ?? 'no-reply@taskflow.local',
  smtpHost: optional('SMTP_HOST'),
  smtpPort: Number(process.env.SMTP_PORT ?? '587'),
  smtpUser: optional('SMTP_USER'),
  smtpPass: optional('SMTP_PASS'),

  // Admin bootstrap (defaults per request, but can be overridden)
  adminEmail: process.env.ADMIN_EMAIL ?? 'abdullahzarif050@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'Zariffatiha11',
};
