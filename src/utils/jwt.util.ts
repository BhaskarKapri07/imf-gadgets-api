import jwt from 'jsonwebtoken';
import { AppError } from './error.util';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

export const generateToken = (): string => {
  return jwt.sign({}, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AppError(401, 'Invalid or expired token');
  }
};