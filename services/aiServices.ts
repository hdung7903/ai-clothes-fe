// AI service for AI endpoints
// Uses fetch with JSON, returns typed responses
import type {
  AskData,
  TransformImage,
  GenerateNewImage,
  ModifyProduct,
  ApiAi,
  AskQuestionResponse,
  TransformImageResponse,
  GenerateImageResponse,
  UpdateProductResponse,
  DeleteProductResponse,
  UpdateApiKeyResponse,
  HTTPValidationError,
} from '@/types/ai';
import { store } from '@/redux';
import type { RootState } from '@/redux';

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function getAiBaseUrl(): string {
  // Use NEXT_PUBLIC_AI_BASE_URL environment variable
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AI_BASE_URL) {
    return process.env.NEXT_PUBLIC_AI_BASE_URL.replace(/\/$/, '');
  }
  
  // Fallback for development - you can change this to your actual AI API URL
  if (typeof window !== 'undefined') {
    console.warn('NEXT_PUBLIC_AI_BASE_URL not set, using fallback URL');
    return 'http://localhost:8000'; // Change this to your actual AI API URL
  }
  
  throw new Error('NEXT_PUBLIC_AI_BASE_URL environment variable is not set');
}

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

function getCurrentUserId(): string | null {
  try {
    const state = store.getState() as RootState;
    return state.auth.user?.id ?? null;
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

async function requestAiJson<TReq, TRes>(
  path: string, 
  options: Omit<RequestInit, 'body'> & { payload?: TReq }
): Promise<TRes> {
  try {
    const baseUrl = getAiBaseUrl();
    
    // Construct URL properly
    let url: string;
    if (baseUrl.startsWith('http')) {
      // Full URL provided
      url = `${baseUrl}${path}`;
    } else {
      // Relative URL - construct with current origin
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      url = `${origin}${baseUrl}${path}`;
    }

    console.log('Making AI API request to:', url);

    const init: RequestInit = {
      method: options.method ?? 'POST',
      headers: withAuth({ ...defaultHeaders, ...(options.headers ?? {}) }),
      // Avoid sending site cookies to a different-origin AI server to prevent CORS failures
      credentials: 'omit',
      mode: 'cors',
    };

    if (options.payload !== undefined) {
      init.body = JSON.stringify(options.payload);
    }

    const res = await fetch(url, init);
    
    if (!res.ok) {
      if (res.status === 422) {
        const validationError = (await res.json()) as HTTPValidationError;
        throw new Error(`Validation Error: ${validationError.detail?.map(d => d.msg).join(', ') || 'Unknown validation error'}`);
      }
      throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json() as TRes;
    return json;
  } catch (error) {
    console.error('AI API request failed:', error);
    
    // Handle different types of errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối với AI service. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Có lỗi không xác định xảy ra khi gọi AI service.');
  }
}

// AI Services

/**
 * Ask a question to the AI
 */
export async function askQuestion(request: { question: string }): Promise<AskQuestionResponse> {
  // Get current user ID from Redux store
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated. Please login to use AI services.');
  }
  
  const requestWithUserId: AskData = {
    uuid: userId,
    question: request.question
  };
  
  // For development/testing - you can uncomment this to use mock responses
  // return mockAskQuestionResponse(requestWithUserId);
  
  return requestAiJson<AskData, AskQuestionResponse>('/ask_user', { method: 'POST', payload: requestWithUserId });
}

/**
 * Transform an image using AI
 */
export async function transformImageAi(request: TransformImage): Promise<TransformImageResponse> {
  return requestAiJson<TransformImage, TransformImageResponse>('/aiapi/transform_image_ai', { method: 'POST', payload: request });
}

/**
 * Generate a new image using AI
 */
export async function generateNewImage(request: GenerateNewImage): Promise<GenerateImageResponse> {
  return requestAiJson<GenerateNewImage, GenerateImageResponse>('/aiapi/generate_new_image', { method: 'POST', payload: request });
}

/**
 * Update product vector (Admin only)
 */
export async function updateProductVector(request: ModifyProduct): Promise<UpdateProductResponse> {
  return requestAiJson<ModifyProduct, UpdateProductResponse>('/aiapi/admin/update_product', { method: 'POST', payload: request });
}

/**
 * Delete product (Admin only)
 */
export async function deleteProduct(request: ModifyProduct): Promise<DeleteProductResponse> {
  return requestAiJson<ModifyProduct, DeleteProductResponse>('/aiapi/admin/delete_product', { method: 'POST', payload: request });
}

/**
 * Update API key (Admin only)
 */
export async function updateApiKey(request: ApiAi): Promise<UpdateApiKeyResponse> {
  return requestAiJson<ApiAi, UpdateApiKeyResponse>('/aiapi/admin/update_api', { method: 'POST', payload: request });
}

// Utility functions for common use cases

/**
 * Ask a simple question with just text
 */
export async function askSimpleQuestion(question: string): Promise<AskQuestionResponse> {
  return askQuestion({ question });
}

/**
 * Transform image with URL
 */
export async function transformImageWithUrl(imageUrl: string, prompt: string, style?: string, strength?: number): Promise<TransformImageResponse> {
  return transformImageAi({ image_url: imageUrl, prompt, style, strength });
}

/**
 * Transform image with base64
 */
export async function transformImageWithBase64(imageBase64: string, prompt: string, style?: string, strength?: number): Promise<TransformImageResponse> {
  return transformImageAi({ image_base64: imageBase64, prompt, style, strength });
}

/**
 * Generate image with basic parameters
 */
export async function generateImage(prompt: string, style?: string, size?: string, quality?: string): Promise<GenerateImageResponse> {
  return generateNewImage({ prompt, style, size, quality });
}

/**
 * Update product by ID with new data
 */
export async function updateProductById(
  productId: string, 
  updates: Partial<Omit<ModifyProduct, 'product_id'>>
): Promise<UpdateProductResponse> {
  return updateProductVector({ product_id: productId, ...updates });
}

/**
 * Delete product by ID
 */
export async function deleteProductById(productId: string): Promise<DeleteProductResponse> {
  return deleteProduct({ product_id: productId });
}
