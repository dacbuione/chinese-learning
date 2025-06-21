import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  loginUser,
  registerUser,
  loadStoredAuth,
  logoutUser,
  clearError,
  updateUser,
  User,
} from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);

  // Auto-load stored auth on app start
  useEffect(() => {
    if (!isAuthenticated && !isLoading && !error) {
      dispatch(loadStoredAuth());
    }
  }, [dispatch, isAuthenticated, isLoading, error]);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    return result.meta.requestStatus === 'fulfilled';
  };

  const register = async (userData: {
    email: string;
    password: string;
    fullName: string;
    level?: string;
    preferredLanguage?: string;
  }) => {
    const result = await dispatch(registerUser(userData));
    return result.meta.requestStatus === 'fulfilled';
  };

  const logout = async () => {
    const result = await dispatch(logoutUser());
    return result.meta.requestStatus === 'fulfilled';
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const updateUserProfile = (userData: Partial<User>) => {
    dispatch(updateUser(userData));
  };

  const refreshAuth = () => {
    dispatch(loadStoredAuth());
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    auth,

    // Actions
    login,
    register,
    logout,
    clearAuthError,
    updateUserProfile,
    refreshAuth,

    // Computed values
    isLoggedIn: isAuthenticated && !!user,
    userLevel: user?.level || 'beginner',
    userLanguage: user?.preferredLanguage || 'vi',
    userXp: user?.totalXp || 0,
    userStreak: user?.currentStreak || 0,
  };
};

export default useAuth; 