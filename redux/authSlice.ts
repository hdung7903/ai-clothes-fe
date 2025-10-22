import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { TokenPair, LoginRequest, RegisterRequest, RequestPasswordResetRequest, RequestEmailVerificationRequest, VerifyEmailRequest } from '@/types/auth';
import type { ResetPasswordRequest } from '@/types/auth';
import type { UserProfile } from '@/types/user';
import { getProfile } from '@/services/userServices';
import { login, register, requestPasswordReset, resetPassword, logOut, refreshToken, revokeToken, requestEmailVerification, verifyEmail } from '@/services/authServices';

// Auth state interface
export interface AuthState {
  user: UserProfile | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastErrorPayload?: any;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (accessToken: string, { rejectWithValue }) => {
    try {
      const response = await getProfile(accessToken);
      if (response.success && response.data) {
        return response.data as UserProfile;
      } else {
        return rejectWithValue(response.errors || { general: ['Failed to load profile'] });
      }
    } catch (error) {
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await login(credentials);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.errors || { general: ['Login failed'] });
      }
    } catch (error) {
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await register(userData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.errors || { general: ['Registration failed'] });
      }
    } catch (error) {
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);

export const requestEmailVerificationAction = createAsyncThunk(
  'auth/requestEmailVerification',
  async (payload: RequestEmailVerificationRequest, { rejectWithValue }) => {
    try {
      const response = await requestEmailVerification(payload);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.errors || { general: ['Failed to send verification email'] });
      }
    } catch (error) {
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);

export const verifyEmailAction = createAsyncThunk(
  'auth/verifyEmail',
  async (payload: VerifyEmailRequest, { rejectWithValue }) => {
    try {
      const response = await verifyEmail(payload);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.errors || { general: ['Email verification failed'] });
      }
    } catch (error) {
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);

export const requestPasswordResetAction = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email: RequestPasswordResetRequest, { rejectWithValue }) => {
    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.errors || { general: ['Failed to send reset email'] });
      }
    } catch (error) {
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);

export const resetPasswordAction = createAsyncThunk(
  'auth/resetPassword',
  async (payload: ResetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await resetPassword(payload);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.errors || { general: ['Failed to reset password'] });
      }
    } catch (error) {
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      console.log('🔄 Starting logout process...');
      const state = getState() as { auth: AuthState };
      const refreshTokenValue = state.auth.tokens?.refreshToken;
      
      if (refreshTokenValue) {
        try {
          console.log('🔄 Revoking refresh token...');
          await revokeToken({ refreshToken: refreshTokenValue });
          console.log('✅ Refresh token revoked successfully');
        } catch (revokeError) {
          console.warn('⚠️ Failed to revoke refresh token:', revokeError);
          // best-effort revoke; continue to logOut
        }
      }

      console.log('🔄 Calling logout API...');
      const response = await logOut();
      console.log('📡 Logout API response:', response);
      
      if (response.success) {
        console.log('✅ Logout successful');
        return true;
      } else {
        console.error('❌ Logout failed with errors:', response.errors);
        return rejectWithValue(response.errors || { general: ['Logout failed'] });
      }
    } catch (error) {
      console.error('❌ Logout network error:', error);
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (tokens: TokenPair, { rejectWithValue }) => {
    try {
      const response = await refreshToken(tokens);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.errors || { general: ['Token refresh failed'] });
      }
    } catch (error) {
      return rejectWithValue({ general: ['Network error occurred'] });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setTokens: (state, action: PayloadAction<TokenPair | null>) => {
      state.tokens = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('✅ Login successful, setting tokens:', action.payload);
        state.isLoading = false;
        state.tokens = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Auth state updated:', { 
          hasTokens: !!state.tokens, 
          isAuthenticated: state.isAuthenticated 
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        // Lưu toàn bộ payload để có thể kiểm tra chi tiết
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Login failed';
        // Lưu payload gốc để component có thể kiểm tra
        (state as any).lastErrorPayload = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Registration failed';
      })
      // Email verification request
      .addCase(requestEmailVerificationAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestEmailVerificationAction.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestEmailVerificationAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Failed to send verification email';
      })
      // Verify email
      .addCase(verifyEmailAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailAction.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyEmailAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Email verification failed';
      })
      // Password reset
      .addCase(requestPasswordResetAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPasswordResetAction.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestPasswordResetAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Failed to send reset email';
      })
      // Reset password
      .addCase(resetPasswordAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordAction.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Failed to reset password';
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Logout failed';
      })
      // Token refresh
      .addCase(refreshUserToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tokens = action.payload;
        state.error = null;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Token refresh failed';
      })
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        console.log('✅ User profile fetched successfully:', action.payload);
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Auth state updated with user:', { 
          hasTokens: !!state.tokens, 
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          userRoles: state.user?.roles
        });
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ? Object.values(action.payload).flat().join(', ') : 'Failed to load profile';
      });
  },
});

export const { clearError, setUser, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;



