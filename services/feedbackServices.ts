// Feedback service for product review endpoints
// Uses fetch with JSON, returns typed responses with Bearer token authentication
import type { ApiEnvelope } from '@/types/shared';
import type {
  CreateFeedbackRequest,
  CreateFeedbackResponse,
  GetProductFeedbacksResponse,
} from '@/types/feedback';
import { getApiBaseUrl } from '@/lib/api-config';

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function getAuthHeaders(): HeadersInit | null {
  // Get token from localStorage (same pattern as other services)
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  
  if (!token) {
    return null;
  }
  
  return {
    ...defaultHeaders,
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Create product feedback/review after order is confirmed received
 * POST /api/Feedback
 * @param data - Feedback data including orderId, feedback text, and rating
 * @returns Promise with feedback creation response
 */
export async function createFeedback(
  data: CreateFeedbackRequest
): Promise<ApiEnvelope<CreateFeedbackResponse>> {
  const headers = getAuthHeaders();
  
  if (!headers) {
    return {
      success: false,
      errors: { auth: ['Not authenticated'] },
    };
  }

  const response = await fetch(`${getApiBaseUrl()}Feedback`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  const result: ApiEnvelope<CreateFeedbackResponse> = await response.json();
  return result;
}

/**
 * Get product feedbacks/reviews with average rating
 * GET /api/Feedback/Product/{productId}
 * @param productId - Product GUID
 * @returns Promise with feedbacks list and average rating
 */
export async function getProductFeedbacks(
  productId: string
): Promise<ApiEnvelope<GetProductFeedbacksResponse>> {
  const response = await fetch(
    `${getApiBaseUrl()}Feedback/Product/${productId}`,
    {
      method: 'GET',
      headers: defaultHeaders,
    }
  );

  const result: ApiEnvelope<GetProductFeedbacksResponse> = await response.json();
  return result;
}
