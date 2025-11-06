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

// API Services
export async function getDashboardData(): Promise<DashboardDataResponse> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + '/Statistics/DashboardData';
  
  const res = await fetch(url, {
    method: 'GET',
    headers: withAuth(defaultHeaders),
    credentials: 'include',
  });
  
  return res.json() as Promise<DashboardDataResponse>;
}

export async function getRevenueStatistics(): Promise<DashboardDataResponse> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + '/Statistics/RevenueStatistics';

  const res = await fetch(url, {
    method: 'GET',
    headers: withAuth(defaultHeaders),
    credentials: 'include',
  });

  return res.json() as Promise<DashboardDataResponse>;
}


