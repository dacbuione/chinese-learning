import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api/client';

interface User {
  id: string;
  email: string;
  fullName: string;
  level: string;
  preferredLanguage: string;
  totalXp: number;
  currentStreak: number;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@ChineseApp:token');
      const storedUser = await AsyncStorage.getItem('@ChineseApp:user');

      if (storedToken && storedUser) {
        api.auth.setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      
      if (response.success && response.data) {
        const { user, accessToken } = response.data;
        
        // Store token and user data
        await AsyncStorage.setItem('@ChineseApp:token', accessToken);
        await AsyncStorage.setItem('@ChineseApp:user', JSON.stringify(user));
        
        // Set token in API client
        api.auth.setToken(accessToken);
        
        // Update state
        setUser(user);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await api.auth.register(userData);
      
      if (response.success && response.data) {
        const { user, accessToken } = response.data;
        
        // Store token and user data
        await AsyncStorage.setItem('@ChineseApp:token', accessToken);
        await AsyncStorage.setItem('@ChineseApp:user', JSON.stringify(user));
        
        // Set token in API client
        api.auth.setToken(accessToken);
        
        // Update state
        setUser(user);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('@ChineseApp:token');
      await AsyncStorage.removeItem('@ChineseApp:user');
      
      // Clear API token
      api.auth.clearToken();
      
      // Clear state
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 