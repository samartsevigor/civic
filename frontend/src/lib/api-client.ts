import { getDeviceId } from './device-id';
import { identityHeaders } from './session-token';
import type {
  CreateIssueResponse,
  Issue,
  IssueCategory,
  IssueStats,
  IssueStatus,
} from './types/issue';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    let message = text || response.statusText;
    try {
      const body = JSON.parse(text) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(', ');
      else if (body.message) message = body.message;
    } catch {
      // Keep the raw response when it is not JSON.
    }
    throw new ApiError(message, response.status);
  }
  return response.json() as Promise<T>;
}

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

export interface GetIssuesParams {
  category?: IssueCategory;
  status?: IssueStatus;
  includeRejected?: boolean;
  adminKey?: string;
}

export async function getIssues(params: GetIssuesParams = {}): Promise<Issue[]> {
  const search = new URLSearchParams();
  if (params.category) search.set('category', params.category);
  if (params.status) search.set('status', params.status);
  if (params.includeRejected) search.set('includeRejected', 'true');

  const headers: HeadersInit = {};
  if (params.adminKey) headers['X-Admin-Key'] = params.adminKey;

  const response = await fetch(`${API_URL}/issues?${search.toString()}`, {
    cache: 'no-store',
    headers,
  });

  return parseResponse<Issue[]>(response);
}

export async function getIssueStats(adminKey: string): Promise<IssueStats> {
  const response = await fetch(`${API_URL}/issues/meta/stats`, {
    cache: 'no-store',
    headers: { 'X-Admin-Key': adminKey },
  });
  return parseResponse<IssueStats>(response);
}

export async function getIssue(id: string): Promise<Issue> {
  const response = await fetch(`${API_URL}/issues/${id}`, { cache: 'no-store' });
  return parseResponse<Issue>(response);
}

export async function getNearbyIssues(
  latitude: number,
  longitude: number,
  category: IssueCategory,
): Promise<Issue[]> {
  const search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    category,
  });
  const response = await fetch(`${API_URL}/issues/nearby?${search.toString()}`, {
    cache: 'no-store',
  });
  return parseResponse<Issue[]>(response);
}

export interface CreateIssuePayload {
  category: IssueCategory;
  latitude: number;
  longitude: number;
  description?: string;
  title?: string;
  address?: string;
  file?: File | null;
}

export async function createIssue(
  payload: CreateIssuePayload,
): Promise<CreateIssueResponse> {
  const form = new FormData();
  form.set('category', payload.category);
  form.set('latitude', String(payload.latitude));
  form.set('longitude', String(payload.longitude));
  if (payload.description) form.set('description', payload.description);
  if (payload.title) form.set('title', payload.title);
  if (payload.address) form.set('address', payload.address);
  if (payload.file) form.set('file', payload.file);

  const response = await fetch(`${API_URL}/issues`, {
    method: 'POST',
    headers: identityHeaders({ 'X-Device-Id': getDeviceId() }),
    body: form,
  });

  return parseResponse<CreateIssueResponse>(response);
}

export async function confirmIssue(id: string): Promise<Issue> {
  const response = await fetch(`${API_URL}/issues/${id}/confirm`, {
    method: 'PATCH',
    headers: identityHeaders({ 'X-Device-Id': getDeviceId() }),
  });
  return parseResponse<Issue>(response);
}

export async function updateIssueStatus(
  id: string,
  status: IssueStatus,
  adminKey: string,
  publicNote?: string,
): Promise<Issue> {
  const response = await fetch(`${API_URL}/issues/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
    },
    body: JSON.stringify({ status, publicNote }),
  });
  return parseResponse<Issue>(response);
}

export interface PublicSummary {
  open: number;
  inProgress: number;
  resolvedThisMonth: number;
  total: number;
}

export async function getPublicSummary(): Promise<PublicSummary> {
  const response = await fetch(`${API_URL}/issues/meta/summary`, { cache: 'no-store' });
  return parseResponse<PublicSummary>(response);
}

export interface IssueUpdate {
  id: string;
  issue_id: string;
  previous_status: IssueStatus | null;
  status: IssueStatus;
  public_note: string | null;
  created_at: string;
}

export async function getIssueUpdates(id: string): Promise<IssueUpdate[]> {
  const response = await fetch(`${API_URL}/issues/${id}/updates`, { cache: 'no-store' });
  return parseResponse<IssueUpdate[]>(response);
}

export interface ProfileStats {
  reports: number;
  confirmations: number;
  resolved: number;
  points: number;
}

export interface CivicProfile {
  id: string;
  display_name: string;
  show_on_leaderboard: boolean;
  created_at: string;
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/profiles/me`, {
    cache: 'no-store',
    headers: identityHeaders({ 'X-Device-Id': getDeviceId() }),
  });
  return parseResponse<{ profile: CivicProfile | null; stats: ProfileStats }>(response);
}

export async function saveProfile(displayName: string, showOnLeaderboard: boolean) {
  const response = await fetch(`${API_URL}/profiles/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...identityHeaders({ 'X-Device-Id': getDeviceId() }),
    },
    body: JSON.stringify({ displayName, showOnLeaderboard }),
  });
  return parseResponse<CivicProfile>(response);
}

export async function getMyActivity(): Promise<Issue[]> {
  const response = await fetch(`${API_URL}/profiles/me/activity`, {
    cache: 'no-store',
    headers: identityHeaders({ 'X-Device-Id': getDeviceId() }),
  });
  return parseResponse<Issue[]>(response);
}

export async function getLeaderboard(): Promise<{ displayName: string; points: number }[]> {
  const response = await fetch(`${API_URL}/profiles/leaderboard`, { cache: 'no-store' });
  return parseResponse<{ displayName: string; points: number }[]>(response);
}

export async function deleteIssue(id: string, adminKey: string): Promise<void> {
  const response = await fetch(`${API_URL}/issues/${id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': adminKey },
  });
  await parseResponse<{ deleted: boolean }>(response);
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  const search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const response = await fetch(`${API_URL}/geocode/reverse?${search.toString()}`, {
    cache: 'no-store',
  });
  const data = await parseResponse<{ display_name: string }>(response);
  return data.display_name;
}
