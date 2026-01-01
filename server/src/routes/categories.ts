import { Router } from 'express';
import { prisma } from '../db.js';
import { mapCategory } from '../mappers.js';
import { zCreateCategory } from '../validation.js';

export const categoriesRouter = Router();

categoriesRouter.get('/categories', async (req, res) => {
  const workspaceId = req.query.workspaceId as string | undefined;

  const categories = await prisma.category.findMany({
    where: workspaceId ? { workspaceId } : undefined,
    orderBy: { createdAt: 'asc' },
  });

  res.json(categories.map(mapCategory));
});

categoriesRouter.post('/categories', async (req, res) => {
  const input = zCreateCategory.parse(req.body);

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
