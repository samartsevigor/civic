export type IssueStatus =
  | 'reported'
  | 'verified'
  | 'sent_to_org'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'blocked';

export type IssueCategory =
  | 'pothole'
  | 'lighting'
  | 'garbage'
  | 'sidewalk'
  | 'traffic_light'
  | 'other';

export interface Issue {
  id: string;
  title: string;
  description?: string | null;
  category: IssueCategory;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  address?: string | null;
  image_url?: string | null;
  confirmations: number;
  created_at: string;
}

export type CategoryFilterKey =
  | 'all'
  | 'pothole'
  | 'lighting'
  | 'garbage'
  | 'sidewalk'
  | 'traffic_light';

export type StatusFilterKey = 'all' | IssueStatus;

export interface CreateIssueResponse {
  issue: Issue;
  nearbyIssues: Issue[];
}

export interface IssueStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}
