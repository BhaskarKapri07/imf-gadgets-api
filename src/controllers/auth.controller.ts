import { Request, Response } from 'express';
import { generateToken } from '../utils/jwt.util';

export const getToken = (req: Request, res: Response) => {
  const token = generateToken();
  res.json({
    status: 'success',
    token,
    expiresIn: '24h'
  });
};