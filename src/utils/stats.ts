import { Task, Category, Stats } from '../types';
import { isPast, startOfWeek, addDays, isSameDay } from 'date-fns';

export function computeStats(tasks: Task[], categories: Category[]): Stats {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    if (t.status === 'completed') return false;
    return isPast(new Date(t.dueDate));
  }).length;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weeklyProgress = days.map((day) =>
    tasks.filter((t) => t.status === 'completed' && isSameDay(new Date(t.updatedAt), day)).length
  );

  const categoryBreakdown = categories
    .map((category) => ({
      category: category.name,
      color: category.color,
      count: tasks.filter((t) => t.categoryId === category.id).length,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    weeklyProgress,
    categoryBreakdown,
  };
}
