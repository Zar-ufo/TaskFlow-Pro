import KanbanBoard from '../components/KanbanBoard';

export default function Tasks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Tasks</h1>
        <p className="text-slate-400 mt-1">
          Smart categorization, drag-and-drop flow, and progress tracking.
        </p>
      </div>

      <KanbanBoard />
    </div>
  );
}
