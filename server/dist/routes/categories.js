import { Router } from 'express';
import { prisma } from '../db.js';
import { mapCategory } from '../mappers.js';
import { zCreateCategory } from '../validation.js';
export const categoriesRouter = Router();
categoriesRouter.get('/categories', async (req, res) => {
    const auth = req.auth;
    const workspaceId = req.query.workspaceId;
    if (workspaceId) {
        const member = await prisma.workspaceMember.findUnique({
            where: { workspaceId_userId: { workspaceId, userId: auth.userId } },
        });
        if (!member) {
            return res.json([]);
        }
    }
    const categories = await prisma.category.findMany({
        where: workspaceId
            ? { workspaceId }
            : {
                workspace: {
                    members: {
                        some: { userId: auth.userId },
                    },
                },
            },
        orderBy: { createdAt: 'asc' },
    });
    res.json(categories.map(mapCategory));
});
categoriesRouter.post('/categories', async (req, res) => {
    const auth = req.auth;
    const input = zCreateCategory.parse(req.body);
    const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: input.workspaceId, userId: auth.userId } },
    });
    if (!member) {
        res.status(403).send('Not a workspace member');
        return;
    }
    const category = await prisma.category.create({
        data: {
            workspaceId: input.workspaceId,
            name: input.name,
            color: input.color,
            icon: input.icon,
        },
    });
    res.status(201).json(mapCategory(category));
});
