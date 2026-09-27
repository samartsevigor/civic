import type { IssueStatus } from './types/issue';

export const STATUS_COLORS: Record<IssueStatus, string> = {
  reported: '#EF4444',
  verified: '#3B82F6',
  sent_to_org: '#8B5CF6',
  in_progress: '#F59E0B',
  resolved: '#10B981',
  rejected: '#9CA3AF',
  blocked: '#9CA3AF',
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  reported: 'Reported',
  verified: 'Verified',
  sent_to_org: 'Sent to org',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  blocked: 'Hidden',
};

export const STATUS_WORKFLOW: IssueStatus[] = [
  'reported',
  'verified',
  'sent_to_org',
  'in_progress',
  'resolved',
];
