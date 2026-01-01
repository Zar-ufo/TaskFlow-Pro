const DEFAULT_BASE = 'http://localhost:4000/api';

export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? DEFAULT_BASE;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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

  listWorkspaces: () => request<any[]>(`/workspaces`),
  listCategories: (workspaceId?: string) =>
    request<any[]>(`/categories${workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''}`),
  listTasks: (workspaceId?: string) =>
    request<any[]>(`/tasks${workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''}`),
  listActivities: (workspaceId?: string) =>
    request<any[]>(`/activities${workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''}`),

  createTask: (body: unknown) => request<any>(`/tasks`, { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id: string, body: unknown) =>
    request<any>(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTask: (id: string) =>
    request<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
