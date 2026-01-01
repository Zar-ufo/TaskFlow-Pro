import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { computeStats } from '../utils/stats';
import { CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import ActivityFeed from '../components/ActivityFeed';
import { isToday, isPast } from 'date-fns';

export default function Dashboard() {
  const { tasks, categories, currentWorkspace } = useStore();

  const workspaceTasks = useMemo(() => {
    const wsId = currentWorkspace?.id;
    return wsId ? tasks.filter((t) => t.workspaceId === wsId) : tasks;
  }, [currentWorkspace?.id, tasks]);

  const stats = useMemo(() => computeStats(workspaceTasks, categories), [workspaceTasks, categories]);

  const todaysFocus = useMemo(() => {
    return workspaceTasks
      .filter((t) => t.status !== 'completed')
      .filter((t) => (t.dueDate ? isToday(new Date(t.dueDate)) : false))
      .slice(0, 5);
  }, [workspaceTasks]);

  const overdue = useMemo(() => {
    return workspaceTasks
      .filter((t) => t.status !== 'completed')
      .filter((t) => (t.dueDate ? isPast(new Date(t.dueDate)) : false))
      .slice(0, 5);
  }, [workspaceTasks]);

  const maxWeekly = Math.max(1, ...stats.weeklyProgress);

  const cards = [
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      icon: ListTodo,
      color: 'from-primary-600 to-primary-500',
    },
    {
      label: 'Completed',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'from-success-600 to-success-500',
    },
    {
      label: 'In Progress',
      value: stats.inProgressTasks,
      icon: Clock,
      color: 'from-accent-600 to-accent-500',
    },
    {
      label: 'Overdue',
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'from-warning-600 to-warning-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Smart overview of your tasks and progress.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{c.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{c.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}
              >
                <c.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Weekly Progress</h3>
          <span className="text-xs text-slate-500">Completed tasks per day</span>
        </div>
        <div className="grid grid-cols-7 gap-2 items-end h-24">
          {stats.weeklyProgress.map((v, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-lg bg-gradient-to-t from-primary-600 to-accent-500"
                style={{ height: `${Math.max(6, (v / maxWeekly) * 96)}px` }}
                title={`${v} completed`}
              />
              <span className="text-[10px] text-slate-500">{['M','T','W','T','F','S','S'][idx]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Focus + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Today’s Focus</h3>
            <div className="space-y-3">
              {todaysFocus.length === 0 ? (
                <p className="text-sm text-slate-400">No tasks due today.</p>
              ) : (
                todaysFocus.map((t) => <TaskCard key={t.id} task={t} />)
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-4">Overdue</h3>
            <div className="space-y-3">
              {overdue.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing overdue. Nice.</p>
              ) : (
                overdue.map((t) => <TaskCard key={t.id} task={t} />)
              )}
            </div>
          </div>
        </div>

        <ActivityFeed workspaceId={currentWorkspace?.id} />
      </div>
    </div>
  );
}
