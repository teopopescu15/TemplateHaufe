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
