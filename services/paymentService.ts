import type { SepayWebhookPayload, SepayWebhookResponse, QrCodeResponse } from '@/types/payment';

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

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

export async function sepayWebHook(payload: SepayWebhookPayload): Promise<SepayWebhookResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/api/Payment/WebHook/Sepay', {
    method: 'POST',
    headers: withAuth(defaultHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<SepayWebhookResponse>;
}

export async function getQrCode(amount: number): Promise<QrCodeResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/Payment/QrCode', baseUrl);
  url.searchParams.set('amount', String(amount));
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<QrCodeResponse>;
}



