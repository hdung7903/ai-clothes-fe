import type {
  CreateOrUpdateVoucherRequest,
  CreateOrUpdateVoucherResponse,
  SearchVouchersQuery,
  SearchVouchersResponse,
  GetVoucherByIdResponse,
  DeleteVoucherByIdResponse,
  AddToProductRequest,
  AddToProductResponse,
  RemoveFromProductRequest,
  RemoveFromProductResponse,
  GetVouchersByProductResponse,
} from '@/types/voucher';
import { getApiBaseUrl as getBaseUrl } from '@/lib/api-config';

const defaultJsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth.tokens');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed?.accessToken ?? null;
  } catch (error) {
    console.error('Error parsing auth tokens:', error);
    return null;
  }
}

function withAuth(headers: HeadersInit): HeadersInit {
  const h = new Headers(headers);
  const token = getAccessToken();
  if (token) h.set('Authorization', `Bearer ${token}`);
  return h;
}

export async function createOrUpdateVoucher(payload: CreateOrUpdateVoucherRequest): Promise<CreateOrUpdateVoucherResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/Voucher/CreateOrUpdateVoucher', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<CreateOrUpdateVoucherResponse>;
}


export async function searchVouchers(query: SearchVouchersQuery): Promise<SearchVouchersResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/Voucher/Search', baseUrl);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<SearchVouchersResponse>;
}

export async function getVoucherById(voucherId: string): Promise<GetVoucherByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/Voucher/${encodeURIComponent(voucherId)}`, {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<GetVoucherByIdResponse>;
}

export async function deleteVoucherById(voucherId: string): Promise<DeleteVoucherByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/Voucher/${encodeURIComponent(voucherId)}`, {
    method: 'DELETE',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<DeleteVoucherByIdResponse>;
}

export async function addToProduct(payload: AddToProductRequest): Promise<AddToProductResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/Voucher/AddToProduct', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<AddToProductResponse>;
}

export async function removeFromProduct(payload: RemoveFromProductRequest): Promise<RemoveFromProductResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/Voucher/RemoveFromProduct', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<RemoveFromProductResponse>;
}

export async function getVouchersByProduct(productId: string, isActive?: boolean): Promise<GetVouchersByProductResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL(`/Voucher/Product/${encodeURIComponent(productId)}`, baseUrl);
  if (isActive !== undefined) {
    url.searchParams.set('isActive', String(isActive));
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<GetVouchersByProductResponse>;
}
