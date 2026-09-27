'use client';

import type { Issue } from '@/lib/types/issue';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/issue-colors';
import { formatRelativeTime } from '@/lib/format-relative-time';

interface AdminIssueListProps {
  issues: Issue[];
  selectedId: string | null;
  onSelect: (issue: Issue) => void;
}

export function AdminIssueList({
  issues,
  selectedId,
  onSelect,
}: AdminIssueListProps) {
  const sorted = [...issues].sort((a, b) => b.confirmations - a.confirmations);

  return (
    <div className="border-b">
      <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Inbox (by confirmations)
      </p>
      <ul className="max-h-56 overflow-y-auto p-2">
        {sorted.map((issue) => {
          const active = issue.id === selectedId;
          return (
            <li key={issue.id}>
              <button
                type="button"
                onClick={() => onSelect(issue)}
                className={`mb-1 w-full rounded-xl px-3 py-2 text-left text-sm ${
                  active ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 font-medium text-slate-900">{issue.title}</span>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: STATUS_COLORS[issue.status] }}
                  >
                    {STATUS_LABELS[issue.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {issue.confirmations} confirms · {formatRelativeTime(issue.created_at)}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
