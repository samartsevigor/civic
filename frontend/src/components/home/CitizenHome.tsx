'use client';

import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryFilter } from '@/components/filters/CategoryFilter';
import { StatusFilter } from '@/components/filters/StatusFilter';
import { RecentIssuesMobileStrip } from '@/components/home/RecentIssuesMobileStrip';
import { RecentIssuesSidebar } from '@/components/home/RecentIssuesSidebar';
import { IssueDetailsModal } from '@/components/issue/IssueDetailsModal';
import { ReportModal } from '@/components/report/ReportModal';
import { getIssue, getIssues } from '@/lib/api-client';
import type { CategoryFilterKey, Issue, StatusFilterKey } from '@/lib/types/issue';

const MapView = dynamic(
  () => import('@/components/map/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
        Loading map…
      </div>
    ),
  },
);

interface CitizenHomeProps {
  initialIssueId?: string;
}

export function CitizenHome({ initialIssueId }: CitizenHomeProps) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterKey>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryParam = categoryFilter === 'all' ? undefined : categoryFilter;
  const statusParam = statusFilter === 'all' ? undefined : statusFilter;

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIssues({ category: categoryParam, status: statusParam });
      setIssues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [categoryParam, statusParam]);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    if (!initialIssueId) return;

    void getIssue(initialIssueId)
      .then((issue) => {
        setSelectedIssue(issue);
        setIssues((prev) => {
          if (prev.some((row) => row.id === issue.id)) return prev;
          return [issue, ...prev];
        });
      })
      .catch(() => {
        setError('Shared issue link is invalid or unavailable');
      });
  }, [initialIssueId]);

  const stats = useMemo(() => {
    return {
      total: issues.length,
      resolved: issues.filter((issue) => issue.status === 'resolved').length,
    };
  }, [issues]);

  function handleIssueUpdated(updated: Issue) {
    setIssues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedIssue(updated);
  }

  function handleIssueCreated(issue: Issue) {
    setIssues((prev) => [issue, ...prev]);
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-100 md:flex-row">
      <div className="hidden shrink-0 md:flex md:h-full">
        <RecentIssuesSidebar
          issues={issues}
          selectedIssueId={selectedIssue?.id ?? null}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          total={stats.total}
          resolved={stats.resolved}
          loading={loading}
          error={error}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
          onSelectIssue={setSelectedIssue}
          onReportClick={() => setReportOpen(true)}
        />
      </div>

      <div className="relative min-h-0 flex-1">
        <MapView issues={issues} onIssueSelect={setSelectedIssue} />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[400] space-y-2 p-3 md:hidden">
          <div className="pointer-events-auto space-y-2 rounded-xl bg-white/95 p-3 shadow-sm ring-1 ring-slate-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                FixMap Fredericton
              </p>
              <p className="text-sm text-slate-600">
                {stats.total} reports · {stats.resolved} resolved
              </p>
            </div>
            <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="absolute bottom-[148px] left-1/2 z-[500] inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 md:bottom-6"
        >
          <Plus className="h-5 w-5" />
          Report
        </button>

        <RecentIssuesMobileStrip
          issues={issues}
          selectedIssueId={selectedIssue?.id ?? null}
          onSelectIssue={setSelectedIssue}
        />
      </div>

      <IssueDetailsModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdated={handleIssueUpdated}
      />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onCreated={handleIssueCreated}
      />
    </div>
  );
}
