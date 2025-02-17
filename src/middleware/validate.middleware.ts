import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';

export const validateCreateGadget = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { description } = req.body;

  if (!description) {
    throw new AppError(400, 'Description is required');
  }

  if (typeof description !== 'string') {
    throw new AppError(400, 'Description must be a string');
  }

  if (description.length < 10 || description.length > 500) {
    throw new AppError(400, 'Description must be between 10 and 500 characters');
  }

  next();
};