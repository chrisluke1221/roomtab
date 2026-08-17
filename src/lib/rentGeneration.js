// Pure helpers for the rent-bill auto-generation logic.
// Extracted from PropertyContext so they can be unit-tested without React or
// Supabase. The context imports and calls these; nothing else should need to.

import { formatLocalDate } from './dates';

// Returns the calendar-month start Date that should be the earliest period
// generated for a given property. Anchored to the earliest rent_rate
// effective_from among the property's active tenants, capped at 12 months
// ago so we never generate more than one financial year of backfill.
//
// If no rates exist for the property's tenants, the 12-month floor is
// returned — the outer generation loop will find no billable charges and
// skip every period cleanly, which is the correct silent behaviour for a
// property that has tenants but no rates yet.
export const earliestGenerationMonthForProperty = (propertyTenants, ratesList, now = new Date()) => {
  // Hard floor: 12 months ago (aligns with AU financial year cycle).
  const floorMonthStart = new Date(now.getFullYear(), now.getMonth() - 12, 1);

  const tenantIds = new Set(propertyTenants.map((t) => t.id));
  const propertyRates = ratesList.filter((r) => tenantIds.has(r.tenant_id));
  if (propertyRates.length === 0) {
    return floorMonthStart;
  }

  // Earliest effective_from across all rates for this property's tenants.
  const earliestRateDate = propertyRates.reduce((earliest, r) => {
    return r.effective_from < earliest ? r.effective_from : earliest;
  }, propertyRates[0].effective_from);

  // Snap to the first day of that calendar month.
  const [year, month] = earliestRateDate.split('-').map(Number);
  const dataAnchorMonthStart = new Date(year, month - 1, 1);

  // Use whichever is later: the data anchor or the 12-month floor.
  return dataAnchorMonthStart > floorMonthStart ? dataAnchorMonthStart : floorMonthStart;
};

// Builds the ordered list of calendar-month { start, end } period strings
// from the earliest generation month up to and including the current month.
// Both bounds are inclusive. The result is always at least one period
// (the current month).
export const buildGenerationPeriods = (startMonth, currentMonthStart) => {
  const periods = [];
  let cursor = new Date(startMonth);
  while (cursor <= currentMonthStart) {
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    periods.push({ start: formatLocalDate(cursor), end: formatLocalDate(end) });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return periods;
};

// 2026-08-17: per-tenant billing cadence (Chris's call) — a tenant on
// 'weekly' or 'fortnightly' billing gets their own bills on that cadence
// instead of sharing the property-wide monthly bill. Operates on
// 'YYYY-MM-DD' strings throughout, constructing Date objects only via the
// local (y, m, d) constructor — never `new Date('YYYY-MM-DD')`, which
// parses as UTC and can shift a day in any timezone ahead of UTC (the same
// bug class formatLocalDate exists to avoid).
const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
};

// Fixed-length, non-overlapping, gapless periods of `stepDays` days each,
// starting at startDateStr, up to and including whichever period contains
// throughDateStr (so the in-progress current period is always included,
// matching buildGenerationPeriods' "always at least the current period"
// behaviour for the monthly path).
export const buildSteppedPeriods = (startDateStr, throughDateStr, stepDays) => {
  const periods = [];
  let cursor = startDateStr;
  while (cursor <= throughDateStr) {
    const end = addDays(cursor, stepDays - 1);
    periods.push({ start: cursor, end });
    cursor = addDays(cursor, stepDays);
  }
  return periods;
};

// Where per-tenant generation should resume from for a given tenant: the
// day after the most recent rent bill that already covers them (shared or
// per-tenant), or their move-in date if they have no rent bill history at
// all. This is what guarantees no overlap and no gap with bills that were
// already generated before a tenant's cadence became per-tenant (e.g. an
// existing shared monthly bill that already covers days now nominally in
// a "fortnightly" period) — per-tenant generation only ever starts fresh
// after the last thing that already billed them, never retroactively.
export const nextPerTenantRentStartDate = (tenantMoveInDate, existingRentBillingPeriodEnds) => {
  if (existingRentBillingPeriodEnds.length === 0) return tenantMoveInDate;
  const latestEnd = existingRentBillingPeriodEnds.reduce((latest, end) => (end > latest ? end : latest));
  const resumeDate = addDays(latestEnd, 1);
  return resumeDate > tenantMoveInDate ? resumeDate : tenantMoveInDate;
};
