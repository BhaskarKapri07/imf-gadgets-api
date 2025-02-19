import { createConfirmationCode, verifyConfirmationCode } from '../../../src/utils/confirmation-code.util';
import { AppError } from '../../../src/utils/error.util';

describe('Confirmation Code System', () => {
  const testGadgetId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    // Clear any existing codes before each test
    jest.clearAllMocks();
  });

  describe('createConfirmationCode', () => {
    it('should generate a 6-character alphanumeric code', () => {
      const code = createConfirmationCode(testGadgetId);
      
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate different codes for same gadget', () => {
      const code1 = createConfirmationCode(testGadgetId);
      const code2 = createConfirmationCode(testGadgetId);
      
      expect(code1).not.toBe(code2);
    });

    it('should generate different codes for different gadgets', () => {
      const code1 = createConfirmationCode(testGadgetId);
      const code2 = createConfirmationCode('different-id');
      
      expect(code1).not.toBe(code2);
    });
  });

  describe('verifyConfirmationCode', () => {
    it('should verify a valid code', () => {
      const code = createConfirmationCode(testGadgetId);
      
      expect(() => 
        verifyConfirmationCode(testGadgetId, code)
      ).not.toThrow();
    });

    it('should throw error for invalid code', () => {
      const code = createConfirmationCode(testGadgetId);
      
      expect(() => 
        verifyConfirmationCode(testGadgetId, 'WRONG1')
      ).toThrow(AppError);
    });

    it('should throw error for non-existent confirmation code', () => {
      expect(() => 
        verifyConfirmationCode('nonexistent-id', 'ABC123')
      ).toThrow(AppError);
    });

    it('should throw error for expired code', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      const code = createConfirmationCode(testGadgetId);
      
      // Advance time by 5 minutes and 100ms
      jest.spyOn(Date, 'now').mockImplementation(() => now + 5 * 60 * 1000 + 100);
      
      expect(() => 
        verifyConfirmationCode(testGadgetId, code)
      ).toThrow(AppError);
    });
  });
});