import type { UploadImageResponse } from '@/types/file';
import { getApiBaseUrl as getBaseUrl } from '@/lib/api-config';

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const baseUrl = getBaseUrl();
  const form = new FormData();
  form.append('file', file);

  // Read access token consistently with other services
  const getAccessToken = (): string | null => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('auth.tokens') : null;
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { accessToken?: string };
      return parsed?.accessToken ?? null;
    } catch {
      return null;
    }
  };

  const authToken = getAccessToken();
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${baseUrl}File/UploadImage`, {
    method: 'POST',
    body: form,
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<UploadImageResponse>;
}
