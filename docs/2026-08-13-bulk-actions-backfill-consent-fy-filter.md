# 2026-08-13 — Item 1: bulk mark-paid, backfill consent, financial-year filter

The last of four items from Chris's live-usage feedback pass. Three
sub-parts, each confirmed with Chris before building (via
[AskUserQuestion] for the two genuinely open decisions):

## Bulk mark-as-paid

Chris: clearing a batch of overdue bills on the Dashboard's work queue
meant clicking Mark Paid once per row. `Dashboard.js`'s "Needs attention"
list now has a checkbox per row, a "Select all" checkbox, and a "Mark N
as paid" button that appears once at least one row is checked. Reuses
`setBillSplitStatus` sequentially per selected split — same mutation path
as a single manual Mark Paid click (same `paid_at`/`bill_events` write),
just looped, so a partial failure mid-batch can't leave local state and
the DB in different shapes.

Chris's choice from the two other bulk-action options offered (bulk send
reminder, bulk revoke/regenerate links): mark-as-paid only, for now.

## Backfill consent for new tenants

Chris: adding a tenant with a move-in date in the past silently backfills
rent bills for every month since then (the existing "silent-history rule"
in `generateDueRentBillsInner` — no auto-email for historical months, but
still generated as `pending`/overdue). If that rent was actually already
settled before the landlord started using Settleroo, this reads as a wall
of misleading overdue bills.

`PropertyDetail.js`'s Add Tenant flow now asks, once, right after creating
a tenant with a past move-in date and a rent amount set: "Has \[name\]'s
rent from \[date\] up to today already been paid?" If confirmed, new
`markPastRentSettled(tenantId)` in `PropertyContext.js` bulk-marks every
backfilled rent split (period already ended, not already paid) as paid,
via the same `setBillSplitStatus` path as any other Mark Paid action — no
new mutation logic, no guessed amounts, just the existing single-row path
looped over the tenant's own historical rows.

Scoped to **new tenants only**, per Chris's explicit choice — existing
properties' already-generated history (Cheltenham) is untouched. Skipping
the prompt (Cancel) leaves bills exactly as today: pending/overdue, needing
manual reconciliation as before.

**Sequencing note**: `generateDueRentBillsInner` runs inside `refresh()`,
but inserts the backfilled bills directly into Supabase without updating
local React state (that state was already set from the pre-generation
fetch earlier in the same `refresh()` call) — so `markPastRentSettled`
queries Supabase directly rather than local `billSplits`, and a second
`refresh()` after marking pulls the now-settled bills into local state for
display.

## Financial-year filter

Chris: "10 rows max" pagination on a tenant's Rent/Utilities lists wasn't
enough once there's more than a year of history — asked for a financial-
year or similar filter. New `financialYearFor(dateStr)` in `src/lib/dates.js`
(AU FY: Jul 1 - Jun 30, tested in `dates.test.js`). `TenantDetail.js`'s Rent
and Utilities sections each get an independent "All years" / "FY 2025-26"
etc. dropdown, built from the financial years actually present in that
tenant's own history (only shown if there's more than one to choose from).
Changing the filter resets pagination to page 1.

## Verification
`CI=true npx react-scripts test` — 54/54 (3 new `dates.test.js` tests).
`CI=true npm run build` — clean. Chris to confirm live: select several
overdue rows on the Dashboard and bulk mark-paid; add a tenant with a
back-dated move-in and confirm the settled-history prompt fires and
correctly marks the backfilled bills; filter a tenant's Rent list by FY.
