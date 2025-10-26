import type { ApiEnvelope } from '@/types/shared';
import type { QrCodeRequest, QrCodeResponse, SepayWebhookPayload, SepayWebhookResponse } from '@/types/payment';
import { getApiBaseUrl as getBaseUrl } from '@/lib/api-config';
const defaultJsonHeaders: HeadersInit = {
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

// POST /api/Payment/QrCode
export async function createQrCode(payload: QrCodeRequest): Promise<QrCodeResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/Payment/QrCode', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<QrCodeResponse>;
}

// POST /api/Payment/WebHook/Sepay
export async function sepayWebHook(payload: SepayWebhookPayload): Promise<SepayWebhookResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/Payment/WebHook/Sepay', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<SepayWebhookResponse>;
}



