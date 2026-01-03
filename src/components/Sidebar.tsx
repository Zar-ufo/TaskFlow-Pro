import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FolderKanban,
} from 'lucide-react';
import { useStore } from '../store/useStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/workspace', icon: Users, label: 'Workspace' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, workspaces, currentWorkspace, setCurrentWorkspace } = useStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full glass border-r border-primary-500/20 transition-all duration-300 z-50 flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-primary-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg gradient-text">TaskFlow</h1>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600/50 to-accent-600/30 text-white shadow-glow'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-medium animate-fade-in">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Workspaces */}
      {sidebarOpen && (
        <div className="p-4 border-t border-primary-500/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <FolderKanban className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Workspaces</span>
          </div>
          <div className="space-y-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setCurrentWorkspace(workspace)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
                  currentWorkspace?.id === workspace.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: workspace.color }}
                />
                <span className="text-sm truncate">{workspace.name}</span>
                <span className="ml-auto text-xs text-slate-500">
                  {workspace.members.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="p-4 border-t border-primary-500/20">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          {sidebarOpen && <span className="font-medium">Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
