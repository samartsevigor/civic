'use client';

import type { StatusFilterKey } from '@/lib/types/issue';
import { STATUS_LABELS } from '@/lib/issue-colors';

const FILTERS: { key: StatusFilterKey; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'reported', label: STATUS_LABELS.reported },
  { key: 'in_progress', label: STATUS_LABELS.in_progress },
  { key: 'resolved', label: STATUS_LABELS.resolved },
];

interface StatusFilterProps {
  value: StatusFilterKey;
  onChange: (value: StatusFilterKey) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((filter) => {
        const active = value === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChange(filter.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              active
                ? 'bg-slate-900 text-white'
                : 'bg-white/90 text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
