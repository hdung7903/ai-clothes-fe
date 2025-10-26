/**
 * API Configuration
 * Centralized API base URL management
 */

export function getApiBaseUrl(): string {
  // Use NEXT_PUBLIC_API_BASE_URL if available
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  }
  // Fallback to current origin (same-origin requests)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export function getAiBaseUrl(): string {
  // Use NEXT_PUBLIC_AI_BASE_URL if available
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AI_BASE_URL) {
    return process.env.NEXT_PUBLIC_AI_BASE_URL.replace(/\/$/, '');
  }
  // Fallback to current origin (same-origin requests)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}
