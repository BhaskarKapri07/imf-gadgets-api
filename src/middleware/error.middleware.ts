import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/error.util';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // If it's custom error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
    return;
  }

  // If it's a Prisma error
  if (err.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      status: 'error',
      message: 'Database operation failed'
    });
    return;
  }

  // For unknown errors (500)
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
  return;
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const err = new AppError(404, `Route ${req.originalUrl} not found`);
  next(err);
};