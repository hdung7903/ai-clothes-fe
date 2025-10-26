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
  CheckTokenPackageIsPaidResponse,
  TokenPackagePurchaseHistoryResponse
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
 * Check if order is paid
 * GET /api/Order/{orderId}/IsPaid
 * @param orderId - The order ID (GUID) to check
 * @returns Promise with isPaid boolean (true if paid, false if not paid)
 */
export async function checkOrderIsPaid(orderId: string): Promise<ApiEnvelope<boolean>> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `Order/${orderId}/IsPaid`, {
    method: 'GET',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
  });
  return res.json() as Promise<ApiEnvelope<boolean>>;
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

/**
 * Get token package purchase history (Admin only)
 * GET /api/TokenPackage/Admin/History
 * @param pageNumber - Page number for pagination
 * @param pageSize - Number of items per page
 * @returns Promise with paginated purchase history including buyer info, price, tokens, and purchase time
 */
export async function getTokenPackagePurchaseHistory(
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<TokenPackagePurchaseHistoryResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL(baseUrl + 'TokenPackage/Admin/History');
  url.searchParams.append('PageNumber', pageNumber.toString());
  url.searchParams.append('PageSize', pageSize.toString());
  
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
  });
  return res.json() as Promise<TokenPackagePurchaseHistoryResponse>;
}

/**
 * Decrease user token (deduct 1 token from user's balance)
 * POST /api/AiToken/DecreaseUserToken
 * @returns Promise with updated token count
 */
export async function decreaseUserToken(): Promise<ApiEnvelope<number>> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + 'AiToken/DecreaseUserToken', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
  });
  return res.json() as Promise<ApiEnvelope<number>>;
}



