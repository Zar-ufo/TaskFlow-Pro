import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, Category, Workspace, User, Activity, Notification, TaskStatus } from '../types';
import { api } from '../api/client';

interface AppState {
  // Current user
  currentUser: User;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  
  // Workspaces
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt'>) => void;

  // Backend connectivity
  apiStatus: 'checking' | 'online' | 'offline';
  checkApi: () => Promise<void>;
  refreshWorkspaceData: (workspaceId: string) => Promise<void>;
  
  // Activities (real-time feed)
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // UI State
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCategory: string | null;
  setFilterCategory: (categoryId: string | null) => void;
  filterPriority: string | null;
  setFilterPriority: (priority: string | null) => void;
}

// Sample data
const sampleUsers: User[] = [
  { id: '1', name: 'You', email: 'you@taskflow.pro', avatar: '👤', role: 'admin', status: 'online' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@taskflow.pro', avatar: '👩‍💻', role: 'member', status: 'online' },
  { id: '3', name: 'Mike Johnson', email: 'mike@taskflow.pro', avatar: '👨‍🎨', role: 'member', status: 'away' },
  { id: '4', name: 'Emily Davis', email: 'emily@taskflow.pro', avatar: '👩‍🔬', role: 'viewer', status: 'offline' },
];

const sampleCategories: Category[] = [
  { id: 'cat-1', name: 'Development', color: '#6366f1', icon: '💻' },
  { id: 'cat-2', name: 'Design', color: '#d946ef', icon: '🎨' },
  { id: 'cat-3', name: 'Research', color: '#10b981', icon: '🔬' },
  { id: 'cat-4', name: 'Marketing', color: '#f59e0b', icon: '📢' },
  { id: 'cat-5', name: 'Meetings', color: '#ef4444', icon: '📅' },
  { id: 'cat-6', name: 'Personal', color: '#06b6d4', icon: '🏠' },
];

const sampleWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Product Launch Q1',
    description: 'All tasks related to the Q1 product launch',
    color: '#6366f1',
    members: sampleUsers,
    createdAt: '2025-12-01T00:00:00Z',
    ownerId: '1',
  },
  {
    id: 'ws-2',
    name: 'Study Group - CS301',
    description: 'Collaborative workspace for CS301 course',
    color: '#10b981',
    members: [sampleUsers[0], sampleUsers[1]],
    createdAt: '2025-12-15T00:00:00Z',
    ownerId: '1',
  },
];

const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design new dashboard UI',
    description: 'Create wireframes and mockups for the new analytics dashboard',
    status: 'in-progress',
    priority: 'high',
    categoryId: 'cat-2',
    dueDate: '2026-01-05',
    createdAt: '2025-12-28T10:00:00Z',
    updatedAt: '2025-12-30T14:30:00Z',
    assigneeId: '2',
    tags: ['ui', 'dashboard', 'priority'],
    subtasks: [
      { id: 'st-1', title: 'Research competitors', completed: true },
      { id: 'st-2', title: 'Create wireframes', completed: true },
      { id: 'st-3', title: 'Design mockups', completed: false },
      { id: 'st-4', title: 'Get stakeholder feedback', completed: false },
    ],
    progress: 50,
    workspaceId: 'ws-1',
  },
  {
    id: 'task-2',
    title: 'Implement authentication system',
    description: 'Set up OAuth 2.0 and JWT token-based authentication',
    status: 'todo',
    priority: 'urgent',
    categoryId: 'cat-1',
    dueDate: '2026-01-03',
    createdAt: '2025-12-27T09:00:00Z',
    updatedAt: '2025-12-27T09:00:00Z',
    assigneeId: '1',
    tags: ['backend', 'security', 'auth'],
    subtasks: [
      { id: 'st-5', title: 'Set up OAuth providers', completed: false },
      { id: 'st-6', title: 'Implement JWT handling', completed: false },
      { id: 'st-7', title: 'Add refresh token logic', completed: false },
    ],
    progress: 0,
    workspaceId: 'ws-1',
  },
  {
    id: 'task-3',
    title: 'User research interviews',
    description: 'Conduct 5 user interviews for feature validation',
    status: 'review',
    priority: 'medium',
    categoryId: 'cat-3',
    dueDate: '2026-01-02',
    createdAt: '2025-12-20T11:00:00Z',
    updatedAt: '2025-12-31T16:00:00Z',
    assigneeId: '3',
    tags: ['research', 'users', 'feedback'],
    subtasks: [
      { id: 'st-8', title: 'Prepare interview questions', completed: true },
      { id: 'st-9', title: 'Schedule interviews', completed: true },
      { id: 'st-10', title: 'Conduct interviews', completed: true },
      { id: 'st-11', title: 'Compile findings report', completed: false },
    ],
    progress: 75,
    workspaceId: 'ws-1',
  },
  {
    id: 'task-4',
    title: 'Study Chapter 5 - Algorithms',
    description: 'Complete reading and exercises for algorithms chapter',
    status: 'in-progress',
    priority: 'high',
    categoryId: 'cat-3',
    dueDate: '2026-01-04',
    createdAt: '2025-12-29T08:00:00Z',
    updatedAt: '2025-12-31T10:00:00Z',
    assigneeId: '1',
    tags: ['study', 'cs301', 'algorithms'],
    subtasks: [
      { id: 'st-12', title: 'Read chapter', completed: true },
      { id: 'st-13', title: 'Take notes', completed: true },
      { id: 'st-14', title: 'Complete exercises 1-10', completed: false },
      { id: 'st-15', title: 'Review with study group', completed: false },
    ],
    progress: 50,
    workspaceId: 'ws-2',
  },
  {
    id: 'task-5',
    title: 'Create marketing campaign',
    description: 'Design and plan social media campaign for product launch',
    status: 'todo',
    priority: 'medium',
    categoryId: 'cat-4',
    dueDate: '2026-01-10',
    createdAt: '2025-12-30T14:00:00Z',
    updatedAt: '2025-12-30T14:00:00Z',
    assigneeId: '4',
    tags: ['marketing', 'social-media', 'campaign'],
    subtasks: [
      { id: 'st-16', title: 'Define target audience', completed: false },
      { id: 'st-17', title: 'Create content calendar', completed: false },
      { id: 'st-18', title: 'Design graphics', completed: false },
    ],
    progress: 0,
    workspaceId: 'ws-1',
  },
  {
    id: 'task-6',
    title: 'Weekly team sync',
    description: 'Prepare agenda and notes for weekly team meeting',
    status: 'completed',
    priority: 'low',
    categoryId: 'cat-5',
    dueDate: '2025-12-31',
    createdAt: '2025-12-29T09:00:00Z',
    updatedAt: '2025-12-31T11:00:00Z',
    assigneeId: '1',
    tags: ['meeting', 'team', 'weekly'],
    subtasks: [
      { id: 'st-19', title: 'Prepare agenda', completed: true },
      { id: 'st-20', title: 'Send calendar invite', completed: true },
      { id: 'st-21', title: 'Take meeting notes', completed: true },
    ],
    progress: 100,
    workspaceId: 'ws-1',
  },
];

const sampleActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'task_completed',
    userId: '1',
    taskId: 'task-6',
    workspaceId: 'ws-1',
    message: 'You completed "Weekly team sync"',
    timestamp: '2025-12-31T11:00:00Z',
  },
  {
    id: 'act-2',
    type: 'task_updated',
    userId: '2',
    taskId: 'task-1',
    workspaceId: 'ws-1',
    message: 'Sarah Chen updated progress on "Design new dashboard UI"',
    timestamp: '2025-12-31T10:30:00Z',
  },
  {
    id: 'act-3',
    type: 'member_joined',
    userId: '4',
    workspaceId: 'ws-1',
    message: 'Emily Davis joined the workspace',
    timestamp: '2025-12-31T09:00:00Z',
  },
];

export const useStore = create<AppState>((set, get) => ({
  // Backend connectivity
  apiStatus: 'checking',

  checkApi: async () => {
    try {
      await api.health();
      set({ apiStatus: 'online' });

      // Hydrate workspaces/categories/tasks/activities
      const workspaces = (await api.listWorkspaces()) as Workspace[];
      if (workspaces.length > 0) {
        set({ workspaces, currentWorkspace: workspaces[0] });
        await get().refreshWorkspaceData(workspaces[0].id);
      }
    } catch {
      set({ apiStatus: 'offline' });
    }
  },

  refreshWorkspaceData: async (workspaceId) => {
    try {
      const [categories, tasks, activities] = await Promise.all([
        api.listCategories(workspaceId),
        api.listTasks(workspaceId),
        api.listActivities(workspaceId),
      ]);
      set({
        categories: categories as Category[],
        tasks: tasks as Task[],
        activities: activities as Activity[],
      });
    } catch {
      // Keep existing in-memory data if API call fails.
    }
  },

  // Current user
  currentUser: sampleUsers[0],
  
  // Tasks
  tasks: sampleTasks,
  
  addTask: (taskData) => {
    // If backend is online, persist there and refresh.
    if (get().apiStatus === 'online') {
      (async () => {
        try {
          await api.createTask({
            ...taskData,
            // server accepts YYYY-MM-DD or ISO; store currently uses YYYY-MM-DD
            dueDate: taskData.dueDate,
          });
          await get().refreshWorkspaceData(taskData.workspaceId);
          get().addNotification({
            type: 'success',
            title: 'Task Created',
            message: `"${taskData.title}" has been added`,
          });
        } catch (e) {
          get().addNotification({
            type: 'error',
            title: 'Backend Error',
            message: e instanceof Error ? e.message : 'Failed to create task',
          });
        }
      })();
      return;
    }

    // Fallback: local-only
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));

    get().addActivity({
      type: 'task_created',
      userId: get().currentUser.id,
      taskId: newTask.id,
      workspaceId: newTask.workspaceId,
      message: `You created "${newTask.title}"`,
    });

    get().addNotification({
      type: 'success',
      title: 'Task Created',
      message: `"${newTask.title}" has been added to your tasks`,
    });
  },
  
  updateTask: (id, updates) => {
    if (get().apiStatus === 'online') {
      (async () => {
        try {
          await api.updateTask(id, updates);
          const wsId = get().currentWorkspace?.id;
          if (wsId) await get().refreshWorkspaceData(wsId);
        } catch (e) {
          get().addNotification({
            type: 'error',
            title: 'Backend Error',
            message: e instanceof Error ? e.message : 'Failed to update task',
          });
        }
      })();
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
    
    const task = get().tasks.find((t) => t.id === id);
    if (task) {
      get().addActivity({
        type: 'task_updated',
        userId: get().currentUser.id,
        taskId: id,
        workspaceId: task.workspaceId,
        message: `You updated "${task.title}"`,
      });
    }
  },
  
  deleteTask: (id) => {
    if (get().apiStatus === 'online') {
      (async () => {
        try {
          await api.deleteTask(id);
          const wsId = get().currentWorkspace?.id;
          if (wsId) await get().refreshWorkspaceData(wsId);
        } catch (e) {
          get().addNotification({
            type: 'error',
            title: 'Backend Error',
            message: e instanceof Error ? e.message : 'Failed to delete task',
          });
        }
      })();
      return;
    }

    const task = get().tasks.find((t) => t.id === id);
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    
    if (task) {
      get().addNotification({
        type: 'info',
        title: 'Task Deleted',
        message: `"${task.title}" has been removed`,
      });
    }
  },
  
  moveTask: (id, status) => {
    if (get().apiStatus === 'online') {
      get().updateTask(id, { status });
      return;
    }

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              progress: status === 'completed' ? 100 : task.progress,
              updatedAt: new Date().toISOString(),
            }
          : task
      ),
    }));
    
    const task = get().tasks.find((t) => t.id === id);
    if (task && status === 'completed') {
      get().addActivity({
        type: 'task_completed',
        userId: get().currentUser.id,
        taskId: id,
        workspaceId: task.workspaceId,
        message: `You completed "${task.title}"`,
      });
      
      get().addNotification({
        type: 'success',
        title: 'Task Completed! 🎉',
        message: `Great job completing "${task.title}"`,
      });
    }
  },
  
  // Categories
  categories: sampleCategories,
  
  addCategory: (categoryData) => {
    const newCategory: Category = {
      ...categoryData,
      id: uuidv4(),
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },
  
  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    }));
  },
  
  // Workspaces
  workspaces: sampleWorkspaces,
  currentWorkspace: sampleWorkspaces[0],
  
  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace });
    if (get().apiStatus === 'online') {
      void get().refreshWorkspaceData(workspace.id);
    }
  },
  
  addWorkspace: (workspaceData) => {
    const newWorkspace: Workspace = {
      ...workspaceData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      workspaces: [...state.workspaces, newWorkspace],
      currentWorkspace: newWorkspace,
    }));
  },
  
  // Activities
  activities: sampleActivities,
  
  addActivity: (activityData) => {
    const newActivity: Activity = {
      ...activityData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      activities: [newActivity, ...state.activities].slice(0, 50),
    }));
  },
  
  // Notifications
  notifications: [],
  
  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 20),
    }));
  },
  
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
  
  // UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  filterCategory: null,
  setFilterCategory: (categoryId) => set({ filterCategory: categoryId }),
  
  filterPriority: null,
  setFilterPriority: (priority) => set({ filterPriority: priority }),
}));
