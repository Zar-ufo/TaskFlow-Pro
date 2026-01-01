import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { TaskStatus } from '../types';
import TaskCard from './TaskCard';

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'review', title: 'Review' },
  { status: 'completed', title: 'Completed' },
];

export default function KanbanBoard() {
  const {
    tasks,
    currentWorkspace,
    moveTask,
    searchQuery,
    filterCategory,
    filterPriority,
    categories,
    setFilterCategory,
    setFilterPriority,
  } = useStore();

  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const workspaceTasks = useMemo(() => {
    const wsId = currentWorkspace?.id;
    let list = wsId ? tasks.filter((t) => t.workspaceId === wsId) : tasks;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId)?.name ?? '';
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      });
    }

    if (filterCategory) {
      list = list.filter((t) => t.categoryId === filterCategory);
    }

    if (filterPriority) {
      list = list.filter((t) => t.priority === filterPriority);
    }

    return list;
  }, [categories, currentWorkspace?.id, filterCategory, filterPriority, searchQuery, tasks]);

  const onDragStart = (taskId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = (status: TaskStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) moveTask(taskId, status);
    setDragOverStatus(null);
  };

  const onDragOver = (status: TaskStatus) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const onDragLeave = () => setDragOverStatus(null);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterCategory ?? ''}
          onChange={(e) => setFilterCategory(e.target.value || null)}
          className="px-4 py-2 rounded-xl text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterPriority ?? ''}
          onChange={(e) => setFilterPriority(e.target.value || null)}
          className="px-4 py-2 rounded-xl text-sm"
        >
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {(filterCategory || filterPriority) && (
          <button
            onClick={() => {
              setFilterCategory(null);
              setFilterPriority(null);
            }}
            className="btn btn-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = workspaceTasks.filter((t) => t.status === col.status);
          const isTarget = dragOverStatus === col.status;

          return (
            <div
              key={col.status}
              onDragOver={onDragOver(col.status)}
              onDrop={onDrop(col.status)}
              onDragLeave={onDragLeave}
              className={`glass rounded-2xl p-4 min-h-[200px] transition-all ${
                isTarget ? 'drop-target' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{col.title}</h3>
                <span className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={onDragStart(task.id)}
                    className=""
                  >
                    <TaskCard task={task} />
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-sm text-slate-500 py-8 text-center">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
