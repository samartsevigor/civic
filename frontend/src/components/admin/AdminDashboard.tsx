'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { AdminIssueCard } from '@/components/admin/AdminIssueCard';
import { AdminIssueList } from '@/components/admin/AdminIssueList';
import { getIssues } from '@/lib/api-client';
import type { Issue } from '@/lib/types/issue';

const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-full bg-slate-100" /> },
);

interface AdminDashboardProps {
  adminKey: string;
}

export function AdminDashboard({ adminKey }: AdminDashboardProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadIssues = useCallback(async () => {
    setError(null);
    try {
      const data = await getIssues({ includeRejected: true, adminKey });
      setIssues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    }
  }, [adminKey]);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues]);

  function handleUpdated(issue: Issue) {
    setIssues((prev) => prev.map((item) => (item.id === issue.id ? issue : item)));
    setSelected(issue);
  }

  function handleDeleted(id: string) {
    setIssues((prev) => prev.filter((item) => item.id !== id));
    setSelected(null);
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-white md:flex-row">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h1 className="text-lg font-semibold">FixMap Admin</h1>
          <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline">
            Public map
          </Link>
        </div>
        <div className="min-h-[50vh] flex-1 md:min-h-0">
          <MapView
            issues={issues}
            onIssueSelect={setSelected}
            dimRejected
            className="h-full w-full"
          />
        </div>
        {error ? <p className="px-4 py-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <aside className="flex w-full flex-col border-t border-slate-200 md:w-[420px] md:border-l md:border-t-0">
        <AdminAnalytics adminKey={adminKey} />
        <AdminIssueList
          issues={issues}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
        />
        <div className="min-h-0 flex-1">
          <AdminIssueCard
            issue={selected}
            adminKey={adminKey}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
        </div>
      </aside>
    </div>
  );
}
