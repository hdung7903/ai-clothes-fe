import type { CreateOrUpdateCategoryRequest, CreateOrUpdateCategoryResponse, GetAllCategoriesResponse, GetCategoryByIdResponse, DeleteCategoryByIdResponse } from '@/types/category';
import { getApiBaseUrl } from '@/lib/api-config';

const defaultHeaders: HeadersInit = {
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

async function requestJson<TReq, TRes>(path: string, options: { method: 'GET' | 'POST' | 'DELETE'; payload?: TReq }): Promise<TRes> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(baseUrl + path, {
    method: options.method,
    headers: withAuth(defaultHeaders),
    credentials: 'include',
    body: options.payload ? JSON.stringify(options.payload) : undefined,
  });
  return res.json() as Promise<TRes>;
}

export async function createOrUpdate(payload: CreateOrUpdateCategoryRequest): Promise<CreateOrUpdateCategoryResponse> {
  return requestJson<CreateOrUpdateCategoryRequest, CreateOrUpdateCategoryResponse>('/Category/CreateOrUpdate', { method: 'POST', payload });
}

export async function getAll(): Promise<GetAllCategoriesResponse> {
  return requestJson<undefined, GetAllCategoriesResponse>('/Category/GetAll', { method: 'GET' });
}

export async function getById(id: string): Promise<GetCategoryByIdResponse> {
  return requestJson<undefined, GetCategoryByIdResponse>(`/Category/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function deleteById(id: string): Promise<DeleteCategoryByIdResponse> {
  return requestJson<undefined, DeleteCategoryByIdResponse>(`/Category/${encodeURIComponent(id)}`, { method: 'DELETE' });
}



