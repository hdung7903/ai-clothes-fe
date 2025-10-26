/**
 * Debug utility to check authentication token
 * Use this in browser console to verify token
 */

export function checkAuthToken() {
  if (typeof window === 'undefined') {
    console.log('⚠️ Running on server side');
    return null;
  }

  try {
    const raw = localStorage.getItem('auth.tokens');
    console.log('📦 Raw auth.tokens:', raw);

    if (!raw) {
      console.error('❌ No auth.tokens found in localStorage');
      return null;
    }

    const parsed = JSON.parse(raw);
    console.log('📝 Parsed tokens:', {
      hasAccessToken: !!parsed.accessToken,
      hasRefreshToken: !!parsed.refreshToken,
      accessTokenPreview: parsed.accessToken?.substring(0, 20) + '...',
    });

    return parsed;
  } catch (error) {
    console.error('❌ Error parsing auth.tokens:', error);
    return null;
  }
}

export function testAuthHeader() {
  const tokens = checkAuthToken();
  
  if (!tokens?.accessToken) {
    console.error('❌ No access token available');
    return;
  }

  console.log('✅ Authorization header would be:');
  console.log(`Bearer ${tokens.accessToken.substring(0, 20)}...`);
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).checkAuthToken = checkAuthToken;
  (window as any).testAuthHeader = testAuthHeader;
}

console.log('🔧 Auth debug utilities loaded. Use:');
console.log('  checkAuthToken() - Check current token');
console.log('  testAuthHeader() - Preview auth header');
