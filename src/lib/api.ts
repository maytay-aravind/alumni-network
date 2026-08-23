// Central API helper - uses separate backend if NEXT_PUBLIC_BACKEND_URL is set, otherwise Next.js /api
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || '';

export function apiUrl(path: string) {
  if (BACKEND_URL && path.startsWith('/api/')) return `${BACKEND_URL}${path}`;
  return path;
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), init);
}
