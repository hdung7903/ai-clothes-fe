// Auth service for Authentication endpoints
// Uses fetch with JSON, returns typed responses
import type { ApiEnvelope } from '@/types/shared';
import type {
  RegisterRequest,
  LoginRequest,
  TokenPair,
  RefreshTokenRequest,
  RevokeTokenRequest,
  RequestEmailVerificationRequest,
  VerifyEmailRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  SetPasswordRequest,
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
  RevokeTokenResponse,
  LogOutResponse,
  RequestEmailVerificationResponse,
  VerifyEmailResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse,
  ChangePasswordResponse,
  SetPasswordResponse,
} from '@/types/auth';

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

function getBaseUrl(): string {
  // Prefer NEXT_PUBLIC_API_BASE_URL if provided, fallback to relative
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  }
  return '';
}

async function requestJson<TReq, TRes>(path: string, options: Omit<RequestInit, 'body'> & { payload?: TReq; query?: Record<string, string | number | boolean | undefined>; }): Promise<ApiEnvelope<TRes>> {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const init: RequestInit = {
    method: options.method ?? 'POST',
    headers: { ...defaultHeaders, ...(options.headers ?? {}) },
    credentials: 'include',
  };

  if (options.payload !== undefined) {
    init.body = JSON.stringify(options.payload);
  }

  const res = await fetch(url.toString(), init);
  const json = (await res.json()) as ApiEnvelope<TRes>;
  return json;
}

// Services
export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  return requestJson<RegisterRequest, string>('/Authentication/Register', { payload: request });
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return requestJson<LoginRequest, TokenPair>('/Authentication/Login', { payload: request });
}

export async function refreshToken(request: RefreshTokenRequest, useCookies: boolean = true): Promise<RefreshTokenResponse> {
  return requestJson<RefreshTokenRequest, TokenPair>(
    '/Authentication/RefreshToken',
    { payload: request, query: { useCookies } }
  );
}

// Convenience: refresh tokens using httpOnly cookies on the server without sending a body
export async function refreshTokenUsingCookies(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  return requestJson<RefreshTokenRequest, TokenPair>(
    '/Authentication/RefreshToken',
    { method: 'POST', payload: request, query: { useCookies: true } }
  );
}

export async function revokeToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
  return requestJson<RevokeTokenRequest, string>('/Authentication/RevokeToken', { payload: request });
}

export async function logOut(): Promise<LogOutResponse> {
  return requestJson<undefined, string>('/Authentication/LogOut', { method: 'POST' });
}

export async function requestEmailVerification(request: RequestEmailVerificationRequest): Promise<RequestEmailVerificationResponse> {
  return requestJson<RequestEmailVerificationRequest, string>('/Authentication/RequestEmailVerification', { payload: request });
}

export async function verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  return requestJson<VerifyEmailRequest, string>('/Authentication/VerifyEmail', { payload: request });
}

export async function requestPasswordReset(request: RequestPasswordResetRequest): Promise<RequestPasswordResetResponse> {
  return requestJson<RequestPasswordResetRequest, string>('/Authentication/RequestPasswordReset', { payload: request });
}

export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return requestJson<ResetPasswordRequest, string>('/Authentication/ResetPassword', { payload: request });
}

export async function changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  return requestJson<ChangePasswordRequest, string>('/Authentication/ChangePassword', { payload: request });
}

export async function setPassword(request: SetPasswordRequest): Promise<SetPasswordResponse> {
  return requestJson<SetPasswordRequest, string>('/Authentication/SetPassword', { payload: request });
}


