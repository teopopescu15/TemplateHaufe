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
