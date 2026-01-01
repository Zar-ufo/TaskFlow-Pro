import { z } from 'zod';

export const zCuid = z.string().min(3);

export const zCreateWorkspace = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  color: z.string().min(1),
  ownerId: zCuid,
});

export const zCreateCategory = z.object({
  workspaceId: zCuid,
  name: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().min(1),
});

export const zTaskStatus = z.enum(['todo', 'in-progress', 'review', 'completed']);
export const zPriority = z.enum(['low', 'medium', 'high', 'urgent']);

export const zCreateTask = z.object({
  workspaceId: zCuid,
  title: z.string().min(1),
  description: z.string().optional().default(''),
  status: zTaskStatus.optional().default('todo'),
  priority: zPriority.optional().default('medium'),
  categoryId: zCuid,
  // Frontend sends YYYY-MM-DD; allow that or full ISO datetime.
  dueDate: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) =>
        v === null ||
        v === undefined ||
        /^\d{4}-\d{2}-\d{2}$/.test(v) ||
        !Number.isNaN(Date.parse(v)),
      'Invalid date format'
    ),
  assigneeId: zCuid.nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  progress: z.number().int().min(0).max(100).optional().default(0),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1),
        completed: z.boolean().optional().default(false),
      })
    )
    .optional()
    .default([]),
});

export const zUpdateTask = zCreateTask.partial().omit({ workspaceId: true });
