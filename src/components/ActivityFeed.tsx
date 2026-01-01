import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, Edit3, MessageCircle, UserPlus, Plus } from 'lucide-react';

interface ActivityFeedProps {
  workspaceId?: string;
  limit?: number;
}

export default function ActivityFeed({ workspaceId, limit = 10 }: ActivityFeedProps) {
  const { activities, workspaces } = useStore();

  const filtered = useMemo(() => {
    const list = workspaceId
      ? activities.filter((a) => a.workspaceId === workspaceId)
      : activities;
    return list.slice(0, limit);
  }, [activities, limit, workspaceId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-success-400" />;
      case 'task_updated':
        return <Edit3 className="w-4 h-4 text-primary-400" />;
      case 'comment_added':
        return <MessageCircle className="w-4 h-4 text-accent-400" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-warning-400" />;
      default:
        return <Plus className="w-4 h-4 text-slate-400" />;
    }
  };

  const workspaceName = workspaceId
    ? workspaces.find((w) => w.id === workspaceId)?.name
    : undefined;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Activity</h3>
        {workspaceName && <span className="text-xs text-slate-500">{workspaceName}</span>}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400">No recent activity.</p>
        ) : (
          filtered.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200">{activity.message}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
