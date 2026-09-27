export enum IssueStatus {
  REPORTED = 'reported',
  VERIFIED = 'verified',
  SENT_TO_ORG = 'sent_to_org',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  BLOCKED = 'blocked',
}

export enum IssueCategory {
  POTHOLE = 'pothole',
  LIGHTING = 'lighting',
  GARBAGE = 'garbage',
  SIDEWALK = 'sidewalk',
  TRAFFIC_LIGHT = 'traffic_light',
  OTHER = 'other',
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.POTHOLE]: 'Pothole',
  [IssueCategory.LIGHTING]: 'Lighting',
  [IssueCategory.GARBAGE]: 'Garbage',
  [IssueCategory.SIDEWALK]: 'Sidewalk',
  [IssueCategory.TRAFFIC_LIGHT]: 'Traffic light',
  [IssueCategory.OTHER]: 'Other',
};

export const STATUS_WORKFLOW: IssueStatus[] = [
  IssueStatus.REPORTED,
  IssueStatus.VERIFIED,
  IssueStatus.SENT_TO_ORG,
  IssueStatus.IN_PROGRESS,
  IssueStatus.RESOLVED,
];
