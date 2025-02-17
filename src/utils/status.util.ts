import { GadgetStatus } from '@prisma/client';
import { AppError } from './error.util';

// Define allowed transitions for each status
const allowedTransitions: Record<GadgetStatus, GadgetStatus[]> = {
  AVAILABLE: ['DEPLOYED', 'DECOMMISSIONED'],
  DEPLOYED: ['AVAILABLE', 'DESTROYED'],
  DESTROYED: [], 
  DECOMMISSIONED: [], 
};

export const validateStatusTransition = (
  currentStatus: GadgetStatus,
  newStatus: GadgetStatus
): boolean => {
  // Get allowed transitions for current status
  const allowed = allowedTransitions[currentStatus];
  
  // Check if new status is in allowed transitions
  return allowed.includes(newStatus);
};

export const validateAndProcessStatusChange = async (
  currentStatus: GadgetStatus,
  newStatus: GadgetStatus
): Promise<void> => {
  // Check if status is actually changing
  if (currentStatus === newStatus) {
    return;
  }

  // Check if gadget is in a final state
  if (currentStatus === 'DESTROYED' || currentStatus === 'DECOMMISSIONED') {
    throw new AppError(
      400,
      `Cannot change status: Gadget is ${currentStatus.toLowerCase()}`
    );
  }

  // Validate the transition
  if (!validateStatusTransition(currentStatus, newStatus)) {
    throw new AppError(
      400,
      `Invalid status transition from ${currentStatus} to ${newStatus}`
    );
  }
};