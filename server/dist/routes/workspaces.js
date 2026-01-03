import { Router } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../httpErrors.js';
import { mapWorkspace } from '../mappers.js';
import { zCreateWorkspace } from '../validation.js';
export const workspacesRouter = Router();
workspacesRouter.get('/workspaces', async (req, res) => {
    const auth = req.auth;
    const workspaces = await prisma.workspace.findMany({
        where: {
            members: {
                some: { userId: auth.userId },
            },
        },
        orderBy: { createdAt: 'desc' },
        include: {
            members: { include: { user: true } },
        },
    });
    res.json(workspaces.map(mapWorkspace));
});
workspacesRouter.post('/workspaces', async (req, res) => {
    const auth = req.auth;
    const input = zCreateWorkspace.parse(req.body);
    const owner = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!owner)
        throw new HttpError(400, 'User not found');
    const ws = await prisma.workspace.create({
        data: {
            name: input.name,
            description: input.description,
            color: input.color,
            ownerId: auth.userId,
            members: {
                create: {
                    userId: auth.userId,
                    role: 'admin',
                },
            },
        },
        include: { members: { include: { user: true } } },
    });
    res.status(201).json(mapWorkspace(ws));
});
