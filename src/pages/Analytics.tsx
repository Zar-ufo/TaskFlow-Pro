import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { computeStats } from '../utils/stats';

export default function Analytics() {
  const { tasks, categories, currentWorkspace } = useStore();

  const workspaceTasks = useMemo(() => {
    const wsId = currentWorkspace?.id;
    return wsId ? tasks.filter((t) => t.workspaceId === wsId) : tasks;
  }, [currentWorkspace?.id, tasks]);

  const stats = useMemo(() => computeStats(workspaceTasks, categories), [workspaceTasks, categories]);

  const completionRate = stats.totalTasks === 0 ? 0 : Math.round((stats.completedTasks / stats.totalTasks) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Progress tracking and insights.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-1">
          <h3 className="font-semibold text-white mb-4">Completion Rate</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-5xl font-bold gradient-text">{completionRate}%</p>
              <p className="text-sm text-slate-400 mt-2">
                {stats.completedTasks} of {stats.totalTasks} tasks completed
              </p>
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="card xl:col-span-2">
          <h3 className="font-semibold text-white mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400">No tasks yet.</p>
            ) : (
              stats.categoryBreakdown.map((c) => {
                const pct = stats.totalTasks === 0 ? 0 : Math.round((c.count / stats.totalTasks) * 100);
                return (
                  <div key={c.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-sm text-white">{c.category}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {c.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
