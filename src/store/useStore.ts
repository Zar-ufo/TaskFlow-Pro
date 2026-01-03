import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, Category, Workspace, User, Activity, Notification, TaskStatus } from '../types';
import { api } from '../api/client';
import { getAuthToken, setAuthToken } from '../api/client';

interface AppState {
  // Current user
  authStatus: 'checking' | 'authenticated' | 'anonymous';
  token: string | null;
  currentUser: User | null;
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resendVerification: () => Promise<void>;
  
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

export const useStore = create<AppState>((set, get) => ({
  authStatus: 'checking',
  token: getAuthToken(),

  initAuth: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ authStatus: 'anonymous', token: null, currentUser: null });
      return;
    }
    set({ authStatus: 'checking', token });
    try {
      const me = await api.me();
      set({ authStatus: 'authenticated', currentUser: me.user as User });
    } catch {
      setAuthToken(null);
      set({ authStatus: 'anonymous', token: null, currentUser: null });
    }
  },

  login: async (email, password) => {
    const res = await api.login({ email, password });
    setAuthToken(res.token);
    set({ token: res.token, currentUser: res.user as User, authStatus: 'authenticated' });
    await get().checkApi();
  },

  signup: async (name, email, password) => {
    const res = await api.signup({ name, email, password });
    setAuthToken(res.token);
    set({ token: res.token, currentUser: res.user as User, authStatus: 'authenticated' });
    await get().checkApi();
  },

  logout: () => {
    setAuthToken(null);
    set({
      token: null,
      authStatus: 'anonymous',
      currentUser: null,
      workspaces: [],
      currentWorkspace: null,
      categories: [],
      tasks: [],
      activities: [],
    });
  },

  resendVerification: async () => {
    const user = get().currentUser;
    if (!user) return;
    try {
      await api.resendVerification(user.email);
      get().addNotification({
        type: 'success',
        title: 'Email Sent',
        message: 'Verification email resent. Check your inbox (or server console in dev).',
      });
    } catch (e) {
      get().addNotification({
        type: 'error',
        title: 'Resend Failed',
        message: e instanceof Error ? e.message : 'Failed to resend verification email',
      });
    }
  },

  // Backend connectivity
  apiStatus: 'checking',

  checkApi: async () => {
    try {
      await api.health();
      set({ apiStatus: 'online' });

      // Hydrate only when authenticated
      if (get().currentUser) {
        const workspaces = (await api.listWorkspaces()) as Workspace[];
        set({ workspaces, currentWorkspace: workspaces[0] ?? null });
        if (workspaces[0]) await get().refreshWorkspaceData(workspaces[0].id);
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
  currentUser: null,
  
  // Tasks
  tasks: [],
  
  addTask: (taskData) => {
    if (!get().currentUser) {
      get().addNotification({
        type: 'error',
        title: 'Login Required',
        message: 'Please log in to create tasks.',
      });
      return;
    }
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

    // Offline: no local sample mode
    get().addNotification({
      type: 'error',
      title: 'Offline',
      message: 'Backend is offline. Tasks cannot be created right now.',
    });
  },
  
  updateTask: (id, updates) => {
    if (!get().currentUser) return;
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
    get().addNotification({
      type: 'error',
      title: 'Offline',
      message: 'Backend is offline. Tasks cannot be updated right now.',
    });
  },
  
  deleteTask: (id) => {
    if (!get().currentUser) return;
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
    get().addNotification({
      type: 'error',
      title: 'Offline',
      message: 'Backend is offline. Tasks cannot be deleted right now.',
    });
  },
  
  moveTask: (id, status) => {
    if (!get().currentUser) return;
    if (get().apiStatus === 'online') {
      get().updateTask(id, { status });
      return;
    }
    get().addNotification({
      type: 'error',
      title: 'Offline',
      message: 'Backend is offline. Tasks cannot be moved right now.',
    });
  },
  
  // Categories
  categories: [],
  
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
  workspaces: [],
  currentWorkspace: null,
  
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
  activities: [],
  
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
