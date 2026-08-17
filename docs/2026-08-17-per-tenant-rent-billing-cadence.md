# 2026-08-17 — Per-tenant rent billing cadence + bulk mark-paid on tenant lists

## Context

Chris changed Shouryan's billing frequency to 'fortnightly' and found the
rent bill table still generated one bill per calendar month, sized using
the fortnightly rate. Confirmed as a real, previously-flagged-but-deferred
gap: `generateDueRentBillsInner` has always generated exactly one shared
bill per property per calendar month, covering every tenant regardless of
their individual `frequency` — `frequency` only ever affected the *amount*
computed for that shared period, never *how often* a bill was created.
This was explicitly deferred as "a real product question, not bundled
into this bug fix" back on 2026-07-27; Chris has now asked for it fixed
for real, confirmed via [AskUserQuestion] as an actual architecture
change (real separate bills on cadence), not just a cosmetic label.

## What changed

**Schema** (`PROPOSED_20260817090000_per_tenant_rent_cadence.sql`, not yet
applied): new nullable `bills.tenant_id`, set only on a per-tenant-cadence
rent bill. The existing `bills_unique_rent_period` index is re-scoped to
`tenant_id is null` (the shared path, unchanged behaviour); a new
`bills_unique_rent_period_per_tenant` index covers `tenant_id is not
null`. Two independent dedupe guards for two independent generation
paths — a shared bill and a per-tenant bill can never collide with each
other even if their period strings happen to match.

**Generation engine** (`generateDueRentBillsInner`,
`src/contexts/PropertyContext.js`): tenants are split per property by
their *current* open rate's `frequency`. `'monthly'` tenants (or tenants
with no open rate) go through the exact same shared-bill path as before —
zero behavioural change there. `'weekly'`/`'fortnightly'` tenants are
excluded from the shared bill entirely and instead get their own bills,
one tenant per bill, on 7-day or 14-day periods (new `buildSteppedPeriods`
in `src/lib/rentGeneration.js`, tested).

**Cutover is purely forward-looking, never retroactive**: new
`nextPerTenantRentStartDate` (also tested) resumes per-tenant generation
from the day *after* the most recent bill that already covers that
tenant — shared or per-tenant. Nothing already generated is ever touched,
recomputed, or split. Shouryan's existing August bill (generated before
his frequency change, already covering the whole month) stays exactly as
it is; his first real fortnightly bill starts the day after it.

## Bulk mark-paid on the tenant Rent/Utilities lists

Separate ask, same session: the bulk-select-and-mark-paid action built
earlier today for the Dashboard's work queue didn't exist on a tenant's
own Rent/Utilities lists (`TenantDetail.js`) — the exact page Chris was
using in his screenshots. Same pattern, same `setBillSplitStatus` loop,
added per-section (Rent and Utilities independently) with select-all
scoped to the currently visible (paginated/filtered) rows.

## Verification

`CI=true npx react-scripts test` — 62/62 (8 new: 4 `buildSteppedPeriods` +
4 `nextPerTenantRentStartDate`, in `rentGeneration.test.js`).
`CI=true npm run build` — clean. Migration still `PROPOSED_` — needs to be
applied to production and the file renamed before this is live, per the
standing migration convention. After applying: flip a test tenant to
fortnightly, confirm the next generated bill covers exactly 14 days
starting the day after their last existing bill, and confirm a monthly
tenant on the same property is completely unaffected.
