import type { Issue, IssueCategory, IssueStatus } from './types/issue';
import { formatRelativeTime } from './format-relative-time';

export const CATEGORY_META: Record<
  IssueCategory,
  { icon: string; label: string; filter: string; className: string }
> = {
  pothole: { icon: '⌁', label: 'Road or pothole', filter: 'Roads', className: 'road' },
  garbage: { icon: '♻', label: 'Waste or litter', filter: 'Waste', className: 'waste' },
  lighting: { icon: '☼', label: 'Street lighting', filter: 'Lighting', className: 'light' },
  sidewalk: { icon: '▤', label: 'Sidewalk', filter: 'Sidewalks', className: 'walk' },
  traffic_light: { icon: '◈', label: 'Traffic light', filter: 'Traffic', className: 'light' },
  other: { icon: '⋯', label: 'Something else', filter: 'Other', className: 'park' },
};

export const FILTERS = ['All', 'Roads', 'Waste', 'Lighting', 'Sidewalks', 'Traffic', 'Other'] as const;
export type CivicFilter = (typeof FILTERS)[number];

export function filterToCategory(filter: CivicFilter): IssueCategory | undefined {
  const match = Object.entries(CATEGORY_META).find(([, meta]) => meta.filter === filter);
  return match?.[0] as IssueCategory | undefined;
}

export function publicStatusLabel(status: IssueStatus): string {
  switch (status) {
    case 'reported':
      return 'New';
    case 'verified':
      return 'Verified';
    case 'sent_to_org':
      return 'Sent to org';
    case 'in_progress':
      return 'In progress';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    case 'blocked':
      return 'Hidden';
  }
}

export function statusBadgeClass(status: IssueStatus): string {
  if (status === 'in_progress' || status === 'sent_to_org') return 'progress';
  if (status === 'reported') return 'new';
  return status;
}

export function issuePlace(issue: Issue): string {
  return issue.address || `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`;
}

export function issueMeta(issue: Issue): string {
  return `${issuePlace(issue)} · ${formatRelativeTime(issue.created_at)} · ${issue.confirmations} confirmations`;
}
