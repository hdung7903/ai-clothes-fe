import type {
  CreateOrUpdateTemplateRequest,
  CreateOrUpdateTemplateResponse,
  SearchTemplatesResponse,
  GetTemplateByIdResponse,
  DeleteTemplateByIdResponse,
  GetTemplatesByProductResponse,
} from '@/types/template';
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

export interface SearchTemplatesQuery {
  PageNumber: number;
  PageSize: number;
  SearchTerm?: string;
  ProductId?: string; // guid
  ProductOptionValueId?: string; // guid
}

export async function createOrUpdateTemplate(payload: CreateOrUpdateTemplateRequest): Promise<CreateOrUpdateTemplateResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + '/Template/CreateOrUpdateTemplate', {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<CreateOrUpdateTemplateResponse>;
}

export async function searchTemplates(query: SearchTemplatesQuery): Promise<SearchTemplatesResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/Template/Search', baseUrl);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<SearchTemplatesResponse>;
}

export async function getTemplateById(templateId: string): Promise<GetTemplateByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/api/Template/${encodeURIComponent(templateId)}`, {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<GetTemplateByIdResponse>;
}

export async function deleteTemplateById(templateId: string): Promise<DeleteTemplateByIdResponse> {
  const baseUrl = getBaseUrl();
  const res = await fetch(baseUrl + `/api/Template/${encodeURIComponent(templateId)}`, {
    method: 'DELETE',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<DeleteTemplateByIdResponse>;
}

export async function getTemplatesByProduct(productId: string, productOptionValueId?: string): Promise<GetTemplatesByProductResponse> {
  const baseUrl = getBaseUrl();
  const url = new URL(`/api/Template/Product/${encodeURIComponent(productId)}`, baseUrl);
  if (productOptionValueId) url.searchParams.set('productOptionValueId', productOptionValueId);
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: withAuth({ 'Accept': 'application/json' }),
    credentials: 'include',
  });
  return res.json() as Promise<GetTemplatesByProductResponse>;
}


