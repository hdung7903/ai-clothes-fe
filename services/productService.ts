import type {
  CreateOrUpdateProductRequest,
  CreateOrUpdateProductResponse,
  SearchProductsResponse,
  GetProductByIdResponse,
  DeleteProductByIdResponse,
} from '@/types/product';

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

export async function createOrUpdateProduct(payload: CreateOrUpdateProductRequest): Promise<CreateOrUpdateProductResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/api/Product/CreateOrUpdateProduct', {
    method: 'POST',
    headers: defaultJsonHeaders,
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
  SortBy?: string;
  SortDescending: boolean;
  PageNumber: number;
  PageSize: number;
}

export async function searchProducts(query: SearchProductsQuery): Promise<SearchProductsResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL(baseUrl + '/api/Product/Search', typeof window === 'undefined' ? 'http://localhost' : window.location.origin);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  return res.json() as Promise<SearchProductsResponse>;
}

export async function getProductById(productId: string): Promise<GetProductByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/api/Product/${encodeURIComponent(productId)}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  return res.json() as Promise<GetProductByIdResponse>;
}

export async function deleteProductById(productId: string): Promise<DeleteProductByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/api/Product/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' },
    credentials: 'include',
  });
  return res.json() as Promise<DeleteProductByIdResponse>;
}



