import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  userToken: string | null;
  status: 'idle' | 'loading' | 'success' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userToken: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string }>) => {
      state.isLoggedIn = true;
      state.userToken = action.payload.token;
      state.status = 'success';
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoggedIn = false;
      state.userToken = null;
      state.status = 'failed';
      state.error = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userToken = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
      state.status = 'idle';
    },
  },
});

export const { setLoading, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;