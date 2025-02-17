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


export const validateUpdateGadget = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { description, status } = req.body;
    const { id } = req.params;
  
    // Validate id
    if (!id) {
      throw new AppError(400, 'Gadget ID is required');
    }
  
    // If description is provided, validate it
    if (description !== undefined) {
      if (typeof description !== 'string') {
        throw new AppError(400, 'Description must be a string');
      }
      if (description.length < 10 || description.length > 500) {
        throw new AppError(400, 'Description must be between 10 and 500 characters');
      }
    }
  
    // If status is provided, validate it's a valid status
    if (status !== undefined) {
      const validStatuses = ['AVAILABLE', 'DEPLOYED', 'DESTROYED', 'DECOMMISSIONED'];
      if (!validStatuses.includes(status)) {
        throw new AppError(400, 'Invalid status value');
      }
    }
  
    next();
  };

export const validateDecommission = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
  
    if (!id) {
      throw new AppError(400, 'Gadget ID is required');
    }
  
    next();
  };