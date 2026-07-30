# Settleroo v2 Roadmap (Refined) — Monetization, Operator CRM, and Collection-First

**Status:** Phase A ✅ · Phase M ✅ · Phase B ✅ · Phase C next · **Phase D delayed, collection-first per Rev 3**
**Owner:** Chris (founder/operator) · **Written:** 2026-07-17 · **Refined:** 2026-07-19 (rev 2) · **Re-sequenced:** 2026-07-30 (rev 3)
**This file is CANONICAL and supersedes `2026-07-17-roomietab-v2-roadmap.md`** (kept as history). It folds in `2026-07-19-roomietab-v2-karpathy-review.md` and `2026-07-19-roomietab-fable-product-critique.md`. Rev 3's reasoning lives in `docs/2026-07-30-collection-first-pivot.md`.

> **▶ RESUME HERE (Claude Code):** Phase A, Phase M, and Phase B are all merged and live. **Phase C (Stripe self-serve) is next.** **Build order is now B → C → collection/arrears deepening → D (delayed) → E (re-scoped)** — see Rev 3 below; this reverses the original B → C → M → D → E order's bet that AI ingestion (D) is what earns per-property pricing. Each phase = its own branch/PR off `main`; run the phase's verification block before opening the PR.

---

## Revision log

**Rev 3 — 2026-07-30.** Formally adopts the collection-first sequencing that
Rev 2's own Phase D bet (assumption A1) argued against. Full reasoning in
`docs/2026-07-30-collection-first-pivot.md`. Summary:
1. **Build order changes from B → C → M → D → E to B → C → collection/
   arrears deepening → D (delayed) → E (re-scoped).** M is already shipped,
   dropped from the forward order.
2. **Phase D (AI ingestion) is delayed, not cancelled.** It remains the
   biggest, highest-uncertainty bet on this roadmap; it's deprioritized
   because two independent signals now point the same direction (see
   below), not because it stopped being a good idea.
3. **Assumption A1 is reversed.** Rev 2 bet "AI ingestion is the
   effort-killer that makes it worth per-property pricing." The evidence
   since then points at collection/arrears instead — see A1's row in the
   assumptions table, updated below.
4. **Two independent signals drove this**, not one: the 4-agent user
   research from 2026-07-24 (`docs/2026-07-24-settleroo-integrated-research-synthesis.md`,
   unanimous across all 4 agents that "collecting the money" outranks
   bill-splitting or ingestion as the real pain), and this session's own
   reactive build history — partial payment + carry-forward, working
   overdue reminders, and a per-tenant balance view were all pulled forward
   ahead of schedule because Chris hit the pain directly while testing,
   completely independent of the research.
5. **Phase E's collection-flavored items (arrears autopilot, "explain my
   bill" tenant assistant) may get pulled forward ahead of Phase D's
   AI-ingestion items once Phase C ships** — the same pattern that already
   played out once this session, now made an explicit part of the plan
   instead of an ad hoc reaction each time.

**Rev 2 — 2026-07-19.** Founder decisions locked after the Fable critique + an ingestion brainstorm:
1. **Pricing metric → per-property** (~A$10 / property / month). Was flat A$19/mo. Reprice via the `plans` table.
2. **ICP → 2–10 property rent-by-room operators.** Was the individual 1-property landlord. Positioning/copy retargets here.
3. **Free tier no longer caps bills/month** (Fable caught the collision with auto-generated rent bills). The monetization lever is properties, not bill count.
4. **Phase D ingestion fully redesigned** — capture (connect-inbox-once + email-in), text-layer-first extraction, per-provider templates, plausibility-against-history verification, glance-to-confirm UX, and source/provenance. **First pass is human-reviewed only — NO auto-send.** The trust ladder + confidence-gated auto-send move to Phase E, gated on calibration data.
5. **New Phase M — marketing-site commercialization** (nav IA, primary CTA, public demo bill, on-page USP copy).
6. **A2 (pricing/ICP) resolved**; assumptions table updated.

**Rev 1 — 2026-07-19.** Folded in the Karpathy review: North Star + per-phase outcome targets, a numeric D→E gate, the AI-extraction verifier, the USP guardrail enforced in code (`CLAUDE.md` Always/Ask/Never), and the assumptions block.

---

## North Star & success metrics

**North Star:** reach **~15 paying operators averaging ~3 properties each (≈A$450 MRR)** by **2026-10-31**, with **free→paid conversion ≥5%** and **week-4 activation ≥40%** (activation = added a property AND issued a first real bill).

**The decision this roadmap exists to answer:** *Does willingness-to-pay among small multi-property operators clear the bar to justify continued full-focus build?* Every phase must move a number toward that decision, or it isn't worth its branch.

---

## Assumptions & how we'll test them

| # | Assumption | Status / test | If false |
|---|---|---|---|
| A1 | ~~AI ingestion is the effort-killer that makes it worth per-property pricing~~ **REVERSED 2026-07-30 (Rev 3):** operators pay because Settleroo removes the whole bill→settled loop, and **collecting the money (arrears/chasing tenants) is the actual effort-killer** — not ingestion. | Unanimous across the 2026-07-24 4-agent research, corroborated independently by this session's own reactive build history (partial payment/carry-forward, overdue reminders, per-tenant balances all pulled forward ahead of schedule under real use). | If collection tooling doesn't move retention/conversion once shipped, revisit — ingestion (Phase D) is delayed, not abandoned, and remains the fallback wedge. |
| A2 | ~~Pricing/ICP~~ **RESOLVED 2026-07-19**: per-property (~A$10/door), ICP = 2–10 property operators. | Decided after Fable critique. Validate the price point in the 10 operator interviews (Phase M pre-work). | If interviews reject per-property, revisit the metric before Stripe hardens in Phase C. |
| A3 | "Portability via read-only MCP" is a **retention perk**, not the wedge (per Fable). | Phase D: do Pro operators connect + query the MCP more than once? | Confirms Fable — keep MCP as a second-act, never build write-tools. |
| A4 | **Silent extraction errors (confident + wrong) can be driven near zero** with ensemble + plausibility + per-provider templates — the precondition for ever allowing auto-send. | Phase D eval: measure calibration + silent-error rate on the golden set. | No auto-send ever ships; ingestion stays permanently human-reviewed (still valuable). |

Keep this table live; record decisions with dates.

---

## Context

v1.5 shipped a polished single-segment product: split bills, generate recurring rent, chase tenants — all live at roomietab.netlify.app. What did not exist was everything that makes it a *business*: no way to charge, no usage cap, no founder view of accounts, no AI. This roadmap builds that.

Gaps identified 2026-07-17 (checked against code):
- No entitlements/pricing beyond Phase A, no operator plane, no audit trail, no seed script, no AI.
- Launch blockers: Resend sandbox email limitation, Google OAuth not enabled (delete-property UI shipped in Phase A).

### Founder decisions (locked)
1. **Pricing:** Free "Starter" (1 property, up to 4 tenants, "Powered by Settleroo" branding, no AI) vs **Pro at ~A$10 / property / month** (annual ~2 months free), unlocking unlimited tenants/bills, branding removal, and all AI. **No bills/month cap on any tier.** Exact numbers live in the `plans` table (data, not code).
2. **ICP:** 2–10 property rent-by-room operators. All new marketing copy and onboarding target this persona.
3. **MCP:** ship a **read-only** MCP server as a Pro feature — positioned as a retention perk ("your ledger, readable by your AI"), not the core wedge.
4. **AI flagship = redesigned email/inbox ingestion** (Phase D) — the effort-killer that anchors per-property pricing.
5. **Stripe stays P1:** manual (operator-granted) plans first; Stripe Checkout lands in Phase C, wired to the `plans` table.

### The USP guardrail for every AI feature
**"AI at the edges, deterministic math in the middle."** AI reads bills, drafts messages, answers questions, exports summaries — it **never** computes a split or mutates money state without explicit human confirm. This is the trust story ("ChatGPT guesses; Settleroo proves") and it is **enforced, not just stated**: see the repo root `CLAUDE.md` Always/Ask/Never block and the guardrail tests in Phase D. The AI/ingestion service role has no write grant to split/amount tables; AI paths may only `INSERT` a `status='draft'` row with non-authoritative amounts until a human confirms.

---

## Segment map (who gets what)

| Capability | Free (Starter) | Pro (per-property) | Operator (founder) |
|---|---|---|---|
| Split engine, tenant no-login links, recurring rent | ✓ (1 property) | ✓ all properties | n/a |
| Unlimited tenants / bills | — (1 property, ≤4 tenants) | ✓ | n/a |
| Tenant page branding | "Powered by Settleroo" (viral loop) | removable | n/a |
| AI ingestion — inbox/email-in + plausibility (R7) | — | ✓ | n/a |
| MCP server / "ask your books" (read-only) | — | ✓ | ✓ (own books) |
| Arrears autopilot + confidence-gated auto-send (Phase E) | — | ✓ | n/a |
| EOFY tax pack (Phase E) | — | ✓ | n/a |
| Accounts CRM, impersonation, metrics, plan grants | — | — | ✓ (§6 O1–O5) |

---

## Phase A — Monetization spine + launch blockers — ✅ SHIPPED (PR #7, 2026-07-18)

**Goal:** a stranger can hit a limit, see why, and be flipped to Pro; nothing embarrassing blocks real users.
**Outcome target:** ≥30% of new free signups hit a limit within 14 days; ≥8% of those view `/pricing`. Instrument this — it's the A1 signal.

Built: `plans`/`subscriptions`/`entitlement_overrides` tables (migration `20260719090000_plans_and_entitlements.sql`); `check_entitlement(key)` SECURITY DEFINER RPC wired into `createProperty`, `createTenant`, `createBillWithSplits`, `createRentBill`; global upgrade modal + public `/pricing` rendered from the `plans` table; delete-property UI with cascade confirm.

**Verified live:** free account blocked at property #4 → upgrade modal; operator-flip to Pro → action succeeds. Tests 14/14, build clean.

**Repricing follow-up (rev 2):** update the `plans` rows to the per-property metric and remove the bills/month limit. This is a data change (edit the row + seed), not code — but confirm the entitlement copy in `UpgradeModal` and `/pricing` reads correctly against a per-property limit before Phase C wires Stripe.

**Still open (founder actions, not code):** verify a custom domain at resend.com/domains + `supabase secrets set EMAIL_FROM=...`; enable Google OAuth in the Supabase dashboard.

## Phase B — Operator plane: the founder CRM (PRD §6 O1–O5 + R6) — ~80% built, PR #35 open

**Goal:** Chris-as-founder manages *accounts* the way Chris-as-landlord manages *properties*.
**Outcome target:** every persona demoable from a single `npm run seed`; the founder can answer "who's about to churn and who should I nudge to Pro?" in <60s; the split-sum-invariant alert reads exactly zero.

1. ✅ **Access model** (PRD §6): `operator: true` in `app_metadata` (service-role only), `/operator` routes, all reads/writes via SECURITY DEFINER RPCs asserting the claim, 404 for non-operators.
2. ✅ **O1 Accounts list:** email/name, plan, status incl. churn-risk (no login 14d), properties/tenants/bills-30d counts, last active, MRR, signup date; sort/filter.
3. ✅ **O2 Account detail:** plan switch (how manual Pro grants work — pairs with the `subscriptions` table), founder notes, usage timeline, entitlement overrides, danger zone (suspend, revoke tokens).
4. ✅ **O3 Read-only impersonation** with banner + `operator_audit_log` on every action; writes blocked server-side. *(Impersonation itself is a client-side banner today, not an actual read-only data fetch of the target account — noted limitation, not yet closed.)*
5. ✅ **O4 Business metrics tiles:** signups, activation, WAU, bills processed, **split-sum-invariant violations (hard alert, must be zero)**, link open rate, claimed→confirmed, MRR, plan mix.
6. ✅ **O5 Operations:** resend failed email, regenerate/revoke tenant token, view bill audit trail.
7. ✅ **Bill audit trail** (prereq for O5 + the dispute-killer USP): `bill_events(bill_id, event_type, actor, payload jsonb, created_at)` append-only; write from issue/send/view/claim/confirm/reissue paths.
8. ✅ **R6 seed script** (`npm run seed`, actually `node scripts/seed.js`): operator + 2 landlords + 3 properties + 8 tenants + 8 bills across statuses + a rent-rate change + a reissue scenario. Shipped in PR #35, verified column-correct against `docs/SCHEMA_REFERENCE.md`.
9. ✅ **CRM extensions:** activation funnel (signed up → added property → issued first bill, on `OperatorDashboard.js`), founder notes per account (`account_notes` table + `operator_add_account_note` RPC, on `OperatorAccountDetail.js`), churn-risk work-queue ("Needs attention — going quiet" section, not just a filter). Shipped 2026-07-30.

**Phase B is complete** — PR #35 merged 2026-07-30; items 8-9 shipped the same day in a follow-up PR. Remaining known limitation, not blocking: O3 impersonation is a client-side banner, not a real read-only data fetch of the target account — a future pass, not part of this phase's scope.

**Acceptance:** two-account isolation test passes (non-operator → RPC error + 404); every operator action writes an `operator_audit_log` row; `npm run seed` produces a demoable state for all three personas; split-sum-invariant alert fires on a deliberately broken split and reads zero otherwise.

## Phase C — Stripe self-serve (P1 unlock) — ▶ NEXT after Phase B, not started

**Goal:** a stranger goes free → paid → entitlement honored with zero founder involvement.
Stripe Checkout + customer portal + webhook → `subscriptions` (source=stripe), per PRD §7 P1. **Wire to the per-property metric in the `plans` table — quantity = active property count.** Never hand-roll billing.
**Acceptance:** test-mode checkout for a 3-property operator bills 3× the per-property price → webhook flips `subscriptions` → entitlement immediately honored; adding a 4th property updates the subscription quantity.

## Phase M — Marketing-site commercialization — ✅ SHIPPED (M1 nav/CTA, M2 hero/demo/trust signals)

**Goal:** the logged-out site reads as a commercial product for operators, not a bare app. Fixes the Fable critique.
**Outcome target:** landing → signup conversion instrumented and improved; the primary CTA a stranger sees is "Get started free," not "Login."

1. **Nav IA:** replace the lone "Pricing" link with anchor nav (Product / How it works · Pricing · FAQ), a primary filled **"Get started free"** button, and a secondary text **"Log in."**
2. **Hero:** put the USP on the page — "ChatGPT guesses; Settleroo proves" (currently buried in internal docs). Lead with the operator pain ("collecting from a full house of tenants"), mechanism second.
3. **Live demo:** ship a public, no-login **example tenant bill** as an interactive demo (the product's best unused asset). Link it from the hero.
4. **Trust signals:** logos/testimonials placeholder, "N bills split," a founder note. Add a footer (currently missing).
5. **Copy hygiene:** remove stack-leak language ("Supabase," "row-level security") from user-facing copy — say "bank-grade isolation," not the vendor name.
6. **Retarget copy to the 2–10 property operator** (not "your first property" as the whole story).

**Acceptance:** logged-out nav shows the new IA + primary CTA; the demo bill loads with no login; Lighthouse/perf not regressed; `CI=true npm run build` clean.

## Phase Collection — deepening arrears/collection tooling (Rev 3, new) — after Phase C, not started

**Goal:** collecting the money — not splitting it — becomes the product's real focus, per the reversed A1 assumption. This phase already has a running head start: Round 2 (partial payment + carry-forward, `docs/2026-07-27-partial-payment-carry-forward.md`) and the overdue-reminder cron fix both shipped reactively this session, ahead of any formal phase for them.

1. **CHR-21 — Occupancy exceptions:** let a landlord record a negotiated absence adjustment (a tenant away for an extended period, agreed not to pay their share for that sub-period). Confirmed via a full trace of `computeSplits`/`bill_splits`/`tenants` that no existing column can carry this — needs a real migration (an adjustments table or nullable columns on `bill_splits`), read as an extra input to `computeSplits`, gated by the same paid-split/reissue guards as everything else.
2. **Multi-property "who owes you" scaling** (self-QA c.2): the current dashboard rollup doesn't have a real design for 10 properties / 30+ tenants — Chris flagged this himself, no clear pattern picked yet. Needs a short design pass before building (per `docs/DEFINITION_OF_DONE.md`'s "design first for open-ended scope" rule).
3. **Candidates pulled forward from Phase E** (re-scoped per Rev 3, evaluate after the two items above): arrears autopilot (AI-drafted escalating reminders, gated on `bill_events` from Phase B) and the "explain my bill" tenant-facing assistant. Both are collection-flavored, neither actually depends on Phase D's ingestion work — re-evaluate bringing them in ahead of Phase D once this phase's core items ship.

**Acceptance:** CHR-21's exact scenario (a tenant negotiates a sub-period absence) works end-to-end without violating the split-sum invariant; the multi-property view has been through a real design review, not shipped ad hoc.

## Phase D — AI wedge 1: ingestion that earns trust — delayed (Rev 3), not started

**Design principle (from the 2026-07-19 brainstorm):** the job is not "OCR a PDF." It's *bills flow in without the operator lifting a finger, the number is sanity-checked against reality, and the operator confirms with a glance.* **First pass is human-reviewed only — NO auto-send.** Autonomy is earned later (Phase E) once calibration data proves it's safe.

**Outcome target / gate into E:** **≥40% of Pro operators use ingestion ≥2× in their first month AND draft-accept rate (drafts confirmed with no edit) ≥70%**, with a measured **silent-error rate at high confidence near zero**. Below any line → fix D before building E. This is the definition of "proves demand."

**1. Capture — kill the manual forward.**
   - **Email-in (baseline):** per-property `bills+{short_id}@in.roomietab.com` via Resend inbound. Operators can set this as the billing contact on their utility account so bills arrive pre-routed and never touch their personal inbox.
   - **Connect-inbox-once (the seamless path):** narrow-scope Gmail/Outlook OAuth that watches **only known biller domains** (AGL, Origin, EnergyAustralia, water/internet providers), auto-detects new bills, and prepares a draft before the operator opens the email. Privacy-scoped; read-only; disconnectable.
   - AC: forwarded/detected bill → draft appears within 60s (p95); address/property mismatch → "unmatched," never auto-assigned; non-bill emails from a biller domain are ignored, not drafted.

**2. Extract — text-layer first, not OCR-first.**
   - Parse the PDF **text layer** first (exact, zero hallucination — most utility bills are digitally generated). Vision-LLM/OCR only as fallback for scanned/photo bills.
   - **Per-provider templates:** after the first human-verified extraction from a provider, learn field locations/formats so subsequent months are near-deterministic lookup, not a fresh guess. Accuracy compounds per provider (a moat).
   - **Ensemble/two-key on `total`:** extract the total two independent ways; agree to the cent → high confidence; disagree → force low-confidence.

**3. Verify — plausibility reasoning against history (the killer feature).**
   - Cross-check every extraction: total vs. the property's rolling average for that provider; billing-period length vs. typical (~30 days); due date is in the future; total ≈ sum of line items when present.
   - Any failure → flag for review with the reason shown ("$340 vs. your usual $110–140; period reads 91 days"). Catches extraction errors **and** real-world errors (wrong bill, leak, misread decimal) before a tenant sees them.

**4. Confidence gating.**
   - High confidence (ensemble agrees + plausibility passes) → prepared draft, ready to review.
   - Low confidence on any field → that field is **blanked and flagged**, never guessed. **A guessed number is never written to a money field.**

**5. Confirm — a 3-second glance, not a form.**
   - Show extracted values **overlaid on the bill image**, total big, **confidence colored per field** (green = high, amber = low). The eye goes to the amber field; confirm with one tap, fix with one tap.
   - **Email-native confirm loop** for non-app-native operators: Settleroo replies to the forwarded bill with the summary + a one-click "Confirm & send to tenants" button — the loop happens in the inbox they already use.
   - On confirm → hand off to the **deterministic engine** (sole splitter).

**6. Provenance — turn extraction into the dispute-killer.**
   - Store the source bill + extraction provenance. Surface on the tenant page: "$40 — extracted from your Origin bill dated 12 Jul, verified against 6 months of history," with the source image. Trust propagates to tenants.

**7. Evals (the foundation everything else stands on).**
   - **Golden set:** ≥50 labelled real bills per major provider, varied by format (PDF text, scanned PDF, phone photo, forwarded email body), each with known-correct `{vendor, total, due_date, period, line_items}`. Build it the week Phase D starts.
   - **Accuracy AC:** field-level ≥95% on `total` and `due_date`. Below → blank + flag, never guess.
   - **Calibration + silent-error rate:** measure whether "high confidence" actually correlates with correct. Track the **silent-error rate** (confident + wrong) — this is the number that gates auto-send in Phase E. It must be near zero before autonomy unlocks.
   - **CI regression:** the golden set runs on every model/prompt/template change; a drop fails the build.

**8. Read-only MCP server** (retention perk, per Fable — instrument A3): per-operator scoped tools (`get_balances`, `get_bill(id)`, `list_overdue`, `get_property_summary`, `get_tenant_ledger`), revocable shown-once token. Read-only, no mutations. Instrument connect + query counts.

**9. In-app "ask your books"** (thin chat over the same RPCs): grounded strictly in stored data, never free-generated numbers; must match dashboard exactly and not hallucinate narrative around correct numbers.

**10. Predictive expectation** (fast-follow, delight): learn each provider's cadence; if an expected bill is late, nudge "your Origin bill usually lands by now — forward it?"

**Explicitly deferred out of D:** confidence-gated **auto-send** and the earned-autonomy **trust ladder** → Phase E, gated on the calibration/silent-error data from item 7.

**Founder prereq:** `in.roomietab.com` DNS + Resend inbound; Gmail/Outlook OAuth app registration for connect-inbox.

**Acceptance:** (a) a real PDF bill forwarded/detected → draft in <60s; (b) the golden set passes its accuracy AC in CI; (c) a low-confidence field is left blank, never guessed; (d) a deliberately anomalous bill is flagged with a reason; (e) Claude Desktop connects to the MCP with a scoped token → queried numbers match the dashboard exactly; revoke → access dies.

## Phase E — AI wedge 2: close the loop (after D passes its gate) — delayed with D (Rev 3), not started

**Rev 3 note:** items 2 and 4 below are collection-flavored and don't actually depend on Phase D's ingestion work — see "Phase Collection" above, which may pull them forward ahead of Phase D entirely. Items 1, 3, 5 genuinely depend on Phase D shipping first (auto-send needs D's calibration data; EOFY/anomaly-nudge need D's extraction pipeline).

1. **Confidence-gated auto-send + trust ladder** (moved from D): every operator starts human-reviewed. After N consecutive zero-edit confirmations from a provider, offer opt-in auto-send **under a dollar ceiling**, provider-scoped, always reversible. Unlocks **only** when the Phase D silent-error rate is proven near zero. The product visibly earns the right to act.
2. **Arrears autopilot:** AI-drafted escalating reminders (friendly → firm → final), operator approves the sequence once, app executes on schedule. Requires `bill_events` from Phase B. "From bill to settled, without you." *(Candidate to pull forward — see Phase Collection.)*
3. **EOFY tax pack** (seasonal, AU): per-property annual export, AI-categorized, accountant-ready. Time launch for May–June.
4. **"Explain my bill" tenant assistant:** ask-why box on the no-login tenant page, grounded strictly in the stored deterministic breakdown. *(Candidate to pull forward — see Phase Collection.)*
5. **Bill anomaly nudge** (productized from the Phase D plausibility layer): "This power bill is 38% above the same period last year — check it before splitting."

### Explicitly still parked
Payment rails (tenant money movement), native apps, WhatsApp, state-by-state compliance, B2B/agency multi-seat. MCP **write** tools parked until read-only shows usage.

---

## Verification (per phase)

- **Phase A** ✅: reproduced live. `CI=true npx react-scripts test` + `CI=true npm run build`.
- **Phase M** ✅: new nav IA + primary CTA render logged-out; public demo bill loads with no login; build clean.
- **Phase B:** two-account isolation test; every operator action → `operator_audit_log` row; `npm run seed` + login as all three personas end-to-end; split-sum-invariant alert fires on a broken split, reads zero otherwise.
- **Phase C:** per-property test-mode checkout → webhook flips `subscriptions` → entitlement honored; property count change updates quantity.
- **Phase Collection:** CHR-21's exact negotiated-absence scenario works end-to-end without breaking the split-sum invariant; the multi-property view has been through a real design review before shipping.
- **Phase D:** the five acceptance checks above, including the golden-set CI eval and the low-confidence-blank behaviour.
- **Phase E:** auto-send stays locked until the D silent-error rate is proven near zero; autopilot dry-run (drafts logged, not sent) verified against seed data before any real send.

**Guardrail tests (every AI-touching phase):** assert no AI/edge-function path can write to split/amount tables; assert ingestion only ever inserts `status='draft'` with non-authoritative amounts pre-confirm.

## Execution note

Each phase = its own branch/PR off `main`. **Build order (Rev 3): B → C → Collection → D (delayed) → E (re-scoped)** — M is already shipped. Before any PR, run that phase's verification block + the guardrail tests + `CI=true npx react-scripts test` + `CI=true npm run build`. **Per `docs/DEFINITION_OF_DONE.md`: stop and check with Chris after each phase before starting the next — do not chain straight through.**
