// Effective-dated rent proration. A tenant can have multiple rent_rates
// rows over time, each with an effective date range. Given a billing
// period, this resolves the rate in force for each day and sums the
// cost — so a mid-period rate change prorates both rates by day,
// cents-exact.
//
// 2026-08-13 (Chris): `rent_rates.amount_cents` is always the tenant's
// WEEKLY rent, regardless of `frequency` — `frequency` is purely the
// billing/reminder cadence the tenant is on, never a second unit the
// stored amount could mean. Every other frequency's amount is derived
// from the weekly figure via a fixed, calendar-agnostic formula, so a
// given rate charges the same daily amount every day it's in force
// (previously monthly rates charged a different daily amount depending
// on which specific calendar month a bill fell in — replaced here).

const DAY_MS = 86400000;
const WEEK_DAYS = 7;
const AVG_MONTH_DAYS = 365 / 12; // ~30.4167 — matches how a weekly-quoted
// rent is conventionally converted to a monthly figure (daily rate times
// the average days in a month across a non-leap year), not a flat "times 4"
// or a specific-month day count.

const dailyRateCents = (rate) => rate.amount_cents / WEEK_DAYS;

// The amount a rate of `weeklyCents`/week works out to for a given billing
// frequency — used anywhere a rate needs to be *displayed* or *charged* at
// its own cadence (rate cards, reminder emails) rather than prorated
// day-by-day. Monthly and fortnightly are always derived, never stored.
export const amountForFrequency = (weeklyCents, frequency) => {
  const daily = weeklyCents / WEEK_DAYS;
  if (frequency === 'fortnightly') return Math.round(daily * 14);
  if (frequency === 'monthly') return Math.round(daily * AVG_MONTH_DAYS);
  return Math.round(weeklyCents); // weekly (or unrecognized — safest fallback)
};

const rateForDay = (rates, date) => {
  const dateStr = date.toISOString().slice(0, 10);
  return rates.find((r) => {
    if (dateStr < r.effective_from) return false;
    if (r.effective_to && dateStr > r.effective_to) return false;
    return true;
  });
};

// Returns { totalCents, segments } where segments groups consecutive days
// under the same rate into one line item, for a transparent breakdown.
export const computeRentForPeriod = (rates, periodStart, periodEnd) => {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const sortedRates = [...rates].sort((a, b) => a.effective_from.localeCompare(b.effective_from));

  const segments = [];
  let totalCents = 0;
  let cursor = new Date(start);

  while (cursor <= end) {
    const rate = rateForDay(sortedRates, cursor);
    if (!rate) {
      cursor = new Date(cursor.getTime() + DAY_MS);
      continue;
    }
    const cents = dailyRateCents(rate);
    const last = segments[segments.length - 1];
    if (last && last.rateId === rate.id) {
      last.days += 1;
      last.cents += cents;
      last.to = cursor.toISOString().slice(0, 10);
    } else {
      segments.push({
        rateId: rate.id,
        amountCents: rate.amount_cents,
        frequency: rate.frequency,
        from: cursor.toISOString().slice(0, 10),
        to: cursor.toISOString().slice(0, 10),
        days: 1,
        cents,
      });
    }
    totalCents += cents;
    cursor = new Date(cursor.getTime() + DAY_MS);
  }

  const roundedTotal = Math.round(totalCents);
  return {
    totalCents: roundedTotal,
    segments: segments.map((s) => ({ ...s, cents: Math.round(s.cents) })),
  };
};

// Whether a proposed new rate [effectiveFrom, ) would overlap any existing
// rate for the same tenant. Mirrors the DB exclusion constraint so the UI
// can give an immediate error instead of waiting on a 23P01 from Postgres.
export const ratesOverlap = (existingRates, effectiveFrom, effectiveTo) => {
  return existingRates.some((r) => {
    const aStart = effectiveFrom;
    const aEnd = effectiveTo || '9999-12-31';
    const bStart = r.effective_from;
    const bEnd = r.effective_to || '9999-12-31';
    return aStart <= bEnd && bStart <= aEnd;
  });
};

// Same overlap predicate as ratesOverlap, but returns the conflicting rate
// itself so the caller can tell the user exactly what they collided with
// (rather than a bare "it overlaps" with no way to act on it).
export const findOverlappingRate = (existingRates, effectiveFrom, effectiveTo) => {
  const aStart = effectiveFrom;
  const aEnd = effectiveTo || '9999-12-31';
  return existingRates.find((r) => {
    const bStart = r.effective_from;
    const bEnd = r.effective_to || '9999-12-31';
    return aStart <= bEnd && bStart <= aEnd;
  });
};
