import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, LoginResponse } from '../../services/api/client';

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  preferredLanguage: string;
  totalXp: number;
  currentStreak: number;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: '@chinese_learning_token',
  USER: '@chinese_learning_user',
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.auth.login(credentials.email, credentials.password);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Đăng nhập thất bại');
      }

      const { user, accessToken } = response.data!;
      
      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      // Set token for future requests
      api.auth.setToken(accessToken);

      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi không xác định');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    email: string;
    password: string;
    fullName: string;
    level?: string;
    preferredLanguage?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.auth.register(userData);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Đăng ký thất bại');
      }

      const { user, accessToken } = response.data!;
      
      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      // Set token for future requests
      api.auth.setToken(accessToken);

      return { user, accessToken };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi không xác định');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const [token, userString] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (!token || !userString) {
        return rejectWithValue('Không có thông tin đăng nhập');
      }

      const user = JSON.parse(userString);
      
      // Set token for future requests
      api.auth.setToken(token);

      // Verify token by fetching profile
      const profileResponse = await api.auth.getProfile();
      if (!profileResponse.success) {
        // Token invalid, clear storage
        await clearAuthStorage();
        return rejectWithValue('Token không hợp lệ');
      }

      return { user, accessToken: token };
    } catch (error) {
      // Clear corrupted data
      await clearAuthStorage();
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi tải dữ liệu');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear storage
      await clearAuthStorage();
      
      // Clear API token
      api.auth.clearToken();

      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi đăng xuất');
    }
  }
);

// Helper function to clear auth storage
const clearAuthStorage = async () => {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.USER),
  ]);
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update storage
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      }
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
        state.isLoading = false;
        state.user = action.payload.user as User;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as User;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadStoredAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setLoading, updateUser } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;