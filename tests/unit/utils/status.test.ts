import { validateStatusTransition, validateAndProcessStatusChange } from '../../../src/utils/status.util';
import { AppError } from '../../../src/utils/error.util';

describe('Status Transition Validation', () => {
  describe('validateStatusTransition', () => {
    it('should allow AVAILABLE -> DEPLOYED transition', () => {
      expect(validateStatusTransition('AVAILABLE', 'DEPLOYED')).toBe(true);
    });

    it('should allow AVAILABLE -> DECOMMISSIONED transition', () => {
      expect(validateStatusTransition('AVAILABLE', 'DECOMMISSIONED')).toBe(true);
    });

    it('should allow DEPLOYED -> AVAILABLE transition', () => {
      expect(validateStatusTransition('DEPLOYED', 'AVAILABLE')).toBe(true);
    });

    it('should allow DEPLOYED -> DESTROYED transition', () => {
      expect(validateStatusTransition('DEPLOYED', 'DESTROYED')).toBe(true);
    });

    it('should not allow AVAILABLE -> DESTROYED transition', () => {
      expect(validateStatusTransition('AVAILABLE', 'DESTROYED')).toBe(false);
    });

    it('should not allow DESTROYED -> any status transition', () => {
      expect(validateStatusTransition('DESTROYED', 'AVAILABLE')).toBe(false);
      expect(validateStatusTransition('DESTROYED', 'DEPLOYED')).toBe(false);
      expect(validateStatusTransition('DESTROYED', 'DECOMMISSIONED')).toBe(false);
    });

    it('should not allow DECOMMISSIONED -> any status transition', () => {
      expect(validateStatusTransition('DECOMMISSIONED', 'AVAILABLE')).toBe(false);
      expect(validateStatusTransition('DECOMMISSIONED', 'DEPLOYED')).toBe(false);
      expect(validateStatusTransition('DECOMMISSIONED', 'DESTROYED')).toBe(false);
    });
  });

  describe('validateAndProcessStatusChange', () => {
    it('should not throw error for valid transitions', async () => {
      await expect(validateAndProcessStatusChange('AVAILABLE', 'DEPLOYED')).resolves.not.toThrow();
    });

    it('should throw error for invalid transitions', async () => {
      await expect(validateAndProcessStatusChange('AVAILABLE', 'DESTROYED')).rejects.toThrow(AppError);
    });

    it('should not throw error when status is not changing', async () => {
      await expect(validateAndProcessStatusChange('AVAILABLE', 'AVAILABLE')).resolves.not.toThrow();
    });

    it('should throw error when gadget is in final state (DESTROYED)', async () => {
      await expect(validateAndProcessStatusChange('DESTROYED', 'AVAILABLE')).rejects.toThrow(AppError);
    });

    it('should throw error when gadget is in final state (DECOMMISSIONED)', async () => {
      await expect(validateAndProcessStatusChange('DECOMMISSIONED', 'AVAILABLE')).rejects.toThrow(AppError);
    });
  });
});