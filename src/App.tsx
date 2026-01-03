import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Workspace from './pages/Workspace';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Verify from './pages/Verify';
import AdminUsers from './pages/AdminUsers';
import { useStore } from './store/useStore';

function ProtectedLayout() {
  const { authStatus } = useStore();

  if (authStatus === 'checking') return null;
  if (authStatus !== 'authenticated') return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  const { initAuth, checkApi } = useStore();

  useEffect(() => {
    void (async () => {
      await initAuth();
      await checkApi();
    })();
  }, [checkApi, initAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify" element={<Verify />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
