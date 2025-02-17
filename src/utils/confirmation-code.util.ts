import { AppError } from './error.util';

interface ConfirmationCodeData {
  code: string;
  expiresAt: Date;
}

// Store for confirmation codes
const confirmationCodes = new Map<string, ConfirmationCodeData>();

// Generate random alphanumeric code
const generateCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const createConfirmationCode = (gadgetId: string): string => {
  // Generate new code
  const code = generateCode();
  
  // Set expiry to 5 minutes from now
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  
  // Store the code
  confirmationCodes.set(gadgetId, { code, expiresAt });
  
  return code;
};

export const verifyConfirmationCode = (gadgetId: string, code: string): boolean => {

    // Add check for missing code in request
    if (!code) {
        throw new AppError(400, 'Confirmation code is required');
    }

    const codeData = confirmationCodes.get(gadgetId);
  
    if (!codeData) {
        throw new AppError(400, 'No confirmation code found. Request a new one.');
    }

    if (Date.now() > codeData.expiresAt.getTime()) {
        // Clean up expired code
        confirmationCodes.delete(gadgetId);
        throw new AppError(400, 'Confirmation code has expired. Request a new one.');
    }

    if (codeData.code !== code) {
        throw new AppError(400, 'Invalid confirmation code.');
    }

  // Clean up used code
  confirmationCodes.delete(gadgetId);
  return true;
};

// Cleanup function for expired codes (can be run periodically)
export const cleanupExpiredCodes = (): void => {
  const now = Date.now();
  for (const [gadgetId, codeData] of confirmationCodes.entries()) {
    if (now > codeData.expiresAt.getTime()) {
      confirmationCodes.delete(gadgetId);
    }
  }
};