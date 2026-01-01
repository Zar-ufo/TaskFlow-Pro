import { useStore } from '../store/useStore';
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationPanel() {
  const { notifications, markNotificationRead } = useStore();
  
  const visibleNotifications = notifications.filter((n) => !n.read).slice(0, 3);
  
  if (visibleNotifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-success-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-danger-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />;
      default:
        return <Info className="w-5 h-5 text-primary-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-success-500/30 bg-success-500/10';
      case 'error':
        return 'border-danger-500/30 bg-danger-500/10';
      case 'warning':
        return 'border-warning-500/30 bg-warning-500/10';
      default:
        return 'border-primary-500/30 bg-primary-500/10';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`glass rounded-xl p-4 shadow-xl animate-slide-up border ${getBgColor(
            notification.type
          )}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">
                {notification.title}
              </p>
              <p className="text-slate-400 text-xs mt-1">{notification.message}</p>
              <p className="text-slate-500 text-xs mt-2">
                {formatDistanceToNow(new Date(notification.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <button
              onClick={() => markNotificationRead(notification.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
