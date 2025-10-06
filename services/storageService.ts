import type { UploadImageResponse } from '@/types/file';

function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
}

export async function uploadImage(file: File): Promise<UploadImageResponse> {
  const baseUrl = getBaseUrl();
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(baseUrl + '/api/File/UploadImage', {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  return res.json() as Promise<UploadImageResponse>;
}
