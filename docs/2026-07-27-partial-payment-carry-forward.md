# 2026-07-27 — Partial payment tracking + automatic carry-forward (Round 2)

Chris's second reported gap: no way to record that a tenant paid part of a bill, and no way to roll an unresolved remainder into the next bill with a visible breakdown. His test case: a tenant owes $20 of a $100 electricity/gas bill ($80 already paid), then a new $50/person water bill is created for the same tenant — it should show $70 owed, broken down as "$50 this bill + $20 carried over."

## Schema (`supabase/migrations/20260727120000_partial_payment_carry_forward.sql`)

`bill_splits` gains `amount_paid`, `carried_over_amount`, and a self-referencing `carried_forward_into_split_id`. `status` stays `pending`/`viewed`/`paid` — no constraint change. "Partial" and "Carried forward" are **derived** states computed in `effectiveStatus` (`src/lib/paymentStatus.js`), the same pattern already used for "Overdue":

- `partial`: `amount_paid > 0` and not yet fully paid.
- `carried_forward`: `carried_forward_into_split_id` is set — this split's shortfall has already moved to a newer bill, so it's resolved, not still outstanding.

Tagging a source split with `carried_forward_into_split_id` is metadata only — it never touches that split's own `owed_amount`, so it doesn't violate the "never modify a bill's split after it's been sent" guardrail.

## Scope decision: utility ↔ utility only, not rent

The carry-forward mechanism (`unresolvedRemainderForTenant` in `src/contexts/PropertyContext.js`) only sums and sources remainders from **non-rent** splits, and only utility bills (`createBillWithSplits`) pull a remainder in — `insertRentBillRow`/`createRentBill` never call it in either direction. Chris's stated scenario is specifically utility-to-utility (electricity/gas → water); rolling rent arrears into a utility bill's total (or vice versa) would conflate two different obligations on a tenant-facing page in a way he didn't ask for. If cross-type carry-forward (e.g. unpaid rent showing up on a utility bill) turns out to be wanted later, this is a small, deliberate scope expansion, not a bug fix.

## A real double-counting bug this caught before shipping

Every "how much is outstanding" aggregate (`Dashboard.js`'s total-owed tile and per-tenant balances, `PropertyDetail.js`'s `balanceFor`, the `send-overdue-reminders` cron query) was written as `status !== 'paid'`. Once a split's remainder is carried forward, it's still `status !== 'paid'` in the database (only the new split absorbs the money) — so without a fix, that old remainder would be counted **twice**: once on the original (now-resolved) split, and again inside the new split's larger `owed_amount`. Fixed by adding `isOutstanding()` (`src/lib/paymentStatus.js`) — `status !== 'paid' && !carried_forward_into_split_id` — and routing every aggregate through it instead of the bare status check. The overdue-reminder cron also got `.is('carried_forward_into_split_id', null)` so a tenant doesn't keep getting dunned for a bill that's already been rolled into a newer one.

## UI

- `SplitActions.js`: the old instant "mark as paid" toggle is replaced by an inline amount-entry chip (`recordPartialPayment`) — the landlord enters what was actually paid, full or partial. A carried-forward split's payment control is disabled (greyed check icon) since recording more against it wouldn't be reflected in any outstanding total.
- `OwedBreakdown.js` (new, shared by `PropertyDetail.js` and `Dashboard.js`): shows the "$X this bill + $Y carried over" line and "$Z paid so far" note under a split's owed amount.
- `TenantBillView.js`: headline "You owe" box and the calculation trail both show the carry-forward breakdown and which earlier bill it came from (via the extended `get_bill_split_by_token` RPC's `carry_forward_sources`), plus a "paid so far / still owing" note for a partial payment. `DemoBill.js` wasn't touched — its static demo data has no carry-forward, so the new UI is a no-op there (nothing to mirror).
- The bill email (`send-bill-email` function) adds a one-line carry-forward note (without naming the specific source bill, to avoid an extra query) — full detail is on the linked bill page.

## What Chris should verify live

Mark an electricity/gas split $80-of-$100 paid (partial), then create a new $50/person water bill for the same tenant — the new split should show $70 owed with the $50+$20 breakdown, the old electricity/gas split should show as "Carried forward" (not "Overdue") in the Utilities tab, and the dashboard's total-owed figure should count that $20 exactly once, not twice.
