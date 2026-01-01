import { Router } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../httpErrors.js';
import { mapStatusToDb, mapTask } from '../mappers.js';
import { zCreateTask, zUpdateTask } from '../validation.js';
export const tasksRouter = Router();
function parseDueDate(input) {
    if (input === undefined)
        return undefined;
    if (input === null || input === '')
        return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        // Treat as local-date, store at midnight UTC.
        return new Date(`${input}T00:00:00.000Z`);
    }
    const d = new Date(input);
    if (Number.isNaN(d.getTime()))
        throw new HttpError(400, 'Invalid dueDate');
    return d;
}
tasksRouter.get('/tasks', async (req, res) => {
    const workspaceId = req.query.workspaceId;
    const tasks = await prisma.task.findMany({
        where: workspaceId ? { workspaceId } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: { subtasks: true },
    });
    res.json(tasks.map(mapTask));
});
tasksRouter.post('/tasks', async (req, res) => {
    const input = zCreateTask.parse(req.body);
    const task = await prisma.task.create({
        data: {
            workspaceId: input.workspaceId,
            title: input.title,
            description: input.description,
            status: mapStatusToDb(input.status),
            priority: input.priority,
            categoryId: input.categoryId,
            dueDate: parseDueDate(input.dueDate) ?? null,
            assigneeId: input.assigneeId ?? null,
            tags: input.tags,
            progress: input.progress,
            subtasks: {
                create: input.subtasks.map((s) => ({ title: s.title, completed: s.completed })),
            },
        },
        include: { subtasks: true },
    });
    // Activity
    await prisma.activity.create({
        data: {
            type: 'task_created',
            message: `Task created: "${task.title}"`,
            workspaceId: task.workspaceId,
            userId: input.assigneeId ?? (await defaultUserId()),
            taskId: task.id,
        },
    });
    res.status(201).json(mapTask(task));
});
tasksRouter.patch('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const input = zUpdateTask.parse(req.body);
    const existing = await prisma.task.findUnique({ where: { id }, include: { subtasks: true } });
    if (!existing)
        throw new HttpError(404, 'Task not found');
    const updated = await prisma.task.update({
        where: { id },
        data: {
            title: input.title,
            description: input.description,
            status: input.status ? mapStatusToDb(input.status) : undefined,
            priority: input.priority,
            categoryId: input.categoryId,
            dueDate: parseDueDate(input.dueDate),
            assigneeId: input.assigneeId === undefined ? undefined : input.assigneeId,
            tags: input.tags,
            progress: input.progress,
        },
        include: { subtasks: true },
    });
    if (input.status === 'completed') {
        await prisma.activity.create({
            data: {
                type: 'task_completed',
                message: `Task completed: "${updated.title}"`,
                workspaceId: updated.workspaceId,
                userId: updated.assigneeId ?? (await defaultUserId()),
                taskId: updated.id,
            },
        });
    }
    else {
        await prisma.activity.create({
            data: {
                type: 'task_updated',
                message: `Task updated: "${updated.title}"`,
                workspaceId: updated.workspaceId,
                userId: updated.assigneeId ?? (await defaultUserId()),
                taskId: updated.id,
            },
        });
    }
    res.json(mapTask(updated));
});
tasksRouter.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing)
        return res.status(204).send();
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
});
async function defaultUserId() {
    const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!user)
        throw new HttpError(500, 'No users exist. Seed required.');
    return user.id;
}
