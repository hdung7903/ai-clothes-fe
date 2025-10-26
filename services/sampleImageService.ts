import type { ApiEnvelope } from '@/types/shared';
import { getApiBaseUrl as getBaseUrl } from '@/lib/api-config';

const defaultHeaders: HeadersInit = {
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

async function requestJson<TReq, TRes>(path: string, options: { method: 'GET' | 'POST' | 'DELETE' | 'PUT'; payload?: TReq; isFormData?: boolean }): Promise<TRes> {
  const baseUrl = getBaseUrl();
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('Authentication required. Please login first.');
  }
  
  try {
    const headers = options.isFormData ? 
      withAuth({}) : // Don't set Content-Type for FormData, let browser set it
      withAuth(defaultHeaders);

    const res = await fetch(baseUrl + path, {
      method: options.method,
      headers,
      credentials: 'include',
      body: options.method !== 'GET' && options.payload ? 
        (options.isFormData ? options.payload as any : JSON.stringify(options.payload)) : 
        undefined,
    });
    
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.errors || errorMessage;
      } catch {
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    return res.json() as Promise<TRes>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while making request');
  }
}

export interface SampleImage {
  sampleImageId: string;
  imageUrl: string;
}

export type GetSampleImagesResponse = ApiEnvelope<SampleImage[]>;

export type UploadSampleImageResponse = ApiEnvelope<string>;

export type DeleteSampleImageResponse = ApiEnvelope<boolean>;

/**
 * Get all sample images
 */
export async function getSampleImages(): Promise<GetSampleImagesResponse> {
  return requestJson<never, GetSampleImagesResponse>('/SampleImage', { method: 'GET' });
}

/**
 * Upload a new sample image
 */
export async function uploadSampleImage(file: File): Promise<UploadSampleImageResponse> {
  // Step 1: Upload file to get image URL
  const formData = new FormData();
  formData.append('file', file);
  
  const uploadResponse = await requestJson<FormData, { success: boolean; data: string }>('/File/UploadImage', { 
    method: 'POST', 
    payload: formData,
    isFormData: true 
  });

  if (!uploadResponse.success || !uploadResponse.data) {
    throw new Error('Failed to upload image file');
  }

  const imageUrl = uploadResponse.data;

  // Step 2: Save image URL to sample images
  const saveResponse = await requestJson<{ imageUrl: string }, UploadSampleImageResponse>('/SampleImage', {
    method: 'POST',
    payload: { imageUrl }
  });

  return saveResponse;
}

/**
 * Delete a sample image by ID
 */
export async function deleteSampleImage(id: string): Promise<DeleteSampleImageResponse> {
  return requestJson<{ id: string }, DeleteSampleImageResponse>('/SampleImage', {
    method: 'DELETE',
    payload: { id }
  });
}
