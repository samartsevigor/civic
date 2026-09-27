'use client';

import { useState } from 'react';
import { IssueImage } from '@/components/ui/IssueImage';
import { StatusTimeline } from '@/components/issue/StatusTimeline';
import type { Issue, IssueStatus } from '@/lib/types/issue';
import { deleteIssue, updateIssueStatus } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/issue-colors';

interface AdminIssueCardProps {
  issue: Issue | null;
  adminKey: string;
  onUpdated: (issue: Issue) => void;
  onDeleted: (id: string) => void;
}

const QUICK_STATUSES: { status: IssueStatus; label: string; className: string }[] = [
  { status: 'verified', label: 'Mark Verified', className: 'bg-blue-600 text-white' },
  { status: 'sent_to_org', label: 'Send to Org', className: 'bg-violet-600 text-white' },
  { status: 'in_progress', label: 'In Progress', className: 'bg-amber-500 text-white' },
  { status: 'resolved', label: 'Mark Resolved', className: 'bg-emerald-600 text-white' },
];

export function AdminIssueCard({
  issue,
  adminKey,
  onUpdated,
  onDeleted,
}: AdminIssueCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!issue) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
        Select an issue on the map or inbox
      </div>
    );
  }

  async function runStatusUpdate(status: IssueStatus) {
    setLoading(true);
    setError(null);
    const previous = issue!;
    onUpdated({ ...previous, status });

    try {
      const updated = await updateIssueStatus(previous.id, status, adminKey);
      onUpdated(updated);
    } catch (err) {
      onUpdated(previous);
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  async function runDelete() {
    setLoading(true);
    setError(null);
    try {
      await deleteIssue(issue!.id, adminKey);
      onDeleted(issue!.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <IssueImage src={issue.image_url} alt={issue.title} className="h-44 w-full object-cover" />

      <div className="space-y-3 p-4">
        <StatusTimeline status={issue.status} />
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: STATUS_COLORS[issue.status] }}
        >
          {STATUS_LABELS[issue.status]}
        </span>
        <h2 className="text-lg font-semibold text-slate-900">{issue.title}</h2>
        <p className="text-xs text-slate-500">{formatRelativeTime(issue.created_at)}</p>
        {issue.description ? (
          <p className="text-sm text-slate-600">{issue.description}</p>
        ) : null}
        <p className="text-sm text-slate-700">{issue.confirmations} confirmations</p>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="space-y-2 pt-2">
          {QUICK_STATUSES.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={loading}
              onClick={() => runStatusUpdate(action.status)}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 ${action.className}`}
            >
              {action.label}
            </button>
          ))}
          <button
            type="button"
            disabled={loading}
            onClick={() => runStatusUpdate('rejected')}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
          >
            Mark as Duplicate / Reject
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={runDelete}
            className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
