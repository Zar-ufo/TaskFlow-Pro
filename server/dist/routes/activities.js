import { Router } from 'express';
import { prisma } from '../db.js';
import { mapActivity } from '../mappers.js';
export const activitiesRouter = Router();
activitiesRouter.get('/activities', async (req, res) => {
    const workspaceId = req.query.workspaceId;
    const activities = await prisma.activity.findMany({
        where: workspaceId ? { workspaceId } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    res.json(activities.map(mapActivity));
});
