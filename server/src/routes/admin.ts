import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin, requireAuth } from '../auth.js';

export const adminRouter = Router();

adminRouter.get('/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  res.json(
    users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }))
  );
});
