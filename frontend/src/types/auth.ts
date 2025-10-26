export interface User {
  id: number;
  email: string;
  display_name: string;
  profile_picture: string | null;
  email_verified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ verified: boolean; message: string }>;
}
