import { generateCodename } from '../../../src/utils/codename.util';

describe('Codename Generator', () => {
  it('should generate a codename with correct format', () => {
    const codename = generateCodename();
    
    // Check if starts with "The"
    expect(codename).toMatch(/^The /);
    
    // Check format: "The Adjective Noun"
    expect(codename.split(' ')).toHaveLength(3);
  });

  it('should be able to generate all possible combinations with enough attempts', () => {
    const codenames = new Set();
    const maxAttempts = 10000;  
    const totalPossibleCombinations = 900;  

    for (let i = 0; i < maxAttempts && codenames.size < totalPossibleCombinations; i++) {
        codenames.add(generateCodename());
    }

    expect(codenames.size).toBe(totalPossibleCombinations);
});

  it('should not contain invalid characters', () => {
    const codename = generateCodename();
    
    // Should only contain letters and spaces
    expect(codename).toMatch(/^[A-Za-z ]+$/);
  });

  it('should never return empty string', () => {
    const codename = generateCodename();
    
    expect(codename).not.toBe('');
    expect(codename.trim()).not.toBe('');
  });
});