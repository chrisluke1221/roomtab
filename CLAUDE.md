# Settleroo — Claude Code Entry Point

Settleroo is a React + Supabase web app for landlords who rent by the room: it splits shared bills (power/water/rent) by the exact days each tenant occupied a property, and chases tenants to settled via no-login links. Live at roomietab.netlify.app.

## ▶ Where to resume (read in this order)

1. **`docs/2026-07-19-settleroo-v2-roadmap.md`** — the CANONICAL roadmap/spec. Read this first. (It supersedes `2026-07-17-roomietab-v2-roadmap.md`, which is kept only as history.)
2. `docs/2026-07-19-roomietab-v2-karpathy-review.md` — the spec-quality review the refined roadmap answers.
3. `docs/2026-07-15-roomietab-v1.5-PRD.md` — prior build order (context).
4. `docs/2026-07-19-roomietab-fable-product-critique.md` — product/pricing/positioning critique (informs the OPEN pricing question).

**Current state:** Phase A ✅ and Phase M ✅ are merged and live. Phase B (operator plane) is ~80% built, sitting in open PR #35 (`chr-29-phase-b-operator-plane`) pending Chris's merge — schema-corrected 2026-07-29, see `docs/2026-07-29-phase-b-migration-fixes.md`; still missing the `npm run seed` script and the CRM extras (activation funnel, feedback inbox, churn-risk queue). **Roadmap sequencing was formally revised 2026-07-30 (Rev 3, see `docs/2026-07-30-collection-first-pivot.md`): build order is now B → C → Collection → D (delayed) → E (re-scoped)** — the 4-agent research's collection-first finding is adopted, not just noted; AI ingestion (Phase D) is deprioritized, not cancelled. See `docs/2026-07-19-settleroo-v2-roadmap.md` (canonical, Rev 3) for the full phase-by-phase detail. **Per `docs/DEFINITION_OF_DONE.md`: check in with Chris after each phase before starting the next.**

**Locked decisions (rev 2, 2026-07-19):** pricing = **per-property (~A$10/door/mo)**, no bills/month cap; ICP = **2–10 property operators**; Phase D ingestion first pass is **human-reviewed only (no auto-send)** — auto-send + trust ladder are Phase E, gated on eval calibration.

**Multi-agent handoff:** development on this repo may be picked up by different AI agents/sessions across time (Claude Code, Manus.ai, or others) — there is no shared memory between them. The Settleroo project in Linear (team "CHRIS LU WORKSHOP") is the source of truth for what's done/in-progress/next; the docs-sync convention below is the durable decision record. That discipline is what keeps handoffs safe, not any individual agent's context. See `docs/2026-07-23-manus-handoff.md` for the full instructions given to Manus.ai, including its specific autonomy boundaries (propose-only migrations, PRs opened but not merged, strict ticket order).

## Hard guardrails — Always / Ask first / Never

The product's trust story is **"AI at the edges, deterministic math in the middle."** These are enforced boundaries, not suggestions:

**NEVER**
- Let any AI / LLM / edge-function path **compute or write a bill split**, or mutate money state (amounts, splits, balances). The deterministic engine is the sole splitter.
- Ship MCP **write** tools (read-only only, until usage justifies otherwise).
- Write a **guessed** number into a money field. Low-confidence extraction → leave the field blank and flag it.
- Hand-roll billing — Stripe only.
- Modify a bill's split after it's been sent to a tenant (reissue explicitly instead).

**ASK FIRST**
- Any bill status transition to `sent` / `confirmed` (needs explicit human confirm).
- Schema/migration changes to `plans`, `subscriptions`, `bill_splits`, or money tables.
- Anything that emails a real tenant.

**ALWAYS**
- Route entitlement checks through the single `check_entitlement(key)` RPC.
- Write to `bill_events` on issue/send/view/claim/confirm/reissue.
- Show extraction confidence in the UI.
- Keep the `split-sum-invariant` at exactly zero (Phase B surfaces it as a hard alert).
- Enforce account isolation via row-level security; verify with a two-account isolation test.

## Working conventions

- **`docs/DEFINITION_OF_DONE.md` is the actual gate before anything is called done** — applies to every agent on this repo, not just Manus. Read it before marking a ticket/PR complete.
- **`docs/SCHEMA_REFERENCE.md` is the single source of truth for the real, currently-applied schema.** Check it before writing any SQL against an existing table — never assume or pattern-match a column name. Update it in the same PR as any migration that changes a table's shape.
- **Each phase = its own branch/PR off `main`.** Don't bundle phases.
- **Before opening a PR, run that phase's verification block** (in the roadmap) plus the guardrail tests, and:
  - `CI=true npx react-scripts test`
  - `CI=true npm run build`
- Doc naming: `YYYY-MM-DD-descriptive-name.md` in `docs/`.
- **Any new requirement, feature decision, or scope change discussed in a session gets written into a dated `docs/YYYY-MM-DD-*.md` file in the same PR that implements it.** Decisions must not live only in a session's ephemeral local plan file — this repo is the durable, version-controlled record.
- Pricing/limits live in the `plans` table (data, not code) — reprice by editing the row, not by hardcoding. Pricing metric is **per-property**: Stripe quantity = active property count (Phase C).

## Where things live

- `src/pages/` — routes (Home = marketing, Pricing, Dashboard, Properties, PropertyDetail, Login, TenantBillView).
- `src/components/` — Header, Footer, UpgradeModal, etc.
- `src/contexts/` — `AuthContext`, `PropertyContext` (entitlement enforcement wired here).
- `src/lib/` — Supabase client.
- `supabase/migrations/` — SQL migrations. `supabase/functions/` — edge functions.
- `docs/` — all specs, PRDs, reviews, handoffs.
- **`docs/design-system.md`** — colors, typography, spacing, component primitives, and a design review checklist. Check any new UI against this before shipping.
- **`docs/SCHEMA_REFERENCE.md`** — the real, currently-applied database schema. Check before writing SQL against an existing table.
- **`docs/DEFINITION_OF_DONE.md`** — the checklist every agent is held to before calling a ticket/PR done.
