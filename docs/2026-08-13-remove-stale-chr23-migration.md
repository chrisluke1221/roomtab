# 2026-08-13 — Removed stale CHR-23 PROPOSED migration

While auditing production migration state after discovering `landlord_settings`
had silently never been applied (see the arrears-autopilot go-live work this
session), found a second, more dangerous landmine:
`supabase/migrations/PROPOSED_20260723100000_bill_types_multiselect.sql`
(CHR-23, multi-select utility bill types) had sat un-applied since 2026-07-23 —
confirmed via a live schema check that `bills.bill_types` does not exist in
production.

This wasn't just stale, it was actively dangerous to leave in the repo: its
`get_bill_split_by_token` rewrite targeted an old, pre-Phase-B function
signature — no `amount_paid`, `carried_over_amount`, `carry_forward_sources`,
or `bill_split_exceptions` data. Every subsequent migration that extended this
RPC (partial payment/carry-forward, CHR-21 occupancy exceptions) did so via
`drop function` + `create function`, so applying this file today would have
silently reverted the live function to the July 23rd version — regressing
partial-payment display, carry-forward display, and occupancy-exception
display on every tenant bill page, with no error to surface it. Since the
standing convention across this project is "check for pending `PROPOSED_`
files and apply them," this was a live risk for any future session (human or
agent), not a hypothetical one.

CHR-23 (multi-select bill types) hasn't appeared in any roadmap doc, handoff,
or Linear discussion since the file was written — it predates the Rev 3
collection-first pivot entirely. Deleted rather than fixed: there's nothing in
the file worth preserving, since a correct version would need to be written
fresh against the current schema and RPC signature anyway. If multi-select
bill types becomes a real priority again, it should be re-scoped from scratch
against `docs/SCHEMA_REFERENCE.md`'s current state.

## Verification
`git rm` only, no schema/app-code change — `CI=true npx react-scripts test` +
`CI=true npm run build` still pass. No production impact (the file was never
applied).
