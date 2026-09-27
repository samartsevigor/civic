const STORAGE_KEY = 'fixmap_device_id';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const next = generateId();
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}
