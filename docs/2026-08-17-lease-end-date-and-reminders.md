# 2026-08-17 — Lease end date, distinct from move-out, with a 4-week landlord reminder

## Context
Chris: for a fixed-term lease (e.g. 6 months), he needs a reminder 4 weeks
before the term ends to ask the tenant whether they're extending. If not,
`move_out_date` becomes the lease end date; if they extend, `fixed_term_end`
moves forward and `move_out_date` stays clear. This is genuinely different
from `move_out_date` — that column means "the tenant has actually given
notice / is confirmed leaving," which isn't true yet at the 4-week mark of
an undecided lease.

Confirmed before building: `tenants.fixed_term_end` already existed
(migration `20260716090000_rent_rates.sql`) but was never surfaced in any
form, never displayed, never read by any code path — a dormant column from
an earlier phase. No new date column was needed, only the reminder-tracking
state and the UI to actually use it.

## What was built

- **New `tenants.lease_reminder_sent_at`** (migration, `PROPOSED_`):
  gates the reminder to once per lease end date. `updateTenant`
  (`PropertyContext.js`) clears it automatically whenever `fixed_term_end`
  changes, so an extension gets its own fresh reminder rather than
  inheriting "already reminded" from the old date.
- **UI**: "Lease end date (optional)" field added to both tenant forms
  (`PropertyDetail.js`'s add/edit form, `TenantDetail.js`'s inline editor),
  and displayed on the tenant card/header alongside move-in/move-out.
- **Dashboard "Leases ending soon"** card: any active tenant whose
  `fixed_term_end` falls within the next 4 weeks, soonest first, with two
  actions — **"Confirm move-out"** (sets `move_out_date` = the lease end
  date, one click) and **"Extend"** (links to the tenant page to edit
  `fixed_term_end` normally — no new mechanism, it's just the existing
  tenant-edit flow).
- **New edge function `send-lease-reminders`**: same cron-secret-gated
  pattern as `send-overdue-reminders`, but emails the **landlord**, never
  the tenant — this is explicitly a decision only the landlord makes.
  Scheduled via `cron.schedule` directly in the migration (09:30 UTC daily,
  offset from the existing overdue-reminders job) — the first time this
  project's cron setup has actually been migration-tracked rather than
  run ad hoc.

## What deliberately doesn't happen automatically
No rate change, no bill regeneration, no `move_out_date`/`fixed_term_end`
mutation happens on its own. The reminder only ever *asks*; every outcome
is a landlord action through the existing, already-audited paths (tenant
edit form, rate change).

## Verification
`CI=true npx react-scripts test` — 62/62, no test changes needed (no new
pure calculation logic — date-window filtering only). `CI=true npm run
build` — clean. Still needed: apply the `PROPOSED_` migration, deploy
`send-lease-reminders`, and Chris to confirm live — set a tenant's lease
end date within 4 weeks, confirm it shows on the Dashboard card, confirm
"Confirm move-out" sets `move_out_date` correctly.
