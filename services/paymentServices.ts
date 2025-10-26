import type { ApiEnvelope } from '@/types/shared';
import type { QrCodeRequest, QrCodeResponse, SepayWebhookPayload, SepayWebhookResponse, TokenPackageBuyRequest, TokenPackageBuyResponse, CheckPaymentStatusRequest, CheckPaymentStatusResponse } from '@/types/payment';
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
  const res = await fetch(baseUrl + '/api/Payment/QrCode', {
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
  const res = await fetch(baseUrl + '/api/Payment/WebHook/Sepay', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<SepayWebhookResponse>;
}

// POST /api/TokenPackage/Buy
export async function buyTokenPackage(payload: TokenPackageBuyRequest): Promise<TokenPackageBuyResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/TokenPackage/Buy', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<TokenPackageBuyResponse>;
}

// POST /api/Payment/CheckStatus
export async function checkPaymentStatus(payload: CheckPaymentStatusRequest): Promise<CheckPaymentStatusResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/api/Payment/CheckStatus', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<CheckPaymentStatusResponse>;
}



