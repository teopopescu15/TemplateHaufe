import api from './api';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';

export const authService = {
  async register(credentials: RegisterCredentials): Promise<{ message: string }> {
    const response = await api.post('/api/auth/register', credentials);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    const response = await api.post('/api/auth/login', credentials);
    return { user: response.data.user };
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async verifyEmail(token: string): Promise<{ verified: boolean; message: string }> {
    const response = await api.get(`/api/auth/verify-email?token=${token}`);
    return response.data;
  },

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8000/api/auth/google';
  }
};
