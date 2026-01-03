import { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Sun,
  Moon,
  Filter,
  Command,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import TaskModal from './TaskModal';

export default function Header() {
  const {
    currentUser,
    resendVerification,
    searchQuery,
    setSearchQuery,
    notifications,
    currentWorkspace,
  } = useStore();
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!currentUser) return null;

  return (
    <>
      <header className="glass border-b border-primary-500/20 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Workspace info & Search */}
          <div className="flex items-center gap-6 flex-1">
            {/* Current workspace */}
            <div className="hidden md:flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: currentWorkspace?.color || '#6366f1' }}
              >
                {currentWorkspace?.name.charAt(0) || 'T'}
              </div>
              <div>
                <h2 className="font-semibold text-white">
                  {currentWorkspace?.name || 'TaskFlow'}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentWorkspace?.members.length || 0} members
                </p>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks, projects, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-20 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500 text-white placeholder:text-slate-500 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-500">
                <Command className="w-4 h-4" />
                <span className="text-xs">K</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {!currentUser.emailVerified && (
              <button
                onClick={() => void resendVerification()}
                className="px-3 py-2 rounded-xl bg-warning-500/10 border border-warning-500/30 text-warning-200 text-sm hover:bg-warning-500/20 transition-colors"
              >
                Verify email (Resend)
              </button>
            )}
            {/* Filter button */}
            <button className="p-3 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <Filter className="w-5 h-5" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 rounded-full text-xs font-bold flex items-center justify-center text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 glass rounded-xl shadow-xl animate-slide-down overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                            !notification.read ? 'bg-primary-500/10' : ''
                          }`}
                        >
                          <p className="text-sm text-white font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add task button */}
            <button
              onClick={() => setShowTaskModal(true)}
              className="btn btn-primary glow-primary"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Task</span>
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl">
                {currentUser.avatar}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Task Modal */}
      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
    </>
  );
}
