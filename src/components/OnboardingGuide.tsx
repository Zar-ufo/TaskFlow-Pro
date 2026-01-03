import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';

function storageKey(userId: string) {
  return `taskflow_onboarding_skipped_${userId}`;
}

export default function OnboardingGuide() {
  const { currentUser } = useStore();
  const key = useMemo(() => (currentUser ? storageKey(currentUser.id) : null), [currentUser]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!currentUser || !key) return;
    try {
      const skipped = localStorage.getItem(key) === '1';
      setOpen(!skipped);
    } catch {
      setOpen(true);
    }
  }, [currentUser, key]);

  if (!currentUser || !open) return null;

  function close(skip: boolean) {
    if (skip && key) {
      try {
        localStorage.setItem(key, '1');
      } catch {
        // ignore
      }
    }
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50">
      <div className="w-full max-w-lg glass rounded-2xl p-6 border border-primary-500/20">
        <h2 className="text-white font-semibold text-lg">Welcome to TaskFlow</h2>
        <p className="text-slate-300 text-sm mt-2">
          Quick guide to get started (you can skip this anytime).
        </p>

        <div className="mt-4 space-y-3 text-slate-200 text-sm">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-medium text-white">1) Pick a workspace</div>
            <div className="text-slate-400">Use the left sidebar to switch workspaces.</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-medium text-white">2) Create your first task</div>
            <div className="text-slate-400">Click “New Task” in the top bar and fill in title, category, status.</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-medium text-white">3) Keep things organized</div>
            <div className="text-slate-400">Move tasks across statuses and update due dates to stay on track.</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="font-medium text-white">4) Verify your email</div>
            <div className="text-slate-400">Use the “Verify email (Resend)” button in the header if needed.</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/10"
            onClick={() => close(true)}
          >
            Skip
          </button>
          <button className="btn btn-primary" onClick={() => close(true)}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
