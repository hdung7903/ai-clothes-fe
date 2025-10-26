// Order service for Order endpoints
// Uses fetch with JSON, returns typed responses with Bearer token authentication
import type { ApiEnvelope } from '@/types/shared';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersQuery,
  GetOrdersResponse,
  GetOrderByIdResponse,
  UpdateOrderStatusByUserRequest,
  UpdateOrderStatusByUserResponse,
  AdminGetOrdersQuery,
  AdminGetOrdersResponse,
  AdminUpdateOrderStatusRequest,
  AdminUpdateOrderStatusResponse,
  AdminUpdatePaymentStatusRequest,
  AdminUpdatePaymentStatusResponse,
} from '@/types/order';
import { getApiBaseUrl } from '@/lib/api-config';

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};


function getAuthHeaders(): HeadersInit | null {
  // Get token from localStorage (same pattern as other services)
  let token: string | null = null;
  
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('auth.tokens');
      console.log('🔍 Checking localStorage for auth.tokens:', raw ? 'Found' : 'Not found');
      
      if (raw) {
        const parsed = JSON.parse(raw) as { accessToken?: string };
        token = parsed?.accessToken ?? null;
        console.log('🔍 Parsed token:', token ? token.substring(0, 20) + '...' : 'No accessToken');
      }
    } catch (error) {
      console.warn('❌ Failed to parse auth tokens from localStorage:', error);
      token = null;
    }
  } else {
    console.log('🔍 Running on server side, no localStorage access');
  }

  if (!token) {
    // Return null instead of throwing error - let the calling code handle it
    console.warn('⚠️ No authentication token found in localStorage');
    return null;
  }

  console.log('✅ Authentication token found, creating headers');
  return {
    'Authorization': `Bearer ${token}`,
  };
}

async function requestJson<TReq, TRes>(
  path: string, 
  options: Omit<RequestInit, 'body'> & { 
    payload?: TReq; 
    query?: Record<string, string | number | boolean | undefined>;
    requireAuth?: boolean;
  }
): Promise<ApiEnvelope<TRes>> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(path, baseUrl);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const headers: HeadersInit = { ...defaultHeaders };
  
  // Add authentication headers if required
  if (options.requireAuth !== false) {
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      throw new Error('AUTHENTICATION_REQUIRED: No valid authentication token found');
    }
    Object.assign(headers, authHeaders);
  }

  const init: RequestInit = {
    method: options.method ?? 'POST',
    headers: { ...headers, ...(options.headers ?? {}) },
    credentials: 'include',
  };

  if (options.payload !== undefined) {
    init.body = JSON.stringify(options.payload);
  }

  const res = await fetch(url.toString(), init);
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  const json = (await res.json()) as ApiEnvelope<TRes>;
  return json;
}

// Order Services

/**
 * Create a new order
 * @param request - Order creation request
 * @returns Promise with order creation response
 */
export async function createOrder(request: CreateOrderRequest): Promise<ApiEnvelope<CreateOrderResponse>> {
  return requestJson<CreateOrderRequest, CreateOrderResponse>('/api/Order', { 
    method: 'POST',
    payload: request,
    requireAuth: true
  });
}

/**
 * Get orders with pagination and optional status filter
 * @param query - Query parameters for pagination and filtering
 * @returns Promise with paginated orders response
 */
export async function getOrders(query: GetOrdersQuery): Promise<ApiEnvelope<GetOrdersResponse>> {
  return requestJson<undefined, GetOrdersResponse>('/api/Order', {
    method: 'GET',
    query: {
      PageNumber: query.pageNumber,
      PageSize: query.pageSize,
      ...(query.status && { Status: query.status })
    },
    requireAuth: true
  });
}

/**
 * Get a specific order by ID
 * @param orderId - The order ID (GUID)
 * @returns Promise with order details response
 */
export async function getOrderById(orderId: string): Promise<ApiEnvelope<GetOrderByIdResponse>> {
  return requestJson<undefined, GetOrderByIdResponse>(`/api/Order/${orderId}`, {
    method: 'GET',
    requireAuth: true
  });
}

// Utility functions for common order operations

/**
 * Get orders for the current user (convenience method)
 * @param pageNumber - Page number (default: 1)
 * @param pageSize - Page size (default: 10)
 * @param status - Optional status filter
 * @returns Promise with user's orders
 */
export async function getUserOrders(
  pageNumber: number = 1, 
  pageSize: number = 10, 
  status?: string
): Promise<ApiEnvelope<GetOrdersResponse>> {
  return getOrders({ pageNumber, pageSize, status });
}

/**
 * Get all orders (admin function)
 * @param pageNumber - Page number (default: 1)
 * @param pageSize - Page size (default: 20)
 * @param status - Optional status filter
 * @returns Promise with all orders
 */
export async function getAllOrders(
  pageNumber: number = 1, 
  pageSize: number = 20, 
  status?: string
): Promise<ApiEnvelope<GetOrdersResponse>> {
  return getOrders({ pageNumber, pageSize, status });
}

// New Endpoints

// User updates order status (feedback/rating)
export async function updateOrderStatusByUser(
  orderId: string,
  payload: UpdateOrderStatusByUserRequest
): Promise<ApiEnvelope<UpdateOrderStatusByUserResponse>> {
  return requestJson<UpdateOrderStatusByUserRequest, UpdateOrderStatusByUserResponse>(
    `/api/Order/${orderId}/status`,
    {
      method: 'PUT',
      payload,
      requireAuth: true,
    }
  );
}

// Admin: list all orders with filters
export async function adminGetAllOrders(
  query: AdminGetOrdersQuery
): Promise<ApiEnvelope<AdminGetOrdersResponse>> {
  return requestJson<undefined, AdminGetOrdersResponse>(
    '/api/Order/admin/all',
    {
      method: 'GET',
      query: {
        PageNumber: query.pageNumber,
        PageSize: query.pageSize,
        ...(query.status !== undefined ? { Status: query.status } : {}),
        ...(query.paymentStatus !== undefined ? { PaymentStatus: query.paymentStatus } : {}),
        ...(query.customerName ? { CustomerName: query.customerName } : {}),
        ...(query.customerEmail ? { CustomerEmail: query.customerEmail } : {}),
      },
      requireAuth: true,
    }
  );
}

// Admin: get single order
export async function adminGetOrderById(
  orderId: string
): Promise<ApiEnvelope<GetOrderByIdResponse>> {
  return requestJson<undefined, GetOrderByIdResponse>(
    `/api/Order/admin/${orderId}`,
    {
      method: 'GET',
      requireAuth: true,
    }
  );
}

// Admin: update order status
export async function adminUpdateOrderStatus(
  orderId: string,
  payload: AdminUpdateOrderStatusRequest
): Promise<ApiEnvelope<AdminUpdateOrderStatusResponse>> {
  return requestJson<AdminUpdateOrderStatusRequest, AdminUpdateOrderStatusResponse>(
    `/api/Order/admin/${orderId}/Status`,
    {
      method: 'PUT',
      payload,
      requireAuth: true,
    }
  );
}

// Admin: update payment status
export async function adminUpdatePaymentStatus(
  orderId: string,
  payload: AdminUpdatePaymentStatusRequest
): Promise<ApiEnvelope<AdminUpdatePaymentStatusResponse>> {
  return requestJson<AdminUpdatePaymentStatusRequest, AdminUpdatePaymentStatusResponse>(
    `/api/Order/admin/${orderId}/PaymentStatus`,
    {
      method: 'PUT',
      payload,
      requireAuth: true,
    }
  );
}

// Check if order is paid
export async function checkOrderPaymentStatus(
  orderId: string
): Promise<ApiEnvelope<boolean>> {
  return requestJson<never, boolean>(
    `/api/Order/${orderId}/IsPaid`,
    {
      method: 'GET',
      requireAuth: true,
    }
  );
}

