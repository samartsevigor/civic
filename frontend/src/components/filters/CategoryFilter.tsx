'use client';

import type { CategoryFilterKey } from '@/lib/types/issue';

const FILTERS: { key: CategoryFilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pothole', label: 'Roads' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'garbage', label: 'Garbage' },
  { key: 'sidewalk', label: 'Sidewalk' },
  { key: 'traffic_light', label: 'Traffic' },
];

interface CategoryFilterProps {
  value: CategoryFilterKey;
  onChange: (value: CategoryFilterKey) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTERS.map((filter) => {
        const active = value === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChange(filter.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white/90 text-slate-700 ring-1 ring-slate-200 hover:bg-white'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
