import type {
  CreateOrUpdateVoucherRequest,
  CreateOrUpdateVoucherResponse,
  SearchVouchersResponse,
  GetVoucherByIdResponse,
  DeleteVoucherByIdResponse,
} from '@/types/voucher';

const defaultJsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
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

export async function createOrUpdateVoucher(payload: CreateOrUpdateVoucherRequest): Promise<CreateOrUpdateVoucherResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/api/Voucher/CreateOrUpdateVoucher', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<CreateOrUpdateVoucherResponse>;
}

export interface SearchVouchersQuery {
  SearchTerm?: string;
  IsActive?: boolean;
  DiscountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  SortBy: 'CODE' | 'NAME' | 'CREATED_ON' | 'VALID_FROM' | 'VALID_TO';
  SortDescending: boolean;
  PageNumber: number;
  PageSize: number;
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
  const res = await fetch(baseUrl + `/api/Voucher/${encodeURIComponent(voucherId)}`, {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<GetVoucherByIdResponse>;
}

export async function deleteVoucherById(voucherId: string): Promise<DeleteVoucherByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/api/Voucher/${encodeURIComponent(voucherId)}`, {
    method: 'DELETE',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<DeleteVoucherByIdResponse>;
}
