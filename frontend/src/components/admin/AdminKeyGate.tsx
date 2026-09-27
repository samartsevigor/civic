'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fixmap_admin_key';

interface AdminKeyGateProps {
  children: (adminKey: string) => React.ReactNode;
}

export function AdminKeyGate({ children }: AdminKeyGateProps) {
  const [adminKey, setAdminKey] = useState('');
  const [storedKey, setStoredKey] = useState<string | null>(null);

  useEffect(() => {
    setStoredKey(sessionStorage.getItem(STORAGE_KEY));
  }, []);

  if (storedKey) {
    return <>{children(storedKey)}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sessionStorage.setItem(STORAGE_KEY, adminKey);
          setStoredKey(adminKey);
        }}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow"
      >
        <h1 className="text-xl font-semibold text-slate-900">Admin access</h1>
        <p className="text-sm text-slate-600">
          Enter the admin API key configured on the backend (`ADMIN_API_KEY`).
        </p>
        <input
          type="password"
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          placeholder="Admin API key"
          required
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
