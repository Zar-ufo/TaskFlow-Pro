import nodemailer from 'nodemailer';
import { env } from './env.js';
function hasSmtpConfig() {
    return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}
export async function sendEmail(input) {
    if (!hasSmtpConfig()) {
        // Dev fallback: allow flows to function without SMTP.
        console.log('[email:mock]', { from: env.emailFrom, ...input });
        return;
    }
    const transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: {
            user: env.smtpUser,
            pass: env.smtpPass,
        },
    });
    await transporter.sendMail({
        from: env.emailFrom,
        to: input.to,
        subject: input.subject,
        text: input.text,
    });
}
