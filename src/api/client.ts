const DEFAULT_BASE = 'http://localhost:4000/api';

export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? DEFAULT_BASE;

const TOKEN_KEY = 'taskflow_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
  }

  // 204
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export const api = {
  health: () => request<{ ok: boolean }>(`/health`),

  signup: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: any }>(`/auth/signup`, { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: any }>(`/auth/login`, { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<{ user: any }>(`/auth/me`),
  verifyEmail: (token: string) => request<{ ok: boolean }>(`/auth/verify?token=${encodeURIComponent(token)}`),
  resendVerification: (email?: string) =>
    request<{ ok: boolean; message?: string }>(`/auth/resend-verification`, {
      method: 'POST',
      body: JSON.stringify(email ? { email } : {}),
    }),

  listWorkspaces: () => request<any[]>(`/workspaces`),
  listCategories: (workspaceId?: string) =>
    request<any[]>(`/categories${workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''}`),
  listTasks: (workspaceId?: string) =>
    request<any[]>(`/tasks${workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''}`),
  listActivities: (workspaceId?: string) =>
    request<any[]>(`/activities${workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''}`),

  adminListUsers: () => request<any[]>(`/admin/users`),

  createTask: (body: unknown) => request<any>(`/tasks`, { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: string, body: unknown) =>
    request<any>(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (id: string) =>
    request<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
