import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: number;
  email: string;
}

export const generateAccessToken = (user: { id: number; email: string }): string => {
  const payload: JwtPayload = { id: user.id, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
};

export const generateRefreshToken = (user: { id: number; email: string }): string => {
  const payload: JwtPayload = { id: user.id, email: user.email };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch (err) {
    return null;
  }
};
