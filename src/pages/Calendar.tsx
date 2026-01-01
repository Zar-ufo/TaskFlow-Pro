import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import TaskCard from '../components/TaskCard';
import { isWithinInterval, startOfToday, addDays } from 'date-fns';

export default function Calendar() {
  const { tasks, currentWorkspace } = useStore();

  const workspaceTasks = useMemo(() => {
    const wsId = currentWorkspace?.id;
    return wsId ? tasks.filter((t) => t.workspaceId === wsId) : tasks;
  }, [currentWorkspace?.id, tasks]);

  const today = startOfToday();
  const next7 = addDays(today, 7);
  const next30 = addDays(today, 30);

  const dueThisWeek = useMemo(() => {
    return workspaceTasks
      .filter((t) => t.dueDate)
      .filter((t) =>
        isWithinInterval(new Date(t.dueDate as string), { start: today, end: next7 })
      )
      .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime());
  }, [next7, today, workspaceTasks]);

  const dueThisMonth = useMemo(() => {
    return workspaceTasks
      .filter((t) => t.dueDate)
      .filter((t) =>
        isWithinInterval(new Date(t.dueDate as string), { start: today, end: next30 })
      )
      .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime());
  }, [next30, today, workspaceTasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
        <p className="text-slate-400 mt-1">Deadlines and upcoming work at a glance.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Due in the next 7 days</h3>
          <div className="space-y-3">
            {dueThisWeek.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming deadlines this week.</p>
            ) : (
              dueThisWeek.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-white mb-4">Due in the next 30 days</h3>
          <div className="space-y-3">
            {dueThisMonth.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming deadlines this month.</p>
            ) : (
              dueThisMonth.map((t) => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
