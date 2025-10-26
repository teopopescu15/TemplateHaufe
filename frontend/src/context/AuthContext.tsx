import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User, LoginCredentials, RegisterCredentials, AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: () => {},
  register: async () => {},
  logout: async () => {},
  verifyEmail: async () => ({ verified: false, message: '' })
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isInitialized) return;

      try {
        const { user } = await authService.getCurrentUser();
        setUser(user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { user } = await authService.login(credentials);
    setUser(user);
  };

  const loginWithGoogle = () => {
    authService.loginWithGoogle();
  };

  const register = async (credentials: RegisterCredentials) => {
    await authService.register(credentials);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const verifyEmail = async (token: string) => {
    return await authService.verifyEmail(token);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
