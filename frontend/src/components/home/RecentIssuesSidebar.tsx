'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { CategoryFilter } from '@/components/filters/CategoryFilter';
import { StatusFilter } from '@/components/filters/StatusFilter';
import { RecentIssueCard } from '@/components/home/RecentIssueCard';
import type { CategoryFilterKey, Issue, StatusFilterKey } from '@/lib/types/issue';

interface RecentIssuesSidebarProps {
  issues: Issue[];
  selectedIssueId: string | null;
  categoryFilter: CategoryFilterKey;
  statusFilter: StatusFilterKey;
  total: number;
  resolved: number;
  loading: boolean;
  error: string | null;
  onCategoryChange: (value: CategoryFilterKey) => void;
  onStatusChange: (value: StatusFilterKey) => void;
  onSelectIssue: (issue: Issue) => void;
  onReportClick: () => void;
}

export function RecentIssuesSidebar({
  issues,
  selectedIssueId,
  categoryFilter,
  statusFilter,
  total,
  resolved,
  loading,
  error,
  onCategoryChange,
  onStatusChange,
  onSelectIssue,
  onReportClick,
}: RecentIssuesSidebarProps) {
  const latest = [...issues].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white md:w-[380px] md:max-w-[40vw]">
      <div className="space-y-3 border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              FixMap Fredericton
            </p>
            <p className="text-sm text-slate-600">
              {total} reports · {resolved} resolved
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Admin
          </Link>
        </div>
        <CategoryFilter value={categoryFilter} onChange={onCategoryChange} />
        <StatusFilter value={statusFilter} onChange={onStatusChange} />
        {loading ? <p className="text-xs text-slate-500">Updating feed…</p> : null}
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Latest reports
        </p>
        <div className="space-y-2">
          {latest.map((issue) => (
            <RecentIssueCard
              key={issue.id}
              issue={issue}
              selected={issue.id === selectedIssueId}
              onSelect={onSelectIssue}
            />
          ))}
          {latest.length === 0 && !loading ? (
            <p className="px-1 text-sm text-slate-500">No reports match these filters.</p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={onReportClick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" />
          Report Problem
        </button>
      </div>
    </aside>
  );
}
