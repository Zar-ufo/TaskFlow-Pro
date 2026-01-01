import type { Activity, Category, Task, Workspace, WorkspaceMember, User, Subtask } from '@prisma/client';

export function mapStatusFromDb(status: Task['status']): 'todo' | 'in-progress' | 'review' | 'completed' {
  switch (status) {
    case 'todo':
      return 'todo';
    case 'in_progress':
      return 'in-progress';
    case 'review':
      return 'review';
    case 'completed':
      return 'completed';
    default:
      return 'todo';
  }
}

export function mapStatusToDb(status: 'todo' | 'in-progress' | 'review' | 'completed'): Task['status'] {
  switch (status) {
    case 'todo':
      return 'todo';
    case 'in-progress':
      return 'in_progress';
    case 'review':
      return 'review';
    case 'completed':
      return 'completed';
    default:
      return 'todo';
  }
}

export function mapWorkspace(w: Workspace & { members?: (WorkspaceMember & { user: User })[] }) {
  return {
    id: w.id,
    name: w.name,
    description: w.description,
    color: w.color,
    createdAt: w.createdAt.toISOString(),
    ownerId: w.ownerId,
    members:
      w.members?.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.user.role,
        status: m.user.status,
      })) ?? [],
  };
}

export function mapCategory(c: Category) {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
    workspaceId: c.workspaceId,
  };
}

export function mapTask(t: Task & { subtasks: Subtask[] }) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: mapStatusFromDb(t.status),
    priority: t.priority,
    categoryId: t.categoryId,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    assigneeId: t.assigneeId,
    tags: t.tags,
    subtasks: t.subtasks.map((s) => ({ id: s.id, title: s.title, completed: s.completed })),
    progress: t.progress,
    workspaceId: t.workspaceId,
  };
}

export function mapActivity(a: Activity) {
  return {
    id: a.id,
    type: a.type,
    userId: a.userId,
    taskId: a.taskId ?? undefined,
    workspaceId: a.workspaceId,
    message: a.message,
    timestamp: a.createdAt.toISOString(),
  };
}
