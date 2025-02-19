import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../../src/utils/jwt.util';
import { AppError } from '../../../src/utils/error.util';

describe('JWT Utilities', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken();
      
      // Check if token is a string
      expect(typeof token).toBe('string');
      
      // Check if token has correct JWT structure (three parts separated by dots)
      expect(token.split('.')).toHaveLength(3);
    });
});

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken();
      
      // Should not throw an error
      expect(() => verifyToken(token)).not.toThrow();
    });

    it('should throw an error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      // Should throw AppError
      expect(() => verifyToken(invalidToken)).toThrow(AppError);
    });

    it('should throw an error for expired token', async () => {
      // Create a token that expires in 1 second
      const token = jwt.sign({}, process.env.JWT_SECRET!, { expiresIn: '1s' });
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should throw AppError
      expect(() => verifyToken(token)).toThrow(AppError);
    });
  });
});