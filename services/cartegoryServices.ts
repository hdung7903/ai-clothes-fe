import type { CreateOrUpdateCategoryRequest, CreateOrUpdateCategoryResponse, GetAllCategoriesResponse, GetCategoryByIdResponse, DeleteCategoryByIdResponse } from '@/types/category';

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
}

async function requestJson<TReq, TRes>(path: string, options: { method: 'GET' | 'POST' | 'DELETE'; payload?: TReq }): Promise<TRes> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + path, {
    method: options.method,
    headers: defaultHeaders,
    credentials: 'include',
    body: options.payload ? JSON.stringify(options.payload) : undefined,
  });
  return res.json() as Promise<TRes>;
}

export async function createOrUpdate(payload: CreateOrUpdateCategoryRequest): Promise<CreateOrUpdateCategoryResponse> {
  return requestJson<CreateOrUpdateCategoryRequest, CreateOrUpdateCategoryResponse>('/api/Category/CreateOrUpdate', { method: 'POST', payload });
}

export async function getAll(): Promise<GetAllCategoriesResponse> {
  return requestJson<undefined, GetAllCategoriesResponse>('/api/Category/GetAll', { method: 'GET' });
}

export async function getById(id: string): Promise<GetCategoryByIdResponse> {
  return requestJson<undefined, GetCategoryByIdResponse>(`/api/Category/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function deleteById(id: string): Promise<DeleteCategoryByIdResponse> {
  return requestJson<undefined, DeleteCategoryByIdResponse>(`/api/Category/${encodeURIComponent(id)}`, { method: 'DELETE' });
}



