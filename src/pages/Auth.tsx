import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup } = useStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass rounded-2xl p-6 border border-primary-500/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">TaskFlow</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('login')}
              className={`px-3 py-1 rounded-lg text-sm ${
                mode === 'login' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-3 py-1 rounded-lg text-sm ${
                mode === 'signup' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
              type="button"
            >
              Sign up
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-sm text-slate-300">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500 text-white"
                placeholder="Your name"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500 text-white"
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500 text-white"
              placeholder="••••••••"
              type="password"
              required
            />
          </div>

          <button disabled={busy} className="btn btn-primary w-full">
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>

          {mode === 'signup' && (
            <p className="text-xs text-slate-400">
              After signup, you’ll receive a verification email (in dev it’s printed in the server console).
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
