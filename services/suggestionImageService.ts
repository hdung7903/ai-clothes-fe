import type { ApiEnvelope } from '@/types/shared'
import type { PagedResult } from '@/types/product'
import type { 
  SuggestionImageSummaryItem, 
  SuggestionImage,
  SearchSuggestionImagesQuery,
  CreateSuggestionImageRequest,
  UpdateSuggestionImageRequest
} from '@/types/suggestionImage'

function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '')
  }
  return ''
}

function getAccessToken(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('auth.tokens') : null
    if (!raw) return null
    const parsed = JSON.parse(raw) as { accessToken?: string }
    return parsed?.accessToken ?? null
  } catch {
    return null
  }
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function searchSuggestionImages(
  query: SearchSuggestionImagesQuery
): Promise<ApiEnvelope<PagedResult<SuggestionImageSummaryItem>>> {
  const baseUrl = getBaseUrl()
  const params = new URLSearchParams()
  
  if (query.SearchTerm) params.append('SearchTerm', query.SearchTerm)
  if (query.Category) params.append('Category', query.Category)
  if (query.IsActive !== undefined) params.append('IsActive', String(query.IsActive))
  if (query.PageNumber) params.append('PageNumber', String(query.PageNumber))
  if (query.PageSize) params.append('PageSize', String(query.PageSize))
  if (query.SortBy) params.append('SortBy', query.SortBy)
  if (query.SortOrder) params.append('SortOrder', query.SortOrder)

  const res = await fetch(`${baseUrl}/api/SuggestionImage/Search?${params.toString()}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  })

  return res.json() as Promise<ApiEnvelope<PagedResult<SuggestionImageSummaryItem>>>
}

export async function getSuggestionImageById(
  id: string
): Promise<ApiEnvelope<SuggestionImage>> {
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/SuggestionImage/${id}`, {
    method: 'GET',
    headers: getHeaders(),
    credentials: 'include',
  })

  return res.json() as Promise<ApiEnvelope<SuggestionImage>>
}

export async function createSuggestionImage(
  command: CreateSuggestionImageRequest
): Promise<ApiEnvelope<string>> {
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/SuggestionImage`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(command),
  })

  return res.json() as Promise<ApiEnvelope<string>>
}

export async function updateSuggestionImage(
  id: string,
  command: UpdateSuggestionImageRequest
): Promise<ApiEnvelope<null>> {
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/SuggestionImage/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(command),
  })

  return res.json() as Promise<ApiEnvelope<null>>
}

export async function deleteSuggestionImageById(
  id: string
): Promise<ApiEnvelope<null>> {
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/SuggestionImage/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
  })

  return res.json() as Promise<ApiEnvelope<null>>
}
