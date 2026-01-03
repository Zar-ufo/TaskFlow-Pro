import { prisma } from './db.js';
import { env } from './env.js';
import { hashPassword } from './auth.js';

export async function bootstrapAdmin(): Promise<void> {
  const username = env.adminUsername.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { username } });

  const passwordHash = await hashPassword(env.adminPassword);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: existing.name || 'Admin',
        username,
        role: 'admin',
        status: 'online',
        passwordHash,
      },
    });
    return;
  }

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      username,
      email: null,
      avatar: '👤',
      role: 'admin',
      status: 'online',
      passwordHash,
    },
  });

  await prisma.workspace.create({
    data: {
      name: 'Admin Workspace',
      description: '',
      color: '#6366f1',
      ownerId: admin.id,
      members: { create: { userId: admin.id, role: 'admin' } },
      categories: { create: [{ name: 'General', color: '#6366f1', icon: '✅' }] },
    },
  });
}
