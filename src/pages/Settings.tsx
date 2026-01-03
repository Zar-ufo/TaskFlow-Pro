import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Settings() {
  const { currentUser, logout, resendVerification } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Account and workspace preferences.</p>
      </div>

      <div className="card">
        <h2 className="text-white font-semibold">Account</h2>
        {currentUser && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="text-slate-300">
              <span className="text-slate-500">Email:</span> {currentUser.email}
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500">Verified:</span>{' '}
              {currentUser.emailVerified ? 'Yes' : 'No'}
            </div>
            {!currentUser.emailVerified && (
              <button onClick={() => void resendVerification()} className="btn btn-secondary">
                Resend verification email
              </button>
            )}
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>

            {currentUser.role === 'admin' && (
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-white font-semibold">Admin</h3>
                <Link to="/admin/users" className="btn btn-secondary mt-2 inline-flex">
                  View all users
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
