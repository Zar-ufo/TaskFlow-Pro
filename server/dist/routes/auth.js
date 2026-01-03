import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../httpErrors.js';
import { generateEmailVerificationToken, hashEmailVerificationToken, hashPassword, requireAuth, signAccessToken, verifyAccessToken, verifyPassword, } from '../auth.js';
import { sendEmail } from '../email.js';
import { env } from '../env.js';
export const authRouter = Router();
const zSignup = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
});
const zLogin = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
function publicUser(u) {
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        status: u.status,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt?.toISOString?.() ?? undefined,
    };
}
async function sendVerificationEmail(user) {
    const token = generateEmailVerificationToken();
    const tokenHash = hashEmailVerificationToken(token);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationTokenHash: tokenHash,
            emailVerificationTokenExpiresAt: expires,
            emailVerificationSentAt: new Date(),
        },
    });
    const verifyUrl = `${env.appBaseUrl}/verify?token=${encodeURIComponent(token)}`;
    await sendEmail({
        to: user.email,
        subject: 'Verify your TaskFlow account',
        text: `Hi ${user.name},\n\nVerify your email by opening this link:\n${verifyUrl}\n\nIf you did not create this account, you can ignore this email.`,
    });
}
authRouter.post('/auth/signup', async (req, res) => {
    const input = zSignup.parse(req.body);
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
        throw new HttpError(409, 'Email already in use');
    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
        data: {
            name: input.name,
            email,
            passwordHash,
            avatar: '👤',
            role: 'member',
            status: 'online',
        },
    });
    await prisma.workspace.create({
        data: {
            name: 'My Workspace',
            description: '',
            color: '#6366f1',
            ownerId: user.id,
            members: { create: { userId: user.id, role: 'admin' } },
            categories: { create: [{ name: 'General', color: '#6366f1', icon: '✅' }] },
        },
    });
    await sendVerificationEmail({ id: user.id, email: user.email, name: user.name });
    const token = signAccessToken({ userId: user.id, role: user.role });
    res.status(201).json({ token, user: publicUser(user) });
});
authRouter.post('/auth/login', async (req, res) => {
    const input = zLogin.parse(req.body);
    const email = input.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new HttpError(401, 'Invalid email or password');
    if (!user.passwordHash)
        throw new HttpError(401, 'Invalid email or password');
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok)
        throw new HttpError(401, 'Invalid email or password');
    const token = signAccessToken({ userId: user.id, role: user.role });
    res.json({ token, user: publicUser(user) });
});
authRouter.get('/auth/me', requireAuth, async (req, res) => {
    const auth = req.auth;
    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user)
        throw new HttpError(401, 'User not found');
    res.json({ user: publicUser(user) });
});
authRouter.post('/auth/resend-verification', async (req, res) => {
    // Allow both:
    // - logged-in users (preferred)
    // - email-only requests (don’t reveal if email exists)
    const zBody = z.object({ email: z.string().email().optional() });
    const body = zBody.parse(req.body ?? {});
    let user = null;
    const header = req.headers.authorization;
    if (header?.toLowerCase().startsWith('bearer ')) {
        try {
            const payload = verifyAccessToken(header.slice('bearer '.length).trim());
            user = await prisma.user.findUnique({ where: { id: payload.userId } });
        }
        catch {
            user = null;
        }
    }
    if (!user && body.email) {
        user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    }
    if (!user || user.emailVerified) {
        res.json({ ok: true });
        return;
    }
    const lastSent = user.emailVerificationSentAt ? new Date(user.emailVerificationSentAt).getTime() : 0;
    if (Date.now() - lastSent < 60_000) {
        res.status(429).json({ ok: false, message: 'Please wait before resending.' });
        return;
    }
    await sendVerificationEmail({ id: user.id, email: user.email, name: user.name });
    res.json({ ok: true });
});
authRouter.get('/auth/verify', async (req, res) => {
    const token = String(req.query.token ?? '');
    if (!token)
        throw new HttpError(400, 'Missing token');
    const tokenHash = hashEmailVerificationToken(token);
    const user = await prisma.user.findFirst({
        where: {
            emailVerificationTokenHash: tokenHash,
        },
    });
    if (!user)
        throw new HttpError(400, 'Invalid token');
    if (!user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt.getTime() < Date.now()) {
        throw new HttpError(400, 'Token expired');
    }
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerificationTokenHash: null,
            emailVerificationTokenExpiresAt: null,
        },
    });
    res.json({ ok: true });
});
