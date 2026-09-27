'use client';

import { IssueImage } from '@/components/ui/IssueImage';
import type { Issue } from '@/lib/types/issue';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/issue-colors';

interface RecentIssueCardProps {
  issue: Issue;
  selected: boolean;
  onSelect: (issue: Issue) => void;
  compact?: boolean;
}

export function RecentIssueCard({
  issue,
  selected,
  onSelect,
  compact = false,
}: RecentIssueCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(issue)}
      className={`flex w-full shrink-0 overflow-hidden rounded-xl border text-left transition ${
        selected
          ? 'border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-200'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      } ${compact ? 'min-w-[260px] max-w-[260px]' : ''}`}
    >
      <IssueImage
        src={issue.image_url}
        alt={issue.title}
        className={`shrink-0 object-cover ${compact ? 'h-20 w-20' : 'h-24 w-24'}`}
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-2.5">
        <span
          className="w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: STATUS_COLORS[issue.status] }}
        >
          {STATUS_LABELS[issue.status]}
        </span>
        <p className="line-clamp-2 text-sm font-medium leading-tight text-slate-900">
          {issue.title}
        </p>
        <p className="text-xs text-slate-500">
          {issue.confirmations} confirms · {formatRelativeTime(issue.created_at)}
        </p>
      </div>
    </button>
  );
}
