import type { SepayWebhookPayload, SepayWebhookResponse, QrCodeResponse } from '@/types/payment';
import { getApiBaseUrl } from '@/lib/api-config';

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};


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
  const baseUrl = getApiBaseUrl();
  const res = await fetch(baseUrl + '/Payment/WebHook/Sepay', {
    method: 'POST',
    headers: withAuth(defaultHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<SepayWebhookResponse>;
}

export async function getQrCode(amount: number): Promise<QrCodeResponse> {
  const baseUrl = getApiBaseUrl();
  const url = new URL('/api/Payment/QrCode', baseUrl);
  url.searchParams.set('amount', String(amount));
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<QrCodeResponse>;
}



