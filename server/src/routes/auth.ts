import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../httpErrors.js';
import {
  hashPassword,
  requireAuth,
  signAccessToken,
  verifyPassword,
} from '../auth.js';

export const authRouter = Router();

const zSignup = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

const zLogin = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});

function publicUser(u: any) {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt?.toISOString?.() ?? undefined,
  };
}

authRouter.post('/auth/signup', async (req, res) => {
  const input = zSignup.parse(req.body);
  const username = input.username.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new HttpError(409, 'Username already in use');

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      username,
      name: username,
      email: null,
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

  const token = signAccessToken({ userId: user.id, role: user.role });
  res.status(201).json({ token, user: publicUser(user) });
});

authRouter.post('/auth/login', async (req, res) => {
  const input = zLogin.parse(req.body);
  const username = input.username.toLowerCase();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new HttpError(401, 'Invalid username or password');

  if (!user.passwordHash) throw new HttpError(401, 'Invalid username or password');

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Invalid username or password');

  const token = signAccessToken({ userId: user.id, role: user.role });
  res.json({ token, user: publicUser(user) });
});

authRouter.get('/auth/me', requireAuth, async (req, res) => {
  const auth = (req as any).auth as { userId: string };
  const user = await prisma.user.findUnique({ where: { id: auth.userId } });
  if (!user) throw new HttpError(401, 'User not found');
  res.json({ user: publicUser(user) });
});

// Email verification routes intentionally removed (username/password auth only).
