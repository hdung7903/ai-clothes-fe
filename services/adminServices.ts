// Admin service for Statistics and Dashboard endpoints
import type { ApiEnvelope } from '@/types/shared';
import type { DashboardData, RevenueSummary, OrderType } from '@/types/admin';
import { getApiBaseUrl } from '@/lib/api-config';

const defaultHeaders: HeadersInit = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

function getAccessToken(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('auth.tokens') : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed?.accessToken ?? null;
  } catch (error) {
    console.error('Error parsing auth tokens:', error);
    return null;
  }
}

function withAuth(headers: HeadersInit): HeadersInit {
  const h = new Headers(headers as HeadersInit);
  const token = getAccessToken();
  if (token) {
    h.set('Authorization', `Bearer ${token}`);
  }
  return h;
}

export type DashboardDataResponse = ApiEnvelope<DashboardData>;
export type RevenueSummaryResponse = ApiEnvelope<RevenueSummary>;

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch (_e) {
    return null;
  }
}

// API Services
export async function getDashboardData(): Promise<DashboardDataResponse> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + 'Statistics/DashboardData';
  
  const res = await fetch(url, {
    method: 'GET',
    headers: withAuth(defaultHeaders),
    credentials: 'include',
  });

  const data = await parseJsonSafe<DashboardDataResponse>(res);
  if (data) return data;
  return {
    success: false,
    errors: { response: ['Invalid or empty JSON from /Statistics/DashboardData'] },
  } as DashboardDataResponse;
}

export async function getRevenue(params?: {
  month?: number;
  year?: number;
  orderType?: OrderType;
}): Promise<RevenueSummaryResponse> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(baseUrl + 'Statistics/Revenue');

  if (params?.month !== undefined) url.searchParams.set('Month', String(params.month));
  if (params?.year !== undefined) url.searchParams.set('Year', String(params.year));
  if (params?.orderType !== undefined) {
    const normalized = String(params.orderType).toUpperCase() as OrderType;
    url.searchParams.set('OrderType', normalized);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth(defaultHeaders),
    credentials: 'include',
  });

  const data = await parseJsonSafe<RevenueSummaryResponse>(res);
  if (data) return data;
  return {
    success: false,
    errors: { response: ['Invalid or empty JSON from /Statistics/Revenue'] },
  } as RevenueSummaryResponse;
}
