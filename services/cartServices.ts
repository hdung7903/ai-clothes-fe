import type { AddCartItemRequest, AddCartItemResponse, DeleteCartItemsRequest, DeleteCartItemsResponse, GetCartItemsResponse, GetCartItemByOptionRequest, GetCartItemByOptionResponse } from '@/types/cart';
import { getApiBaseUrl } from '@/lib/api-config';

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

/**
 * Check if user is authenticated by verifying access token
 * @returns {boolean} True if user has valid access token
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

async function requestJson<TReq, TRes>(path: string, options: { method: 'GET' | 'POST' | 'DELETE' | 'PUT'; payload?: TReq; useBodyForGet?: boolean }): Promise<TRes> {
  const baseUrl = getApiBaseUrl();
  const token = getAccessToken();
  
  // Check if user is authenticated for cart operations
  if (!token) {
    throw new Error('Authentication required for cart operations. Please login first.');
  }
  
  try {
    // For GET requests with payload, send as body (special case for itemByOption API)
    const shouldUseBody = options.method !== 'GET' || options.useBodyForGet;
    
    const res = await fetch(baseUrl + path, {
      method: options.method,
      headers: withAuth(defaultHeaders),
      credentials: 'include',
      body: shouldUseBody && options.payload ? JSON.stringify(options.payload) : undefined,
    });
    
    // Handle HTTP errors
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.errors || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    return res.json() as Promise<TRes>;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while making cart request');
  }
}

/**
 * Add item to cart with authentication
 * @param {AddCartItemRequest} payload - Cart item data
 * @returns {Promise<AddCartItemResponse>} API response
 * @throws {Error} If authentication fails or request fails
 */
export async function addItem(payload: AddCartItemRequest): Promise<AddCartItemResponse> {
  return requestJson<AddCartItemRequest, AddCartItemResponse>('/Cart/item', { method: 'POST', payload });
}

/**
 * Delete items from cart with authentication
 * @param {DeleteCartItemsRequest} payload - Cart item IDs to delete
 * @returns {Promise<DeleteCartItemsResponse>} API response
 * @throws {Error} If authentication fails or request fails
 */
export async function deleteItems(payload: DeleteCartItemsRequest): Promise<DeleteCartItemsResponse> {
  return requestJson<DeleteCartItemsRequest, DeleteCartItemsResponse>('/Cart/item', { method: 'DELETE', payload });
}

/**
 * Get cart items with authentication
 * @returns {Promise<GetCartItemsResponse>} API response with cart items
 * @throws {Error} If authentication fails or request fails
 */
export async function getCartItems(): Promise<GetCartItemsResponse> {
  return requestJson<never, GetCartItemsResponse>('/Cart/item', { method: 'GET' });
}

/**
 * Add item to cart by product options with authentication
 * @param {GetCartItemByOptionRequest} payload - Product options to add to cart
 * @returns {Promise<GetCartItemByOptionResponse>} API response with cart item ID
 * @throws {Error} If authentication fails or request fails
 */
export async function addItemByOption(payload: GetCartItemByOptionRequest): Promise<GetCartItemByOptionResponse> {
  return requestJson<GetCartItemByOptionRequest, GetCartItemByOptionResponse>('/Cart/itemByOption', { method: 'POST', payload });
}





