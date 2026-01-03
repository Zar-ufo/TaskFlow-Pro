import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useStore } from '../store/useStore';

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
};

export default function AdminUsers() {
  const { currentUser } = useStore();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = (await api.adminListUsers()) as AdminUserRow[];
        setUsers(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load users');
      }
    })();
  }, []);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="glass rounded-2xl p-6 border border-primary-500/20">
        <h2 className="text-white font-semibold">Admin</h2>
        <p className="text-slate-400 mt-2">You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 border border-primary-500/20">
        <h2 className="text-white font-semibold text-lg">Users</h2>
        <p className="text-slate-400 text-sm">All verified and non-verified users.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-200 text-sm">
          {error}
        </div>
      )}

      <div className="glass rounded-2xl border border-primary-500/20 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Verified</th>
                <th className="text-left px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="text-slate-200">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.emailVerified ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
