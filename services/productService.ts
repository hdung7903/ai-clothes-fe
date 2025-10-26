import type {
  CreateOrUpdateProductRequest,
  CreateOrUpdateProductResponse,
  SearchProductsResponse,
  GetProductByIdResponse,
  DeleteProductByIdResponse,
} from '@/types/product';
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

export async function createOrUpdateProduct(payload: CreateOrUpdateProductRequest): Promise<CreateOrUpdateProductResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/Product/CreateOrUpdateProduct', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<CreateOrUpdateProductResponse>;
}

export interface SearchProductsQuery {
  SearchTerm?: string;
  CategoryId?: string;
  MinPrice?: number;
  MaxPrice?: number;
  SortBy: 'NAME' | 'PRICE' | 'CREATED_ON';
  SortDescending: boolean;
  PageNumber: number;
  PageSize: number;
}

export async function searchProducts(query: SearchProductsQuery): Promise<SearchProductsResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/Product/Search', baseUrl);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<SearchProductsResponse>;
}

export async function getProductById(productId: string): Promise<GetProductByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/api/Product/${encodeURIComponent(productId)}`, {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<GetProductByIdResponse>;
}

export async function deleteProductById(productId: string): Promise<DeleteProductByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/api/Product/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<DeleteProductByIdResponse>;
}



