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

async function requestJson<TRes>(path: string): Promise<TRes> {
  const baseUrl = getBaseUrl();
  const url = baseUrl + path;
  const res = await fetch(url, {
    method: 'GET',
    headers: defaultHeaders,
    credentials: 'include',
  });
  return res.json() as Promise<TRes>;
}

export async function getProfile(jwt?: string): Promise<GetProfileResponse> {
  const baseUrl = getBaseUrl();
  const url = baseUrl + '/api/Account/Profile';
  const headers = new Headers(defaultHeaders as HeadersInit);
  if (jwt) headers.set('Authorization', `Bearer ${jwt}`);

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  return res.json() as Promise<GetProfileResponse>;
}

