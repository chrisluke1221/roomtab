import { computeRentForPeriod, ratesOverlap, amountForFrequency } from './rentCalc';

const rate = (overrides) => ({
  id: Math.random().toString(36).slice(2),
  amount_cents: 80000,
  frequency: 'monthly',
  effective_from: '2026-01-01',
  effective_to: null,
  ...overrides,
});

describe('computeRentForPeriod', () => {
  test('a mid-period rate change prorates both rates by day, cents-exact, using a constant weekly-derived daily rate regardless of calendar month', () => {
    const rates = [
      rate({ id: 'old', amount_cents: 80000, effective_from: '2026-01-01', effective_to: '2026-07-31' }),
      rate({ id: 'new', amount_cents: 88000, effective_from: '2026-08-01', effective_to: null }),
    ];

    const { totalCents, segments } = computeRentForPeriod(rates, '2026-07-15', '2026-08-14');

    expect(segments).toHaveLength(2);
    expect(segments[0].rateId).toBe('old');
    expect(segments[0].days).toBe(17); // Jul 15-31 inclusive
    expect(segments[1].rateId).toBe('new');
    expect(segments[1].days).toBe(14); // Aug 1-14 inclusive

    // amount_cents is always the weekly rent (2026-08-13) — daily rate is a
    // constant amount/7, not divided by the specific calendar month's length.
    const oldDailyCents = 80000 / 7;
    const newDailyCents = 88000 / 7;
    const expectedTotal = Math.round(17 * oldDailyCents + 14 * newDailyCents);

    expect(totalCents).toBe(expectedTotal);
  });

  test('single rate covering the whole period charges exactly the daily rate times days', () => {
    const rates = [rate({ amount_cents: 70000, frequency: 'weekly', effective_from: '2026-01-01' })];
    const { totalCents, segments } = computeRentForPeriod(rates, '2026-02-01', '2026-02-07');
    expect(segments).toHaveLength(1);
    expect(segments[0].days).toBe(7);
    expect(totalCents).toBe(70000); // exactly one week at $700/week
  });

  test('a monthly-frequency rate charges the same daily amount regardless of which specific month it falls in', () => {
    const rates = [rate({ amount_cents: 22000, frequency: 'monthly', effective_from: '2026-01-01' })];
    const { totalCents: febTotal } = computeRentForPeriod(rates, '2026-02-01', '2026-02-07'); // 28-day Feb
    const { totalCents: julTotal } = computeRentForPeriod(rates, '2026-07-01', '2026-07-07'); // 31-day Jul
    expect(febTotal).toBe(julTotal); // same 7 days, same $220/week rate -> identical charge
  });

  test('days with no rate in force are skipped, not charged', () => {
    const rates = [rate({ effective_from: '2026-03-10', effective_to: null })];
    const { totalCents, segments } = computeRentForPeriod(rates, '2026-03-01', '2026-03-10');
    expect(segments).toHaveLength(1);
    expect(segments[0].days).toBe(1); // only Mar 10 is covered
    expect(totalCents).toBeGreaterThan(0);
  });

  test('no applicable rate at all returns zero with no segments', () => {
    const { totalCents, segments } = computeRentForPeriod([], '2026-01-01', '2026-01-31');
    expect(totalCents).toBe(0);
    expect(segments).toEqual([]);
  });
});

describe('amountForFrequency', () => {
  test('weekly returns the weekly amount unchanged', () => {
    expect(amountForFrequency(22000, 'weekly')).toBe(22000);
  });

  test('fortnightly is exactly double the weekly amount', () => {
    expect(amountForFrequency(22000, 'fortnightly')).toBe(44000);
  });

  test('monthly uses the daily rate times 365/12, not the weekly amount times 4', () => {
    // $220/week -> daily = 220/7 -> monthly = daily * (365/12) ~= $955.95, not $880 (4x).
    expect(amountForFrequency(22000, 'monthly')).toBe(Math.round((22000 / 7) * (365 / 12)));
    expect(amountForFrequency(22000, 'monthly')).not.toBe(22000 * 4);
  });
});

describe('ratesOverlap', () => {
  test('detects overlap with an open-ended existing rate', () => {
    const existing = [rate({ effective_from: '2026-01-01', effective_to: null })];
    expect(ratesOverlap(existing, '2026-06-01', null)).toBe(true);
  });

  test('no overlap when new rate starts the day after existing rate ends', () => {
    const existing = [rate({ effective_from: '2026-01-01', effective_to: '2026-05-31' })];
    expect(ratesOverlap(existing, '2026-06-01', null)).toBe(false);
  });

  test('detects overlap when new rate starts before existing rate ends', () => {
    const existing = [rate({ effective_from: '2026-01-01', effective_to: '2026-06-30' })];
    expect(ratesOverlap(existing, '2026-06-01', null)).toBe(true);
  });
});
