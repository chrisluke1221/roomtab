# 2026-08-13 — Rent is now always entered/stored as a weekly figure; other frequencies are derived

## Context
Chris flagged (via UI screenshots) that the rent calculation was confusing:
a tenant's "Rent" field showed a raw number next to a Frequency dropdown
with no explicit unit, and the previous formula computed a monthly rate's
daily charge by dividing the stored amount by the *actual* number of days
in that specific calendar month (`amount_cents / daysInMonth(...)`) — so
the same monthly rate charged a different daily amount in a 28-day vs.
31-day month.

Confirmed against real data before changing anything: Jessica's rate was
$953.33/month, computed by an earlier (incorrect) weekly→monthly
conversion of `weekly × 52 ÷ 12`. Chris corrected it live to the real
weekly figure ($220/week) through the UI. This confirmed the direction —
weekly is the one true unit — but also confirmed that **existing stored
amounts must not be reinterpreted automatically**: whether a given
tenant's current monthly/fortnightly number is already correct (like
Jessica's was, before her manual fix) or wrong (like Adriano's, per
Chris's own example) can't be known from the data alone. Only Chris knows
each tenant's real agreed rent.

## What changed
- **`rent_rates.amount_cents` is now always the tenant's weekly rent**,
  regardless of `frequency`. `frequency` is purely the billing/reminder
  cadence — never a second unit the stored amount could mean.
- **The conversion formula** (`src/lib/rentCalc.js`, new
  `amountForFrequency(weeklyCents, frequency)`):
  - `daily = weekly ÷ 7`
  - `fortnightly = daily × 14` (exactly double the weekly figure)
  - `monthly = daily × (365 ÷ 12)` — a fixed ~30.4167-day average, not a
    specific calendar month's day count, and not `weekly × 4`.
- **Day-by-day proration** (`computeRentForPeriod`, used for every real
  bill's split calculation) now always uses `amount_cents ÷ 7` as the
  daily rate, so a rate charges the same amount per day every day it's in
  force — a monthly-billed tenant's daily rate no longer silently changes
  between a 28-day and 31-day month.
- **UI**: the tenant form's "Rent" field is relabeled "Rent per week", the
  frequency dropdown is relabeled "Billed" with a caption explaining the
  amount is derived from it, and every place a rate/rate-history/rate-
  breakdown segment is displayed (`PropertyDetail.js`, `TenantDetail.js`)
  now shows the weekly figure plus, for non-weekly cadences, the derived
  billed amount in parentheses — so the number is never ambiguous.
- **Reminder emails**: for rent bills, the email now states the billing
  cadence ("Billed monthly") alongside the amount, derived from the
  bill's own stored `rate_breakdown` (no extra query needed).

## What did NOT change
- **No existing `rent_rates` row was modified.** Every tenant's currently
  stored amount and frequency computes exactly as it did before this fix,
  until the landlord re-saves that tenant's rate through the (now
  correctly labeled) form with a real weekly figure — the same
  new-dated-rate mechanism every other rate change already uses (existing
  bills are never touched).
- Jessica's rate was already corrected live by Chris before this fix
  shipped, using the pre-existing "same-day rate correction" UI flow — no
  data migration was needed or performed for her.

## Still to do (Chris's own review, not automatable)
Every other real tenant currently on a monthly or fortnightly rate
(Adriano, Karthick, plus the two sample-property tenants) should be
reviewed and, if the current figure isn't already a correct weekly-derived
amount, re-saved with the tenant's real weekly rent — the same way Jessica
was just corrected.

## Verification
`src/lib/rentCalc.test.js` — 4 new/updated tests: the mid-period rate
change test was rewritten to assert the constant weekly-derived daily
rate (previously asserted the old variable-days-in-month formula); a new
test confirms a monthly-frequency rate charges identically in a 28-day
and 31-day month; three new `amountForFrequency` tests cover weekly,
fortnightly (exactly 2×), and monthly (365÷12-based, explicitly asserted
*not* equal to a naive ×4). `CI=true npx react-scripts test` — 51/51
passing. `CI=true npm run build` — clean.
