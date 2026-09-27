'use client';

import { useEffect, useState } from 'react';
import { getIssueStats } from '@/lib/api-client';
import type { IssueStats } from '@/lib/types/issue';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/issue-colors';

interface AdminAnalyticsProps {
  adminKey: string;
}

export function AdminAnalytics({ adminKey }: AdminAnalyticsProps) {
  const [stats, setStats] = useState<IssueStats | null>(null);

  useEffect(() => {
    void getIssueStats(adminKey)
      .then(setStats)
      .catch(() => setStats(null));
  }, [adminKey]);

  if (!stats) {
    return (
      <div className="border-b p-4 text-sm text-slate-500">Loading analytics…</div>
    );
  }

  const statusEntries = Object.entries(stats.byStatus);
  const maxStatus = Math.max(...statusEntries.map(([, count]) => count), 1);

  return (
    <div className="space-y-4 border-b p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Overview</p>
        <p className="text-2xl font-semibold text-slate-900">{stats.total} total reports</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          By status
        </p>
        {statusEntries.map(([status, count]) => (
          <div key={status}>
            <div className="mb-1 flex justify-between text-xs text-slate-600">
              <span>{STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}</span>
              <span>{count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(count / maxStatus) * 100}%`,
                  backgroundColor:
                    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? '#64748B',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
