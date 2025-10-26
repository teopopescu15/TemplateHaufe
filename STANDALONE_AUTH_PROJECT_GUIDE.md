# Haufe Hack Project - Complete Implementation Guide

## 📋 Project Overview

This guide provides a complete implementation for a standalone authentication system with:
- **Google OAuth Login** - Sign in with Google account
- **Email/Password Authentication** - Traditional registration with email verification
- **Email Verification** - Nodemailer with Gmail SMTP
- **JWT Authentication** - Secure httpOnly cookies with crypto-generated tokens
- **Protected Dashboard** - Empty dashboard accessible only to authenticated users

**Tech Stack:**
- **Backend:** Node.js + Express + TypeScript + PostgreSQL
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Authentication:** Passport.js (Google OAuth) + bcryptjs + JWT
- **Email:** Nodemailer (Gmail SMTP)

---

## 🔧 Part 1: Installation & Setup

### Prerequisites
- **Node.js** v18+ (with npm)
- **PostgreSQL** v12+ (installed on WSL)
- **pgAdmin 4** (for database management)
- **Gmail Account** (for SMTP email sending)
- **Google Cloud Console Account** (for OAuth credentials)

---

## 📦 Step 1: Create Project Structure

```bash
# Create project directory
mkdir haufe-hack-project
cd haufe-hack-project

# Create backend and frontend directories
mkdir backend frontend
```

---

## 📥 Step 2: Backend Installation

Navigate to backend directory and create package.json:

```bash
cd backend
```

**IMPORTANT:** Create `package.json` file manually first (see below), THEN run `npm install`.

You must create the package.json file before installing because npm needs it to know what packages to install.

### Create package.json file first

Create `backend/package.json` with this content (see below in Part 3 for the complete file).

Then install all dependencies:

```bash
npm install
```

This will install all dependencies listed in package.json (both production and development dependencies).

---

## 📥 Step 3: Frontend Installation

Navigate to frontend directory:

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
```

When prompted:
- Package name: `frontend`
- Select framework: `React`
- Select variant: `TypeScript`

This creates basic Vite + React + TypeScript setup with a default package.json.

### Update package.json and install dependencies

Replace the default `frontend/package.json` with the complete version provided in Part 4 below.

Then install all dependencies:

```bash
npm install
```

This installs all dependencies listed in package.json.

---

## 🗄️ Step 4: PostgreSQL Database Setup

### 4.1: Create Database in WSL PostgreSQL

**Using Terminal (psql command line):**

```bash
# Start PostgreSQL service (if not running)
sudo service postgresql start

# Connect to PostgreSQL
sudo -u postgres psql

# Inside psql, run these SQL commands:
CREATE DATABASE "Haufe_Hack";

# Create user (optional - recommended for security)
CREATE USER haufe_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "Haufe_Hack" TO haufe_user;

# Exit psql
\q
```

**Note:** The database name uses quotes because it contains uppercase letters and underscore.

**Alternative: Using pgAdmin 4**

1. Open pgAdmin 4
2. Connect to your WSL PostgreSQL server:
   - Right-click "Servers" → "Create" → "Server"
   - **General Tab:**
     - Name: `WSL PostgreSQL`
   - **Connection Tab:**
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: Your PostgreSQL password
     - Save password: ✅
   - Click "Save"

3. Create database:
   - Expand "WSL PostgreSQL" server
   - Right-click "Databases" → "Create" → "Database"
   - Database name: `Haufe_Hack`
   - Owner: `postgres` (or `haufe_user`)
   - Click "Save"

### 4.2: Create Users Table

**Using psql:**

```bash
# Connect to the Haufe_Hack database
sudo -u postgres psql -d "Haufe_Hack"

# Copy and paste the SQL below, then press Enter
```

**Alternative: Using pgAdmin 4**

1. In pgAdmin, expand `WSL PostgreSQL` → `Databases` → `Haufe_Hack`
2. Click "Tools" → "Query Tool"
3. Copy and paste the SQL below
4. Click "Execute" (▶️ button)

**SQL Schema:**

```sql
-- Users table with support for Google OAuth and email/password
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  profile_picture TEXT,
  password_hash VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_verification_token ON users(verification_token);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with support for Google OAuth and email/password authentication';
COMMENT ON COLUMN users.google_id IS 'Google OAuth unique user ID (null for email/password users)';
COMMENT ON COLUMN users.email_verified IS 'TRUE for Google OAuth users (auto-verified) or email/password users who clicked verification link';
COMMENT ON COLUMN users.verification_token IS 'Random token sent via email for email verification';
```

**Verify table creation:**

```sql
-- Check table structure (in psql)
\d users

-- Or in pgAdmin, refresh and expand:
-- Haufe_Hack → Schemas → public → Tables → users
```

---

## 🔑 Step 5: Environment Variables Setup

### 5.1: Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen (if first time)
6. Application type: "Web application"
7. Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
8. Copy **Client ID** and **Client Secret**

### 5.2: Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" (if not enabled)
3. Go to "App passwords"
4. Generate app password for "Mail"
5. Copy the 16-character password (no spaces)

### 5.3: Backend Environment File

Create `backend/.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Haufe_Hack
DB_USER=postgres
DB_PASSWORD=your_postgresql_password_here

# JWT Configuration (generate random 32+ character strings)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_random
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters_random

# Google OAuth Configuration (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Gmail SMTP Configuration (from Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_16_char_app_password_here
EMAIL_FROM=your_gmail_address@gmail.com

# Email Verification Token Expiration (hours)
VERIFICATION_TOKEN_EXPIRES_HOURS=24
```

**Environment Variables You Need from Your Current Project:**
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - Generate a random 32+ character string
- `JWT_REFRESH_SECRET` - Generate a different random 32+ character string
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `SMTP_USER` - Your Gmail address
- `SMTP_PASS` - Your Gmail app password

### 5.4: Frontend Environment File

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

---

## 📁 Part 2: Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts           # PostgreSQL connection pool
│   │   └── passport.ts            # Google OAuth Passport strategy
│   ├── controllers/
│   │   └── authController.ts      # Authentication logic
│   ├── middleware/
│   │   └── auth.ts                # JWT verification middleware
│   ├── repositories/
│   │   └── UserRepository.ts      # Database operations
│   ├── routes/
│   │   └── auth.ts                # Authentication routes
│   ├── services/
│   │   ├── jwtService.ts          # JWT token generation/verification
│   │   └── emailService.ts        # Email verification sending
│   ├── types/
│   │   └── express.d.ts           # TypeScript type extensions
│   └── index.ts                   # Express server entry point
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore
├── package.json
└── tsconfig.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── alert.tsx
│   │   │   └── separator.tsx
│   │   └── ProtectedRoute.tsx     # Route protection component
│   ├── context/
│   │   └── AuthContext.tsx        # Global auth state
│   ├── hooks/
│   │   └── useAuth.ts             # Auth context hook
│   ├── pages/
│   │   ├── Login.tsx              # Login page
│   │   ├── Register.tsx           # Registration page
│   │   ├── VerifyEmail.tsx        # Email verification page
│   │   ├── AuthSuccess.tsx        # OAuth callback handler
│   │   └── Dashboard.tsx          # Protected dashboard (empty)
│   ├── services/
│   │   ├── api.ts                 # Axios configuration
│   │   └── auth.ts                # Auth API calls
│   ├── types/
│   │   └── auth.ts                # TypeScript interfaces
│   ├── App.tsx                    # React Router setup
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind CSS imports
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

## 💻 Part 3: Backend Implementation

### File: `backend/package.json`

**Create this file manually in `backend/package.json` before running `npm install`:**

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "type": "commonjs",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "express-validator": "^7.2.1",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^7.0.9",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.9",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^24.8.1",
    "@types/nodemailer": "^7.0.2",
    "@types/passport": "^1.0.17",
    "@types/passport-google-oauth20": "^2.0.16",
    "@types/pg": "^8.15.5",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

### File: `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "types": ["node"],
    "typeRoots": ["./node_modules/@types", "./src/types"],
    "sourceMap": true,
    "declaration": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### File: `backend/.gitignore`

```
node_modules/
dist/
.env
*.log
.DS_Store
```

### File: `backend/src/index.ts`

```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import authRoutes from './routes/auth';
import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true  // Allow cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Authentication API is running' });
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
```

### File: `backend/src/config/database.ts`

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
```

### File: `backend/src/config/passport.ts`

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import * as UserRepository from '../repositories/UserRepository';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    scope: ['profile', 'email']
  },
  async (
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      // Check if user exists by Google ID
      let user = await UserRepository.findByGoogleId(profile.id);

      if (user) {
        return done(null, { id: user.id, email: user.email });
      }

      // Check if user exists by email
      user = await UserRepository.findByEmail(email);

      if (user) {
        // Email exists with different auth method
        return done(new Error('An account with this email already exists. Please login with email/password.'));
      }

      // Create new user with Google OAuth
      user = await UserRepository.createUser({
        google_id: profile.id,
        email: email,
        display_name: profile.displayName || email.split('@')[0],
        profile_picture: profile.photos?.[0]?.value,
        email_verified: true
      });

      return done(null, { id: user.id, email: user.email });
    } catch (err) {
      return done(err as Error);
    }
  }
));

export default passport;
```

### File: `backend/src/controllers/authController.ts`

```typescript
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import * as UserRepository from '../repositories/UserRepository';
import { generateAccessToken, generateRefreshToken } from '../services/jwtService';
import {
  sendVerificationEmail,
  generateVerificationToken,
  getVerificationTokenExpiry
} from '../services/emailService';

const authController = {
  /**
   * Initiate Google OAuth flow
   */
  googleAuth: passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  }),

  /**
   * Handle Google OAuth callback
   */
  googleCallback: [
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
    }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        if (!user || !user.id) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
        }

        // Generate JWT tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Cookie options
        const cookieOptions = process.env.NODE_ENV === 'production'
          ? { httpOnly: true, secure: true, sameSite: 'none' as const, path: '/' }
          : { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/' };

        res.cookie('accessToken', accessToken, {
          ...cookieOptions,
          maxAge: 15 * 60 * 1000
        });

        res.cookie('refreshToken', refreshToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
      } catch (err) {
        console.error('Google OAuth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
      }
    }
  ],

  /**
   * Register new user with email/password
   */
  register: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = generateVerificationToken();
      const verificationTokenExpires = getVerificationTokenExpiry();

      // Create user
      const user = await UserRepository.createUser({
        email,
        display_name: name,
        password_hash: passwordHash,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires: verificationTokenExpires
      });

      // Send verification email
      try {
        await sendVerificationEmail(email, name, verificationToken);
      } catch (emailErr) {
        console.error('Email sending error:', emailErr);
      }

      return res.status(201).json({
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name
        }
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Server error during registration' });
    }
  },

  /**
   * Login with email/password
   */
  login: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if user registered with Google
      if (!user.password_hash) {
        return res.status(400).json({ error: 'This account uses Google login. Please sign in with Google.' });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check email verification
      if (!user.email_verified) {
        return res.status(403).json({ error: 'Please verify your email before logging in.' });
      }

      // Generate JWT tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Cookie options
      const cookieOptions = process.env.NODE_ENV === 'production'
        ? { httpOnly: true, secure: true, sameSite: 'none' as const, path: '/' }
        : { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/' };

      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          profile_picture: user.profile_picture,
          email_verified: user.email_verified
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Server error during login' });
    }
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      // Find user by verification token
      const user = await UserRepository.findByVerificationToken(token);

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      // Mark email as verified
      await UserRepository.markEmailAsVerified(user.id);

      return res.json({
        message: 'Email verified successfully! You can now login.',
        verified: true
      });
    } catch (err) {
      console.error('Verify email error:', err);
      return res.status(500).json({ error: 'Server error during email verification' });
    }
  },

  /**
   * Logout user
   */
  logout: (_req: Request, res: Response) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await UserRepository.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          profile_picture: user.profile_picture,
          email_verified: user.email_verified
        }
      });
    } catch (err) {
      console.error('Get current user error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
};

export default authController;
```

### File: `backend/src/routes/auth.ts`

```typescript
import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation rules
const registerValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
];

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidators, authController.register);
router.post('/login', loginValidators, authController.login);
router.get('/verify-email', authController.verifyEmail);

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', ...authController.googleCallback);

// Protected routes
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

export default router;
```

### File: `backend/src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwtService';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ error: 'Access token required. Please login.' });
    return;
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    res.status(403).json({ error: 'Invalid or expired token. Please login again.' });
    return;
  }

  req.user = decoded;
  next();
};
```

### File: `backend/src/services/jwtService.ts`

```typescript
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  email: string;
}

export const generateAccessToken = (user: { id: number; email: string }): string => {
  const payload: JwtPayload = { id: user.id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
};

export const generateRefreshToken = (user: { id: number }): string => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { id: number } | null => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: number };
  } catch (err) {
    return null;
  }
};
```

### File: `backend/src/services/emailService.ts`

```typescript
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getVerificationTokenExpiry = (): Date => {
  const hours = parseInt(process.env.VERIFICATION_TOKEN_EXPIRES_HOURS || '24');
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate;
};

export const sendVerificationEmail = async (
  email: string,
  displayName: string,
  verificationToken: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome!</h1>
          </div>
          <div class="content">
            <h2>Hi ${displayName}!</h2>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Haufe Hack Project</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};
```

### File: `backend/src/repositories/UserRepository.ts`

```typescript
import pool from '../config/database';

export interface User {
  id: number;
  google_id: string | null;
  email: string;
  display_name: string;
  profile_picture: string | null;
  password_hash: string | null;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserParams {
  google_id?: string;
  email: string;
  display_name: string;
  profile_picture?: string;
  password_hash?: string;
  email_verified?: boolean;
  verification_token?: string;
  verification_token_expires?: Date;
}

export const findByGoogleId = async (googleId: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return result.rows.length === 0 ? null : result.rows[0];
};

export const findByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows.length === 0 ? null : result.rows[0];
};

export const findById = async (id: number): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows.length === 0 ? null : result.rows[0];
};

export const findByVerificationToken = async (token: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
    [token]
  );
  return result.rows.length === 0 ? null : result.rows[0];
};

export const createUser = async (params: CreateUserParams): Promise<User> => {
  const result = await pool.query(
    `INSERT INTO users (
      google_id, email, display_name, profile_picture,
      password_hash, email_verified, verification_token, verification_token_expires
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      params.google_id || null,
      params.email,
      params.display_name,
      params.profile_picture || null,
      params.password_hash || null,
      params.email_verified || false,
      params.verification_token || null,
      params.verification_token_expires || null
    ]
  );
  return result.rows[0];
};

export const markEmailAsVerified = async (userId: number): Promise<User> => {
  const result = await pool.query(
    `UPDATE users
     SET email_verified = TRUE,
         verification_token = NULL,
         verification_token_expires = NULL,
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [userId]
  );
  return result.rows[0];
};
```

### File: `backend/src/types/express.d.ts`

```typescript
import { JwtPayload } from '../services/jwtService';

declare global {
  namespace Express {
    interface User extends JwtPayload {}
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
```

---

## 💻 Part 4: Frontend Implementation

### File: `frontend/package.json`

**Replace the Vite-generated package.json with this complete version:**

```json
{
  "name": "frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.4",
    "axios": "^1.12.2",
    "@radix-ui/react-dialog": "^1.1.15",
    "lucide-react": "^0.546.0",
    "framer-motion": "^12.23.24",
    "react-hook-form": "^7.65.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@types/node": "^24.6.0",
    "@vitejs/plugin-react": "^5.0.4",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.45.0",
    "eslint": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.22",
    "globals": "^16.4.0",
    "vite": "^7.1.7",
    "tailwindcss": "^4.1.14",
    "@tailwindcss/postcss": "^4.1.14",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6"
  }
}
```

### File: `frontend/tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### File: `frontend/tsconfig.app.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### File: `frontend/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

### File: `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### File: `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### File: `frontend/postcss.config.js`

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### File: `frontend/.gitignore`

```
node_modules
dist
dist-ssr
*.local
.env
.env.local
.env.production
.DS_Store
```

### File: `frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Authentication App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### File: `frontend/src/index.css`

```css
@import 'tailwindcss';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### File: `frontend/src/main.tsx`

```typescript
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
```

### File: `frontend/src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/success" element={<AuthSuccess />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### File: `frontend/src/types/auth.ts`

```typescript
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
```

### File: `frontend/src/services/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### File: `frontend/src/services/auth.ts`

```typescript
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
    window.location.href = 'http://localhost:3000/api/auth/google';
  }
};
```

### File: `frontend/src/context/AuthContext.tsx`

```typescript
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
```

### File: `frontend/src/hooks/useAuth.ts`

```typescript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### File: `frontend/src/components/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

Due to character limits, I'll create a second file with the remaining frontend pages and UI components. Let me continue with the pages...
