import type { GetProfileResponse } from '@/types/user';

const defaultHeaders: HeadersInit = {
  'Accept': 'application/json',
};

function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
}

function getAccessToken(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('auth.tokens') : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed?.accessToken ?? null;
  } catch {
    return null;
  }
}

function withAuth(headers: HeadersInit): HeadersInit {
  const h = new Headers(headers as HeadersInit);
  const token = getAccessToken();
  if (token) h.set('Authorization', `Bearer ${token}`);
  return h;
}

async function requestJson<TRes>(path: string): Promise<TRes> {
  const baseUrl = getBaseUrl();
  const url = baseUrl + path;
  const res = await fetch(url, {
    method: 'GET',
    headers: withAuth(defaultHeaders),
    credentials: 'include',
  });
  return res.json() as Promise<TRes>;
}

export async function getProfile(jwt?: string): Promise<GetProfileResponse> {
  const baseUrl = getBaseUrl();
  const url = baseUrl + '/api/Account/Profile';
  const headers = new Headers(withAuth(defaultHeaders) as HeadersInit);
  if (jwt) headers.set('Authorization', `Bearer ${jwt}`);

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  return res.json() as Promise<GetProfileResponse>;
}

