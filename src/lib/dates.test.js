import { financialYearFor } from './dates';

describe('financialYearFor', () => {
  test('a date on or after July 1 belongs to that calendar year\'s FY', () => {
    expect(financialYearFor('2025-07-01')).toBe('2025-26');
    expect(financialYearFor('2025-12-31')).toBe('2025-26');
  });

  test('a date before July 1 belongs to the prior calendar year\'s FY', () => {
    expect(financialYearFor('2026-01-01')).toBe('2025-26');
    expect(financialYearFor('2026-06-30')).toBe('2025-26');
  });

  test('century rollover formats the end year correctly', () => {
    expect(financialYearFor('2099-08-01')).toBe('2099-00');
  });
});
