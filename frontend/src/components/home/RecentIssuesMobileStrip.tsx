'use client';

import { RecentIssueCard } from '@/components/home/RecentIssueCard';
import type { Issue } from '@/lib/types/issue';

interface RecentIssuesMobileStripProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: Issue) => void;
}

export function RecentIssuesMobileStrip({
  issues,
  selectedIssueId,
  onSelectIssue,
}: RecentIssuesMobileStripProps) {
  const latest = [...issues]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);

  if (latest.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[500] border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Latest reports
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {latest.map((issue) => (
          <RecentIssueCard
            key={issue.id}
            issue={issue}
            selected={issue.id === selectedIssueId}
            onSelect={onSelectIssue}
            compact
          />
        ))}
      </div>
    </div>
  );
}
