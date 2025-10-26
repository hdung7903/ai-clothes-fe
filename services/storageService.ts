import type { UploadImageResponse } from '@/types/file';

function getBaseUrl(): string {
  // Prefer NEXT_PUBLIC_API_BASE_URL if provided, fallback to /api
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Debug log (remove after testing)
  if (typeof window !== 'undefined') {
    console.log('🔍 NEXT_PUBLIC_API_BASE_URL:', envUrl);
  }
  
  if (typeof process !== 'undefined' && envUrl) {
    const cleanedUrl = envUrl.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      console.log('✅ Using API URL:', cleanedUrl);
    }
    return cleanedUrl;
  }
  
  // Fallback to /api path for same-origin requests
  if (typeof window !== 'undefined') {
    console.log('⚠️ Fallback to /api');
  }
  return '/api';
}

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

  const res = await fetch(baseUrl + '/api/File/UploadImage', {
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
