import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '@/types/auth';
import { authService } from '@/services/auth';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshUser = useCallback(async () => {
    console.log('[AUTH CONTEXT] Refreshing user...');
    try {
      const response = await authService.getProfile();
      console.log('[AUTH CONTEXT] Profile response:', { success: response.success, hasData: !!response.data });
      if (response.success && response.data) {
        console.log('[AUTH CONTEXT] User is authenticated:', response.data.username);
        setState({ user: response.data, isAuthenticated: true, isLoading: false });
        return response.data;
      } else {
        console.log('[AUTH CONTEXT] No user found in profile response');
        setState({ user: null, isAuthenticated: false, isLoading: false });
        return null;
      }
    } catch (error: any) {
      // Handle 401 Unauthorized gracefully - user is not logged in
      if (error.response?.status === 401) {
        console.log('[AUTH CONTEXT] User not authenticated (401)');
        setState({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        // For other errors, keep the current user state (don't logout on server errors)
        console.log('[AUTH CONTEXT] Error refreshing user (non-401):', error.message);
        setState(prev => ({ ...prev, isLoading: false }));
      }
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    console.log('[AUTH CONTEXT] Login attempt:', { email });
    try {
      const response = await authService.login({ email, password });
      console.log('[AUTH CONTEXT] Login response:', { success: response.success, hasData: !!response.data });
      if (response.success && response.data) {
        console.log('[AUTH CONTEXT] Setting user state:', response.data);
        setState({ user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        console.warn('[AUTH CONTEXT] Login response not successful:', response);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('[AUTH CONTEXT] Login error:', error.message || error);
      // Don't change auth state on login failure - let it stay as not authenticated
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('[AUTH CONTEXT] Error during logout:', error);
      // Continue with logout even if the endpoint fails
    } finally {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
