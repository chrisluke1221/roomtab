# Handoff: Settleroo build-out — Phase C just shipped, live test-mode checkout in progress

**From:** Claude Code (long session, 2026-07-27 → 2026-07-30)  **To:** next Claude Code session  **Date:** 2026-07-30
**Assumptions:** None — this is a direct handoff, not a reconstruction.

## Goal & done-state

Settleroo is a React + Supabase app for landlords splitting shared bills by occupancy across tenants (live at settleroo.netlify.app). There's no single "done" — it's an ongoing build against `docs/2026-07-19-settleroo-v2-roadmap.md` (canonical, currently **Rev 3**). The immediate goal right now is narrower: **confirm Phase C's live Stripe test-mode checkout actually works end-to-end**, then move to the next roadmap phase ("Phase Collection").

## Current state

- [x] **Phase A** (monetization spine), **Phase M** (marketing site) — shipped, live.
- [x] **Phase B** (operator plane) — shipped, live. Access model, accounts list, account detail, impersonation banner (client-side only, not a real data fetch — known limitation), business metrics (MRR, split-sum-invariant hard alert), bill audit trail, `npm run seed` (`node scripts/seed.js`), founder notes, activation funnel, churn-risk work-queue. One live bug found and fixed this session: a `jsonb -> boolean` cast error broke `/operator` entirely — see **Landmines** below, this bug class can recur.
- [x] **Phase C** (Stripe self-serve billing, CHR-34) — code shipped and merged (PR #41 + fixes). Migration applied, 4 edge functions deployed, Stripe test-mode product/prices found and wired to the `pro` plan row, Supabase secrets set, **webhook event subscription was wrong and has been corrected** (see below).
- [~] **In progress right now**: Chris was about to run a real test-mode checkout (`/pricing` → "Upgrade to Pro" → Stripe test card `4242 4242 4242 4242`) to confirm the whole loop actually works. **I have not seen the result of that test yet — this is the actual next step, not a completed verification.**
- [ ] **Untouched**: "Phase Collection" (the next roadmap phase per Rev 3 — CHR-21 occupancy exceptions + multi-property "who owes you" scaling design). Phase D (AI ingestion) — deliberately delayed, not started. Phase E — not started, partially re-scoped.

## Next steps (in order)

1. **Ask Chris what happened when he ran the test-mode checkout.** If he already did it before this handoff, get the result. If not, that's the literal first thing to do.
2. **If it worked**: confirm in Supabase that the `subscriptions` row for his account shows `source='stripe'`, `status='active'`, `plan_id='pro'`, and that `/pricing` now shows "Manage billing" instead of "Upgrade to Pro". Then this phase is genuinely done — update `docs/2026-07-19-settleroo-v2-roadmap.md` to mark Phase C ✅ (it currently doesn't reflect the go-live steps being complete) and write a short dated doc closing the loop, per the docs-sync convention.
3. **If it failed**: check the `stripe-webhook` function logs (`supabase functions logs stripe-webhook` or the Supabase dashboard) and the Stripe dashboard's webhook delivery log (Developers → Webhooks → the endpoint → recent deliveries) — the fix is almost certainly there, not in unrelated code. Don't guess; read the actual logs first.
4. **Once Phase C is confirmed working**: move to "Phase Collection" per the roadmap — CHR-21 (occupancy exceptions) is the first item, needs a real migration (no existing column can carry a negotiated absence adjustment — this was already confirmed via a full schema trace in an earlier session, don't re-derive it, just check `docs/2026-07-19-settleroo-v2-roadmap.md`'s "Phase Collection" section for the summary).

**Start here →** Ask Chris directly: "Did the test-mode checkout work? What did you see on `/pricing` after it redirected back?"

## Decisions already made (don't relitigate)

- **Collection-first roadmap pivot (Rev 3, 2026-07-30)**: build order is now B → C → Collection → D (delayed) → E (re-scoped). Full reasoning in `docs/2026-07-30-collection-first-pivot.md`. Phase D (AI ingestion) is deprioritized, not cancelled.
- **Stripe: test mode first, not straight to live.** Chris's explicit call. Do not set `sk_live_...` or register a live webhook until he explicitly says to move to production billing.
- **Chris pastes secret values in chat, I run the commands** (`supabase secrets set`, SQL updates) — his explicit preference over him doing it himself in Supabase Studio.
- **`docs/DEFINITION_OF_DONE.md` and `docs/SCHEMA_REFERENCE.md` are mandatory reading before writing any SQL or calling a ticket done** — this is a standing rule now, not just advice, written after two real incidents (see Landmines).
- **Stop and let Chris check after each phase before starting the next** — his explicit steer, applies to every phase going forward, and to summarize what shipped in "what to test" terms, not just "what was written."
- **Impersonation (Phase B, O3) stays a client-side banner, not a real read-only data fetch** — explicitly deferred, not an oversight.

## Landmines (real bugs hit this session — know these before writing similar code)

- **`jsonb -> 'key'` does not cast to `boolean` in Postgres.** `(raw_app_meta_data -> 'operator')::boolean` fails with "argument of IS NOT TRUE must be type boolean, not type jsonb" — `->` returns jsonb, there's no direct jsonb→boolean cast. Must use `->>` (returns text) then `::boolean`. This broke `/operator` entirely in production once already (fixed in `20260730110000_fix_operator_boolean_cast.sql`) — if you ever write a new Postgres check against `app_metadata`/`user_metadata`, use `->>` from the start.
- **Manus's PRs are only as good as the grounding they're given.** The one Manus PR with a fully-grounded, code-referenced plan (self-QA batch) shipped clean. The one with just a one-paragraph Linear ticket (Phase B's first pass) had 4 real schema bugs from invented column names. Always give Manus (or any agent) a brief citing `docs/SCHEMA_REFERENCE.md` and real file paths — never a bare ticket description for anything schema-touching.
- **A Stripe webhook endpoint existing at the right URL doesn't mean it's subscribed to the right events.** Found one already registered (apparently auto-created by a Stripe MCP "connect" flow) subscribed to a generic bundle that was missing `checkout.session.completed` — the single most important event. Would have silently broken the entire integration with zero errors anywhere. Always check `enabled_events` explicitly, don't assume.
- **CHR-24's migration sat unapplied in production for a week** while its frontend code was already live, silently breaking every "other" utility bill creation — because "PR merged" and "migration applied" are two different things, and nothing forced the second one. This is *why* `docs/DEFINITION_OF_DONE.md` exists.
- **Migration files never carry the actual real column names by default** — always verify against `docs/SCHEMA_REFERENCE.md` or grep `supabase/migrations/*.sql` before writing new SQL against an existing table. Two separate incidents this session were caused by skipping this.

## Open questions / risks

- **Phase C's live test-mode checkout result is genuinely unknown** — don't report Phase C as fully verified until you've actually seen it work (see Next steps #1-3).
- **Impersonation is fake** (client-side banner only) — if Chris ever wants to actually use it for support, that needs real work, not assumed to already exist.
- **Multi-property "who owes you" scaling** has no design yet — Chris flagged he doesn't know the right pattern either. Needs a design pass before building, per the Definition of Done's "design first for open-ended tickets" rule.
- **Stripe going live** (switching `sk_test_` → `sk_live_`, registering a live webhook, real product/prices in live mode) has not happened and needs its own explicit go-ahead from Chris — don't do this as a "natural next step" from test mode working.

## Key locations

- **Repo**: `chrisluke1221/settleroo` on GitHub. Local path: `/Users/chrislu/Documents/Claude cowork CSBA Playground/Product build/roomtab`. Branch: `main`, working tree clean as of this handoff.
- **Read in this order when resuming**: `CLAUDE.md` (repo root, entry point) → `docs/DEFINITION_OF_DONE.md` → `docs/SCHEMA_REFERENCE.md` → `docs/2026-07-19-settleroo-v2-roadmap.md` (canonical roadmap, Rev 3) → `docs/2026-07-30-collection-first-pivot.md` → this file.
- **Live app**: settleroo.netlify.app. **Supabase project**: `trfaqjkkozusxdvqnkgo` (linked via `supabase` CLI in this repo). **Stripe**: test-mode sandbox account "The Productive Path sandbox" (`acct_1TylLyPDU8affAAT`), connected via a Stripe MCP tool this session.
- **Most recent PRs (all merged today, 2026-07-30)**: #37 (roadmap pivot), #38 (Phase B CRM extras), #39 (operator boolean-cast hotfix), #40 (Phase C brief), #41 (Phase C implementation), #42 (migration rename).
- **Manus.ai**: second AI agent working this repo sequentially (not concurrently) with Claude Code — see `docs/2026-07-23-manus-handoff.md` for its full instructions/autonomy boundaries. It just shipped CHR-34 (Phase C) well, following a properly-grounded brief.
- **People**: Chris (founder/operator, chrisluke1221@gmail.com) is the only human in this loop.
