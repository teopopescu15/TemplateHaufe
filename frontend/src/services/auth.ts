import api from './api';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';

// Determine the OAuth base URL based on environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const OAUTH_BASE_URL = isProduction
  ? window.location.origin  // Use current domain in production
  : 'http://localhost:9000';

export const authService = {
  async register(credentials: RegisterCredentials): Promise<{ message: string }> {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    const response = await api.post('/auth/login', credentials);
    return { user: response.data.user };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<void> {
    await api.post('/auth/refresh');
  },

  async verifyEmail(token: string): Promise<{ verified: boolean; message: string }> {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  loginWithGoogle(): void {
    window.location.href = `${OAUTH_BASE_URL}/api/auth/google`;
  }
};
