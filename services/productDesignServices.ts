import type {
  CreateOrUpdateProductDesignRequest,
  CreateOrUpdateProductDesignResponse,
  SearchProductDesignsResponse,
  GetProductDesignByIdResponse,
  DeleteProductDesignByIdResponse,
  GetProductDesignsByProductResponse,
} from '@/types/productDesign';
import { getApiBaseUrl as getBaseUrl } from '@/lib/api-config';

const defaultJsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};


function getAccessToken(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('auth.tokens');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { accessToken?: string };
    return parsed?.accessToken ?? null;
  } catch (error) {
    console.warn('Failed to get access token:', error);
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

async function handleAuthError(response: Response): Promise<never> {
  if (response.status === 401) {
    // Token expired or invalid, clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth.tokens');
    }
    throw new Error('Authentication failed. Please login again.');
  }
  throw new Error(`Request failed with status ${response.status}`);
}

export interface SearchProductDesignsQuery {
  PageNumber: number;
  PageSize: number;
  SearchTerm?: string;
  ProductId?: string;
  ProductOptionValueId?: string;
}

export async function createOrUpdateProductDesign(payload: CreateOrUpdateProductDesignRequest): Promise<CreateOrUpdateProductDesignResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/ProductDesign/CreateOrUpdateProductDesign', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    await handleAuthError(res);
  }
  
  return res.json() as Promise<CreateOrUpdateProductDesignResponse>;
}

export async function searchProductDesigns(query: SearchProductDesignsQuery): Promise<SearchProductDesignsResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL('ProductDesign/Search', baseUrl);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  
  if (!res.ok) {
    await handleAuthError(res);
  }
  
  return res.json() as Promise<SearchProductDesignsResponse>;
}

export async function getProductDesignById(productDesignId: string): Promise<GetProductDesignByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/ProductDesign/${encodeURIComponent(productDesignId)}`, {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  
  if (!res.ok) {
    await handleAuthError(res);
  }
  
  return res.json() as Promise<GetProductDesignByIdResponse>;
}

export async function deleteProductDesignById(productDesignId: string): Promise<DeleteProductDesignByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `ProductDesign/${encodeURIComponent(productDesignId)}`, {
    method: 'DELETE',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  
  if (!res.ok) {
    await handleAuthError(res);
  }
  
  return res.json() as Promise<DeleteProductDesignByIdResponse>;
}

export async function getProductDesignsByProduct(productId: string, productOptionValueId?: string): Promise<GetProductDesignsByProductResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL(`ProductDesign/Product/${encodeURIComponent(productId)}`, baseUrl);
  if (productOptionValueId) url.searchParams.set('productOptionValueId', productOptionValueId);
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  
  if (!res.ok) {
    await handleAuthError(res);
  }
  
  return res.json() as Promise<GetProductDesignsByProductResponse>;
}





