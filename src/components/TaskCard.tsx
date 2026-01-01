import { useMemo } from 'react';
import { Clock, AlertCircle, CheckCircle2, MoreVertical, Calendar } from 'lucide-react';
import { Task } from '../types';
import { useStore } from '../store/useStore';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export default function TaskCard({ task, compact = false }: TaskCardProps) {
  const { categories, moveTask } = useStore();

  const category = useMemo(
    () => categories.find((c) => c.id === task.categoryId),
    [categories, task.categoryId]
  );

  const priorityConfig = {
    urgent: { color: 'priority-urgent', label: 'Urgent' },
    high: { color: 'priority-high', label: 'High' },
    medium: { color: 'priority-medium', label: 'Medium' },
    low: { color: 'priority-low', label: 'Low' },
  };

  const statusConfig = {
    todo: { color: 'status-todo', label: 'To Do' },
    'in-progress': { color: 'status-in-progress', label: 'In Progress' },
    review: { color: 'status-review', label: 'Review' },
    completed: { color: 'status-completed', label: 'Completed' },
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const formatDueDate = (date: string) => {
    if (isToday(new Date(date))) return 'Today';
    if (isTomorrow(new Date(date))) return 'Tomorrow';
    return format(new Date(date), 'MMM d');
  };

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

  if (compact) {
    return (
      <div className="card group cursor-pointer">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${priorityConfig[task.priority].color}`}
          />
          <span className="flex-1 text-sm text-white truncate">{task.title}</span>
          {task.dueDate && (
            <span className={`text-xs ${isOverdue ? 'text-danger-400' : 'text-slate-500'}`}>
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card group cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {category && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.icon} {category.name}
            </span>
          )}
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              priorityConfig[task.priority].color
            } text-white`}
          >
            {priorityConfig[task.priority].label}
          </span>
        </div>
        <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all">
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Title & Description */}
      <h3 className="font-semibold text-white mb-2 line-clamp-2">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      )}

      {/* Progress bar */}
      {task.subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Progress</span>
            <span>
              {completedSubtasks}/{task.subtasks.length} subtasks
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-md bg-white/5 text-xs text-slate-400"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 rounded-md bg-white/5 text-xs text-slate-400">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        {/* Due date */}
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-xs ${
              isOverdue
                ? 'text-danger-400'
                : isDueToday
                ? 'text-warning-400'
                : 'text-slate-400'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            {formatDueDate(task.dueDate)}
          </div>
        )}

        {/* Status */}
        <span
          className={`px-2 py-1 rounded-lg text-xs font-medium ${
            statusConfig[task.status].color
          }`}
        >
          {statusConfig[task.status].label}
        </span>
      </div>

      {/* Quick actions on hover */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.status !== 'completed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveTask(task.id, 'completed');
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-success-500/20 text-success-400 text-xs font-medium hover:bg-success-500/30 transition-colors flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            Complete
          </button>
        )}
        {task.status === 'todo' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveTask(task.id, 'in-progress');
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium hover:bg-primary-500/30 transition-colors flex items-center justify-center gap-1"
          >
            <Clock className="w-3 h-3" />
            Start
          </button>
        )}
      </div>
    </div>
  );
}
