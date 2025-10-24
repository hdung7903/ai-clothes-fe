import type {
  CreateSuggestionImageRequest,
  CreateSuggestionImageResponse,
  UpdateSuggestionImageRequest,
  UpdateSuggestionImageResponse,
  SearchSuggestionImagesQuery,
  SearchSuggestionImagesResponse,
  GetSuggestionImageByIdResponse,
  DeleteSuggestionImageByIdResponse,
  GetAllActiveSuggestionImagesResponse,
} from '@/types/suggestionImage';

const defaultJsonHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function withAuth(headers: HeadersInit): HeadersInit {
  const token = getAccessToken();
  if (!token) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

async function handleAuthError(response: Response): Promise<never> {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
    }
  }
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

/**
 * Create a new suggestion image
 */
export async function createSuggestionImage(payload: CreateSuggestionImageRequest): Promise<CreateSuggestionImageResponse> {
  const url = `${getBaseUrl()}/api/SuggestionImage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: withAuth(defaultJsonHeaders),
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleAuthError(res);
  return res.json();
}

/**
 * Update an existing suggestion image
 */
export async function updateSuggestionImage(payload: UpdateSuggestionImageRequest): Promise<UpdateSuggestionImageResponse> {
  const url = `${getBaseUrl()}/api/SuggestionImage/${payload.id}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: withAuth(defaultJsonHeaders),
    body: JSON.stringify(payload),
  });
  if (!res.ok) return handleAuthError(res);
  return res.json();
}

/**
 * Search suggestion images with filters and pagination
 */
export async function searchSuggestionImages(query: SearchSuggestionImagesQuery): Promise<SearchSuggestionImagesResponse> {
  const params = new URLSearchParams();
  if (query.PageNumber) params.append('PageNumber', String(query.PageNumber));
  if (query.PageSize) params.append('PageSize', String(query.PageSize));
  if (query.SearchTerm) params.append('SearchTerm', query.SearchTerm);
  if (query.Category) params.append('Category', query.Category);
  if (query.IsActive !== undefined) params.append('IsActive', String(query.IsActive));
  if (query.SortBy) params.append('SortBy', query.SortBy);
  if (query.SortOrder) params.append('SortOrder', query.SortOrder);

  const url = `${getBaseUrl()}/api/SuggestionImage/search?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: withAuth(defaultJsonHeaders),
  });
  if (!res.ok) return handleAuthError(res);
  return res.json();
}

/**
 * Get suggestion image by ID
 */
export async function getSuggestionImageById(id: string): Promise<GetSuggestionImageByIdResponse> {
  const url = `${getBaseUrl()}/api/SuggestionImage/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: withAuth(defaultJsonHeaders),
  });
  if (!res.ok) return handleAuthError(res);
  return res.json();
}

/**
 * Delete suggestion image by ID
 */
export async function deleteSuggestionImageById(id: string): Promise<DeleteSuggestionImageByIdResponse> {
  const url = `${getBaseUrl()}/api/SuggestionImage/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: withAuth(defaultJsonHeaders),
  });
  if (!res.ok) return handleAuthError(res);
  return res.json();
}

/**
 * Get all active suggestion images (for public use)
 */
export async function getAllActiveSuggestionImages(): Promise<GetAllActiveSuggestionImagesResponse> {
  const url = `${getBaseUrl()}/api/SuggestionImage/active`;
  const res = await fetch(url, {
    method: 'GET',
    headers: defaultJsonHeaders,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}
