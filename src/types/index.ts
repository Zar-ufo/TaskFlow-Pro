export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  categoryId: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeId: string | null;
  tags: string[];
  subtasks: Subtask[];
  progress: number;
  workspaceId: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'online' | 'away' | 'offline';
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  color: string;
  members: User[];
  createdAt: string;
  ownerId: string;
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'member_joined';
  userId: string;
  taskId?: string;
  workspaceId: string;
  message: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface Stats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  weeklyProgress: number[];
  categoryBreakdown: { category: string; count: number; color: string }[];
}
