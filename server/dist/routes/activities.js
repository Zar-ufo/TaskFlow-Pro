import { Router } from 'express';
import { prisma } from '../db.js';
import { mapActivity } from '../mappers.js';
export const activitiesRouter = Router();
activitiesRouter.get('/activities', async (req, res) => {
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
    const activities = await prisma.activity.findMany({
        where: workspaceId
            ? { workspaceId }
            : {
                workspace: {
                    members: {
                        some: { userId: auth.userId },
                    },
                },
            },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    res.json(activities.map(mapActivity));
});
