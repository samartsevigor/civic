let sessionToken: string | null = null;

export function setSessionToken(token: string | null) {
  sessionToken = token;
}

export function identityHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;
  return headers;
}
