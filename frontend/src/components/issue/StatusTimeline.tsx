'use client';

import type { IssueStatus } from '@/lib/types/issue';
import { STATUS_LABELS, STATUS_WORKFLOW } from '@/lib/issue-colors';

interface StatusTimelineProps {
  status: IssueStatus;
}

export function StatusTimeline({ status }: StatusTimelineProps) {
  if (status === 'blocked') {
    return (
      <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
        This photo was hidden after an automatic content check.
      </p>
    );
  }

  if (status === 'rejected') {
    return (
      <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
        This report was rejected as duplicate or invalid.
      </p>
    );
  }

  const currentIndex = STATUS_WORKFLOW.indexOf(status);

  return (
    <ol className="grid grid-cols-5 gap-1">
      {STATUS_WORKFLOW.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <li key={step} className="text-center">
            <div
              className={`mx-auto mb-1 h-2 w-2 rounded-full ${
                done ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            />
            <p
              className={`text-[10px] leading-tight ${
                done ? 'font-semibold text-slate-800' : 'text-slate-400'
              }`}
            >
              {STATUS_LABELS[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
