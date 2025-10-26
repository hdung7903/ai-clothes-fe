import type { ApiEnvelope } from '@/types/shared';
import type { 
  QrCodeRequest, 
  QrCodeResponse, 
  SepayWebhookPayload, 
  SepayWebhookResponse, 
  TokenPackageBuyRequest, 
  TokenPackageBuyResponse, 
  CheckPaymentStatusRequest, 
  CheckPaymentStatusResponse,
  CheckTokenPackageIsPaidResponse
} from '@/types/payment';
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

// POST /Payment/QrCode
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

// POST /Payment/WebHook/Sepay
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

// POST /TokenPackage/Buy
export async function buyTokenPackage(payload: TokenPackageBuyRequest): Promise<TokenPackageBuyResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + 'TokenPackage/Buy', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<TokenPackageBuyResponse>;
}

// POST /Payment/CheckStatus
export async function checkPaymentStatus(payload: CheckPaymentStatusRequest): Promise<CheckPaymentStatusResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + 'Payment/CheckStatus', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<CheckPaymentStatusResponse>;
}

/**
 * Check if token package is paid
 * GET /api/TokenPackage/CheckIsPaid
 * @param paymentCode - The payment code to check
 * @returns Promise with isPaid status (true if paid, false if not paid or expired)
 */
export async function checkTokenPackageIsPaid(paymentCode: string): Promise<CheckTokenPackageIsPaidResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL(baseUrl + 'TokenPackage/CheckIsPaid');
  url.searchParams.append('paymentCode', paymentCode);
  
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
  });
  return res.json() as Promise<CheckTokenPackageIsPaidResponse>;
}



