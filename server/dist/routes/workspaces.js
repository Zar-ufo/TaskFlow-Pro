import { Router } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../httpErrors.js';
import { mapWorkspace } from '../mappers.js';
import { zCreateWorkspace } from '../validation.js';
export const workspacesRouter = Router();
workspacesRouter.get('/workspaces', async (_req, res) => {
    const workspaces = await prisma.workspace.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            members: { include: { user: true } },
        },
    });
    res.json(workspaces.map(mapWorkspace));
});
workspacesRouter.post('/workspaces', async (req, res) => {
    const input = zCreateWorkspace.parse(req.body);
    const owner = await prisma.user.findUnique({ where: { id: input.ownerId } });
    if (!owner)
        throw new HttpError(400, 'ownerId not found');
    const ws = await prisma.workspace.create({
        data: {
            name: input.name,
            description: input.description,
            color: input.color,
            ownerId: input.ownerId,
            members: {
                create: {
                    userId: input.ownerId,
                    role: 'admin',
                },
            },
        },
        include: { members: { include: { user: true } } },
    });
    res.status(201).json(mapWorkspace(ws));
});
