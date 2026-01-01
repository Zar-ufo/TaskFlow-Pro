import { useEffect, useMemo } from 'react';
import { Users, Circle } from 'lucide-react';
import { useStore } from '../store/useStore';
import ActivityFeed from '../components/ActivityFeed';

export default function Workspace() {
  const { currentWorkspace, addActivity, apiStatus } = useStore();

  // Simulated “real-time updates”: add an activity periodically.
  useEffect(() => {
    if (!currentWorkspace) return;
    if (apiStatus === 'online') return;

    const messages = [
      'A teammate updated a task status',
      'New comment added on a task',
      'Progress updated on a task',
    ];

    const id = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      addActivity({
        type: 'task_updated',
        userId: '2',
        workspaceId: currentWorkspace.id,
        message: msg,
      });
    }, 12000);

    return () => clearInterval(id);
  }, [addActivity, apiStatus, currentWorkspace]);

  const members = useMemo(() => currentWorkspace?.members ?? [], [currentWorkspace]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Workspace</h1>
          <p className="text-slate-400 mt-1">Collaborate with real-time updates.</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Circle className="w-3 h-3 text-success-400 pulse-live" />
          <span className="text-sm">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Members */}
        <div className="card xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5" /> Members
            </h3>
            <span className="text-xs text-slate-500">{members.length}</span>
          </div>

          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                  {m.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.name}</p>
                  <p className="text-xs text-slate-500 truncate">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.status === 'online'
                        ? 'bg-success-500'
                        : m.status === 'away'
                        ? 'bg-warning-500'
                        : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-xs text-slate-400 capitalize">{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="xl:col-span-2">
          <ActivityFeed workspaceId={currentWorkspace?.id} limit={15} />
        </div>
      </div>
    </div>
  );
}
