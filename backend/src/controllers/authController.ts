import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import * as UserRepository from '../repositories/UserRepository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwtService';
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
        // Using sameSite: 'lax' for production because frontend and backend share the same domain via Caddy
        const cookieOptions = process.env.NODE_ENV === 'production'
          ? { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' }
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
      // Using sameSite: 'lax' for production because frontend and backend share the same domain via Caddy
      const cookieOptions = process.env.NODE_ENV === 'production'
        ? { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' }
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
   * Refresh access token using refresh token
   */
  refreshToken: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired refresh token' });
      }

      // Generate new access token with same claims
      const tokenPayload = {
        id: decoded.id,
        email: decoded.email
      };
      const newAccessToken = generateAccessToken(tokenPayload);

      // Cookie options (same as login)
      const cookieOptions = process.env.NODE_ENV === 'production'
        ? { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/' }
        : { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/' };

      // Set new access token cookie
      res.cookie('accessToken', newAccessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000
      });

      return res.json({ message: 'Token refreshed successfully' });
    } catch (err) {
      console.error('Refresh token error:', err);
      return res.status(500).json({ error: 'Server error during token refresh' });
    }
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
