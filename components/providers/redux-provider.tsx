"use client"

import { Provider } from 'react-redux';
import { store } from '@/redux';
import { useEffect, useRef } from 'react';
import { fetchUserProfile, setTokens, setBootstrapComplete } from '@/redux/authSlice';
import { refreshTokenUsingCookies } from '@/services/authServices';
import { fetchCartItems } from '@/redux/cartSlice';
import type { TokenPair } from '@/types/auth';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  const isBootstrapped = useRef(false);

  // Bootstrap auth on the client after hydration
  // 1) Attempt refresh via cookies to obtain a fresh access token
  // 2) If access token obtained, fetch user profile and populate state
  useEffect(() => {
    // Chỉ bootstrap một lần
    if (isBootstrapped.current) {
      return;
    }
    isBootstrapped.current = true;

    let cancelled = false;

    // Persist tokens on any store update
    const unsubscribe = store.subscribe(() => {
      const state = store.getState() as { auth: { tokens: TokenPair | null, isAuthenticated: boolean, user: any } };
      const tokens = state.auth.tokens;
      
      if (tokens) {
        try {
          localStorage.setItem('auth.tokens', JSON.stringify(tokens));
        } catch (error) {
          console.error('❌ Failed to save tokens to localStorage:', error);
        }
      } else {
        try {
          localStorage.removeItem('auth.tokens');
        } catch (error) {
          console.error('❌ Failed to remove tokens from localStorage:', error);
        }
      }
    });


    // Bootstrap: use stored tokens to refresh with cookies and restore user
    (async () => {
      try {
        let stored: TokenPair | null = null;
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem('auth.tokens') : null;
          stored = raw ? (JSON.parse(raw) as TokenPair) : null;
        } catch (error) {
          console.warn('Failed to parse stored tokens:', error);
          stored = null;
          // Clear invalid tokens
          localStorage.removeItem('auth.tokens');
        }

        // Fetch cart items from server on startup
        store.dispatch(fetchCartItems());

        if (stored) {
          console.log('🔄 Found stored tokens, attempting refresh...');
          const refreshed = await refreshTokenUsingCookies({
            accessToken: stored.accessToken,
            refreshToken: stored.refreshToken,
          });
          if (!cancelled && refreshed.success && refreshed.data) {
            console.log('✅ Token refresh successful');
            store.dispatch(setTokens(refreshed.data));
            const profileResult = await store.dispatch(fetchUserProfile(refreshed.data.accessToken));
            if (profileResult.type.endsWith('/fulfilled')) {
              console.log('✅ Bootstrap authentication successful');
            } else {
              console.warn('⚠️ Profile fetch failed, clearing tokens');
              localStorage.removeItem('auth.tokens');
              store.dispatch(setTokens(null));
            }
          } else {
            console.warn('❌ Token refresh failed, clearing stored tokens');
            localStorage.removeItem('auth.tokens');
            store.dispatch(setTokens(null));
          }
        } else {
          console.log('ℹ️ No stored tokens found');
        }
      } catch (error) {
        console.error('❌ Bootstrap authentication failed:', error);
        // Clear invalid tokens
        try {
          localStorage.removeItem('auth.tokens');
          store.dispatch(setTokens(null));
        } catch (cleanupError) {
          console.error('Failed to cleanup after bootstrap error:', cleanupError);
        }
      } finally {
        // Always mark bootstrap as complete, even if it failed
        // This must happen to prevent infinite loading states
        if (!cancelled) {
          console.log('🏁 Bootstrap complete');
          store.dispatch(setBootstrapComplete());
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

