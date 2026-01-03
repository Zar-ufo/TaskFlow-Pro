import { useState } from 'react';
import { X, Calendar, Tag, Flag, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Priority, TaskStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskModalProps {
  onClose: () => void;
  editTask?: {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    categoryId: string;
    dueDate: string | null;
    tags: string[];
  };
}

export default function TaskModal({ onClose, editTask }: TaskModalProps) {
  const { categories, currentWorkspace, addTask, updateTask } = useStore();

  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [priority, setPriority] = useState<Priority>(editTask?.priority || 'medium');
  const [categoryId, setCategoryId] = useState(editTask?.categoryId || categories[0]?.id || '');
  const [dueDate, setDueDate] = useState(editTask?.dueDate || '');
  const [tags, setTags] = useState<string[]>(editTask?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!editTask) {
      if (!currentWorkspace?.id) return;
      if (!categoryId) return;
    }

    if (editTask) {
      updateTask(editTask.id, {
        title,
        description,
        priority,
        categoryId,
        dueDate: dueDate || null,
        tags,
      });
    } else {
      addTask({
        title,
        description,
        status: 'todo' as TaskStatus,
        priority,
        categoryId,
        dueDate: dueDate || null,
        assigneeId: null,
        tags,
        subtasks,
        progress: 0,
        workspaceId: currentWorkspace!.id,
      });
    }

    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addSubtaskItem = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        { id: uuidv4(), title: newSubtask.trim(), completed: false },
      ]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: 'bg-success-500' },
    { value: 'medium', label: 'Medium', color: 'bg-primary-500' },
    { value: 'high', label: 'High', color: 'bg-warning-500' },
    { value: 'urgent', label: 'Urgent', color: 'bg-danger-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {editTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-4 py-3 rounded-xl"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl resize-none"
            />
          </div>

          {/* Priority & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Flag className="w-4 h-4 inline mr-2" />
                Priority
              </label>
              <div className="flex gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      priority === option.value
                        ? `${option.color} text-white`
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtasks */}
          {!editTask && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subtasks
              </label>
              <div className="space-y-2 mb-3">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-slate-500" />
                    <span className="flex-1 text-sm text-slate-300">{subtask.title}</span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(subtask.id)}
                      className="p-1 hover:text-danger-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addSubtaskItem())
                  }
                  placeholder="Add a subtask..."
                  className="flex-1 px-4 py-2 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={addSubtaskItem}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {editTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
