/**
 * API Configuration
 * Centralized API base URL management
 */


export function getApiBaseUrl(): string {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envBase) {
    // Remove trailing slash if present
    const base = envBase.endsWith("/") ? envBase.slice(0, -1) : envBase;
    // Ensure /api at the end
    return base.endsWith("/api") ? base + "/" : base + "/api";
  }
  return "https://teecraft.com.vn/api/";
}

export function getAiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_AI_BASE_URL || "https://teecraft.com.vn/aiapi/"
  );
}
