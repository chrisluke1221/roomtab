# 2026-07-29 — Fixes to CHR-29's Phase B operator-plane migration

Linear showed CHR-29 (Phase B: operator plane) as "Done" and Manus opened PR #35, but neither was true — verified by reading the actual migration and diffing against the real schema, not trusting the PR description or the Linear status. The frontend half of PR #35 (`bill_events` writes wired into `PropertyContext.js`, the `RequireOperator` route guard, the `isOperator` claim in `AuthContext.js`, the Header nav injection) was solid and needed no changes. All the bugs were confined to `supabase/migrations/20260728200000_phase_b_operator_plane.sql`, plus one missing prerequisite from the original Phase B plan.

## Confirmed bugs, fixed

1. **Missing `private` schema.** `assert_operator()` was defined as `private.assert_operator()`, but no migration in this repo's history ever creates a `private` schema — the very first `CREATE FUNCTION` statement would have failed with "schema does not exist." Fixed by adding `create schema if not exists private;`.
2. **Wrong column names in `operator_get_metrics()`'s split-violation check and `operator_get_bill_audit_trail()`.** Both referenced `bills.total_cents` / `bill_splits.amount_cents` — the real columns (confirmed via `20260714090000_initial_schema.sql`) are `total_amount` / `owed_amount`, both already `numeric` dollars, not integer cents. Fixed by renaming the references (no unit conversion needed).
3. **The split-sum invariant would have false-positived on every carried-forward bill.** Round 2's carry-forward feature deliberately makes a split's `owed_amount` exceed the bill's `total_amount` by the carried-over remainder (`owed_amount = this bill's own portion + carried_over_amount`) — the "hard alert, must be zero" check needed to subtract `carried_over_amount` back out before comparing, or it would have permanently alerted on any bill that ever absorbed a carry-forward.
4. **`operator_regenerate_tenant_token()` referenced `bill_splits.token`**, which doesn't exist (the real column is `access_token`, a `uuid`) — and generated the wrong *type* of value for it (`encode(gen_random_bytes(24), 'base64url')`, a text string). Fixed by mirroring the existing, already-correct `revoke_bill_split_token` RPC exactly: `gen_random_uuid()` into `access_token`.
5. **Missing privacy-policy disclosure.** The original Phase B plan required disclosing read-only operator impersonation in `src/pages/Privacy.js` before O3 ships. Added a new "Support access to your account" section stating the access is read-only and every instance is permanently logged.

## Verified correct, no fix needed
`mrr_cents`'s computation (`plans.price_cents_monthly` / `price_cents_yearly` are real integer-cents columns, and the frontend's `cents / 100` rendering in `OperatorDashboard.js` matches) — checked while hunting for the same class of bug, found nothing wrong.

## Explicitly not in scope for this fix
Impersonation (O3) stays exactly as built — a client-side banner/flag, not an actual read-only fetch of the target landlord's real properties/tenants/bills. That's a known limitation for a later pass, not something expanded here.

## Where this leaves CHR-29
The migration is now correct and has been applied to production (verified via a live query against each new function/table). PR #35 still needs Chris's review and merge before the Linear status genuinely reflects "Done."
