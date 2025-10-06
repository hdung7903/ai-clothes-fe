import type { ApiEnvelope } from './shared';

// Auth domain models and requests

export interface AuthEmailPassword {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthEmailPassword {}

export interface LoginRequest extends AuthEmailPassword {}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expireMin: number;
  hasPassword: boolean;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface RevokeTokenRequest {
  refreshToken: string;
}

export interface RequestEmailVerificationRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetCode: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SetPasswordRequest {
  password: string;
}

// Response envelopes for convenience
export type RegisterResponse = ApiEnvelope<string>;
export type LoginResponse = ApiEnvelope<TokenPair>;
export type RefreshTokenResponse = ApiEnvelope<TokenPair>;
export type RevokeTokenResponse = ApiEnvelope<string>;
export type LogOutResponse = ApiEnvelope<string>;
export type RequestEmailVerificationResponse = ApiEnvelope<string>;
export type VerifyEmailResponse = ApiEnvelope<string>;
export type RequestPasswordResetResponse = ApiEnvelope<string>;
export type ResetPasswordResponse = ApiEnvelope<string>;
export type ChangePasswordResponse = ApiEnvelope<string>;
export type SetPasswordResponse = ApiEnvelope<string>;





