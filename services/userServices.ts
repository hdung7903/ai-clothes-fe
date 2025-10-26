import type { GetProfileResponse } from '@/types/user';
import { getApiBaseUrl } from '@/lib/api-config';

const defaultHeaders: HeadersInit = {
  'Accept': 'application/json',
};

function getAccessToken(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('auth.tokens') : null;
    if (!raw) {
      console.log('No auth.tokens found in localStorage');
      return null;
    }
    const parsed = JSON.parse(raw) as { accessToken?: string };
    const token = parsed?.accessToken ?? null;
    console.log('Access token found:', token ? 'Yes' : 'No');
    return token;
  } catch (error) {
    console.error('Error parsing auth tokens:', error);
    return null;
  }
}

function withAuth(headers: HeadersInit): HeadersInit {
  const h = new Headers(headers as HeadersInit);
  const token = getAccessToken();
  if (token) {
    h.set('Authorization', `Bearer ${token}`);
    console.log('Authorization header set with token');
  } else {
    console.log('No token available, request will be unauthorized');
  }
  return h;
}

async function requestJson<TRes>(path: string): Promise<TRes> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + path;
  const res = await fetch(url, {
    method: 'GET',
    headers: withAuth(defaultHeaders),
    credentials: 'include',
  });
  return res.json() as Promise<TRes>;
}

export async function getProfile(jwt?: string): Promise<GetProfileResponse> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + '/api/Account/Profile';
  const headers = new Headers(withAuth(defaultHeaders) as HeadersInit);
  if (jwt) headers.set('Authorization', `Bearer ${jwt}`);

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  return res.json() as Promise<GetProfileResponse>;
}

export interface GetUsersParams {
  keyword?: string;
  fieldName?: string;
  pageNumber: number;
  pageSize: number;
  isBanned?: boolean;
  role?: 'User' | 'Administrator' | 'Moderator';
}

// Define the API response structure
interface GetUsersApiResponse {
  errors: Record<string, string[]>;
  validationErrors: Record<string, string[]>;
  data: {
    items: Array<{
      id: string;
      email: string;
      fullName: string;
      token: number;
      balance: number;
      isBanned: boolean;
      role: string;
    }>;
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  } | null;
  success: boolean;
}

export async function getUsers(params: GetUsersParams): Promise<GetProfileResponse[]> {
  const baseUrl = getApiBaseUrl();
  const searchParams = new URLSearchParams();
  
  // Add required parameters
  searchParams.append('PageNumber', params.pageNumber.toString());
  searchParams.append('PageSize', params.pageSize.toString());
  
  // Add optional parameters
  if (params.keyword) {
    searchParams.append('Keyword', params.keyword);
  }
  if (params.fieldName) {
    searchParams.append('FieldName', params.fieldName);
  }
  if (params.isBanned !== undefined) {
    searchParams.append('IsBanned', params.isBanned.toString());
  }
  if (params.role) {
    searchParams.append('Role', params.role);
  }
  
  const url = baseUrl + '/api/Users?' + searchParams.toString();
  const headers = new Headers(withAuth(defaultHeaders) as HeadersInit);
  
  // Debug: Log the headers to check if token is included
  console.log('getUsers headers:', Object.fromEntries(headers.entries()));
  
  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  
  // Check if response is ok
  if (!res.ok) {
    const errorText = await res.text();
    console.error('getUsers API error:', res.status, errorText);
    
    // Handle error responses
    if (res.status === 400) {
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors?.COMMON_UNAUTHORIZED) {
          console.error('User not authenticated. Redirecting to login...');
          // Clear invalid tokens
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth.tokens');
          }
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          throw new Error('User not authenticated. Please login again.');
        }
        if (errorData.errors?.COMMON_FORBIDDEN) {
          console.error('User does not have permission to access this resource.');
          throw new Error('Bạn không có quyền truy cập tài nguyên này. Vui lòng liên hệ quản trị viên.');
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
    }
    
    throw new Error(`API request failed: ${res.status} ${errorText}`);
  }
  
  const response: GetUsersApiResponse = await res.json();
  
  // Check if API response is successful
  if (!response.success || !response.data) {
    console.error('getUsers API response error:', response);
    throw new Error('API returned unsuccessful response');
  }
  
  // Transform API response to match expected format
  const users: GetProfileResponse[] = response.data.items.map(user => ({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: [user.role],
      tokenCount: user.token,
      balance: user.balance,
      isBanned: user.isBanned,
    }
  }));
  
  return users;
}

// Ban/Unban user API
export async function banUser(userId: string, isBanned: boolean, message?: string): Promise<{ success: boolean; data?: string; errors?: Record<string, string[]>; validationErrors?: Record<string, string[]> }> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + `/api/Users/${userId}/Ban`;
  const headers = new Headers(withAuth(defaultHeaders) as HeadersInit);
  headers.set('Content-Type', 'application/json');

  const body = JSON.stringify({
    isBanned,
    message: message || (isBanned ? 'User has been banned' : 'User has been unbanned')
  });

  console.log('banUser request:', { url, body, headers: Object.fromEntries(headers.entries()) });

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('banUser API error:', res.status, errorText);
    throw new Error(`API request failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

// Change user role API
export async function changeUserRole(userId: string, role: 'User' | 'Administrator'): Promise<{ success: boolean; data?: string; errors?: Record<string, string[]>; validationErrors?: Record<string, string[]> }> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + `/api/Users/${userId}/Role?role=${role}`;
  const headers = new Headers(withAuth(defaultHeaders) as HeadersInit);

  console.log('changeUserRole request:', { url, headers: Object.fromEntries(headers.entries()) });

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('changeUserRole API error:', res.status, errorText);
    throw new Error(`API request failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

// Update user information API
export interface UpdateUserInfoRequest {
  fullName?: string;
  phone?: string;
  bio?: string;
}

export async function updateUserInfo(request: UpdateUserInfoRequest): Promise<{ success: boolean; data?: string; errors?: Record<string, string[]>; validationErrors?: Record<string, string[]> }> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl + '/api/Users/Info';
  const headers = new Headers(withAuth(defaultHeaders) as HeadersInit);
  headers.set('Content-Type', 'application/json');

  const body = JSON.stringify(request);

  console.log('updateUserInfo request:', { url, body, headers: Object.fromEntries(headers.entries()) });

  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body,
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('updateUserInfo API error:', res.status, errorText);
    
    // Handle specific error cases
    if (res.status === 400) {
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors?.COMMON_UNAUTHORIZED) {
          console.error('User not authenticated. Redirecting to login...');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth.tokens');
            window.location.href = '/auth/login';
          }
          throw new Error('User not authenticated. Please login again.');
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
    }
    
    throw new Error(`API request failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

