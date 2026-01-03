import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Verify() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing token.');
        return;
      }
      try {
        await api.verifyEmail(token);
        setStatus('ok');
        setMessage('Email verified successfully.');
      } catch (e) {
        setStatus('error');
        setMessage(e instanceof Error ? e.message : 'Verification failed.');
      }
    })();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass rounded-2xl p-6 border border-primary-500/20">
        <h1 className="text-xl font-bold text-white mb-2">Verify Email</h1>
        <p className="text-slate-300 text-sm mb-6">
          {status === 'checking' ? 'Verifying…' : message}
        </p>
        <Link to="/auth" className="btn btn-primary w-full">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
