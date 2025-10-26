# Haufe Hack Project - Part 2: Frontend Pages & UI Components

## 📄 Frontend Pages Implementation

### File: `frontend/src/pages/Login.tsx`

```typescript
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const oauthError = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">Please login to continue</p>
        </div>

        {/* OAuth Error */}
        {oauthError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              {oauthError === 'oauth_failed' && 'Google login failed. Please try again.'}
              {oauthError === 'server_error' && 'Server error. Please try again later.'}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 transition font-medium mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
```

### File: `frontend/src/pages/Register.tsx`

```typescript
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/\d/.test(pwd)) return 'Password must contain at least one number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await register({ email, password, name });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification email to <strong className="text-gray-900">{email}</strong>.
            Please check your inbox and click the verification link.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">Join us and start your journey</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be 8+ characters with uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
```

### File: `frontend/src/pages/VerifyEmail.tsx`

```typescript
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing');
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verify = async () => {
      try {
        const result = await verifyEmail(token);
        setStatus('success');
        setMessage(result.message || 'Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Email verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [searchParams, verifyEmail]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
```

### File: `frontend/src/pages/AuthSuccess.tsx`

```typescript
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login?error=oauth_failed', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Completing Sign In...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
```

### File: `frontend/src/pages/Dashboard.tsx`

```typescript
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
              Welcome to the Dashboard!
            </h1>
            <p className="text-gray-600">You are successfully authenticated</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">User Information</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Name:</strong> {user?.display_name}</p>
              <p><strong>Email Verified:</strong> {user?.email_verified ? '✅ Yes' : '❌ No'}</p>
              <p><strong>User ID:</strong> {user?.id}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

---

## 🚀 Running the Application

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
⚡️[server]: Server is running at http://localhost:3000
✅ Connected to PostgreSQL database
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v7.1.7  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ Testing the Application

### Test 1: Email/Password Registration
1. Open `http://localhost:5173`
2. Click "Sign up"
3. Fill form: Name, Email, Password (8+ chars, uppercase, lowercase, number)
4. Click "Sign Up"
5. Check your Gmail inbox for verification email
6. Click verification link
7. Login with email and password

### Test 2: Google OAuth Login
1. Go to `http://localhost:5173/login`
2. Click "Continue with Google"
3. Select Google account
4. Redirected to dashboard

### Test 3: Protected Routes
1. Logout
2. Try accessing `http://localhost:5173/dashboard`
3. Should redirect to `/login`

### Test 4: JWT Tokens
1. Login successfully
2. Open browser DevTools → Application → Cookies → `http://localhost:5173`
3. Should see `accessToken` and `refreshToken` (httpOnly cookies)

---

## 🔐 Security Features Implemented

✅ **Password Security:**
- Bcrypt hashing (10 salt rounds)
- Password requirements enforced (8+ chars, uppercase, lowercase, number)

✅ **JWT Security:**
- httpOnly cookies (XSS protection)
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Secure cookies in production (HTTPS only)

✅ **Email Verification:**
- Random 64-character hex tokens
- 24-hour expiration
- One-time use (cleared after verification)

✅ **CORS Protection:**
- Credentials enabled for cookie transmission
- Configurable allowed origins

✅ **Input Validation:**
- Backend validation with express-validator
- Frontend validation with regex patterns

---

## 📊 Database Schema

**Users Table:**
```sql
id                          SERIAL PRIMARY KEY
google_id                   VARCHAR(255) UNIQUE (nullable)
email                       VARCHAR(255) UNIQUE NOT NULL
display_name                VARCHAR(255) NOT NULL
profile_picture             TEXT (nullable)
password_hash               VARCHAR(255) (nullable for OAuth)
email_verified              BOOLEAN DEFAULT FALSE
verification_token          VARCHAR(255) (nullable)
verification_token_expires  TIMESTAMPTZ (nullable)
created_at                  TIMESTAMPTZ DEFAULT NOW()
updated_at                  TIMESTAMPTZ DEFAULT NOW()
```

---

## 🛠️ Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify database exists: `sudo -u postgres psql -l | grep auth_project`
- Check `.env` file exists with correct values

### Email not sending
- Verify Gmail App Password (16 characters, no spaces)
- Check 2-Step Verification is enabled on Google account
- Check SMTP settings in `.env`

### Google OAuth not working
- Verify redirect URI in Google Cloud Console: `http://localhost:3000/api/auth/google/callback`
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env`
- Clear browser cookies and try again

### Frontend can't connect to backend
- Check CORS_ORIGIN in backend `.env` matches frontend URL
- Verify backend is running on port 3000
- Check VITE_API_URL in frontend `.env`

### Cookies not being set
- Check `withCredentials: true` in axios config
- Verify `credentials: true` in backend CORS config
- Check cookie settings in browser (allow cookies)

---

## 📝 Next Steps

After setup, you can:

1. **Customize UI:** Update colors, fonts, and styling in Tailwind CSS
2. **Add Features:** Password reset, profile management, etc.
3. **Deploy:** Add production environment variables and deploy to cloud
4. **Add Testing:** Jest, React Testing Library, Supertest
5. **Add Logging:** Winston or Pino for structured logging

---

## 🎉 Conclusion

You now have a complete, production-ready authentication system with:
- ✅ Google OAuth login
- ✅ Email/password authentication
- ✅ Email verification with Nodemailer
- ✅ JWT authentication with httpOnly cookies
- ✅ Protected routes
- ✅ TypeScript type safety
- ✅ Modern UI with Tailwind CSS

**Total Files Created:** ~35 files
**Lines of Code:** ~2500+ lines
**Features:** Registration, Login, OAuth, Email Verification, Protected Routes

---

**Created:** 2025-01-XX
**Version:** 1.0.0
**Source Project:** SimulareHackathon2 AI Zen Garden
