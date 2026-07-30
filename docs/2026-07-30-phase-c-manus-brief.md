# Phase C brief — Stripe self-serve (for Manus)

**Read first, in order:** `CLAUDE.md` → `docs/DEFINITION_OF_DONE.md` → `docs/SCHEMA_REFERENCE.md` → `docs/design-system.md` → `docs/2026-07-23-manus-handoff.md` → this doc.

## Goal

From the canonical roadmap's Phase C section (`docs/2026-07-19-settleroo-v2-roadmap.md`): a stranger goes free → paid → entitlement honored with zero founder involvement. Stripe Checkout + customer portal + webhook → `subscriptions` table (`source='stripe'`), wired to the existing per-property metric already in the `plans` table (quantity = active property count).

## Before writing any code

Per `docs/DEFINITION_OF_DONE.md`'s "design first for open-ended tickets" rule — this ticket only has a one-paragraph description in the roadmap, the exact kind of gap that caused Phase B's schema bugs (see `docs/2026-07-29-phase-b-migration-fixes.md` for what went wrong there and why). **Post a short technical design as a Linear comment or PR draft before implementing**, covering:
- The exact webhook events handled and what each one writes to `subscriptions`.
- The Checkout Session creation parameters (mode, quantity, success/cancel URLs).
- How `subscriptions.stripe_customer_id` gets linked to the right `auth.users` row on first checkout.

Get that reviewed before writing the full implementation.

## What actually needs custom UI

`src/pages/Pricing.js`'s upgrade CTA is currently a `mailto:` link (manual, founder-arranged upgrades); `src/components/UpgradeModal.js` just links to `/pricing`. Since Stripe hosts the actual checkout and billing-portal UI (per `CLAUDE.md`'s "never hand-roll billing" guardrail), Settleroo's own UI surface is small: a real "Upgrade to Pro" button that creates a Checkout Session and redirects, a small success/confirmation state on return, and a "Manage billing" entry point that redirects to Stripe's hosted Customer Portal. **No custom payment form, no custom plan-comparison-during-checkout screen** — Stripe owns that UI entirely.

## Design references (Mobbin) — tone, not a template to copy

- **Supabase** — `https://mobbin.com/screens/6e130b1f-de5a-4983-bb9b-fe32ef38369c` — an in-dashboard Settings → Subscription page, plan tiers side by side, usage-based line items, "Upgrade to Pro" / "Contact Us" CTAs. Closest analogue: a small developer-tool SaaS with per-resource pricing, same audience shape as Settleroo's 2-10 property operators.
- **Attio** — `https://mobbin.com/screens/a6a874b1-f7fb-4ffb-9040-d1bd0dbfae1a` — a "Change plan" confirmation modal: billing-period toggle, line-item summary (seats × price), tax, total due today, "your card won't be charged until X" messaging. Best precedent for the moment right after Stripe Checkout redirects back — a plain-English confirmation of what was just bought.
- **GitHub** — `https://mobbin.com/screens/34dde231-8c53-4a26-98f3-7c9a53099249` — "Upgrade your account" page: plan card, payment-frequency toggle, a highlighted "Payment due" callout. Clean precedent for the success/return state.

None of these should be copied wholesale — they're reference points for tone (plain-English money summaries, a highlighted "what happens now" box), applied through Settleroo's *own* design system below, not a new visual style.

## What already exists — read before writing anything new

- `docs/SCHEMA_REFERENCE.md`'s `subscriptions` table already has `stripe_customer_id`, `stripe_subscription_id`, and `source` (`'manual'` or `'stripe'`) columns, ready for this.
- `plans` table has `price_cents_monthly`, `price_cents_yearly`, `price_unit = 'per_property'` for Pro. Stripe Price IDs need to be added as a new column (`stripe_price_id_monthly`/`stripe_price_id_yearly`) — **update `docs/SCHEMA_REFERENCE.md` in the same PR**.
- `operator_set_plan` RPC (Phase B) already does the manual-grant version of what the Stripe webhook needs to do automatically — same `on conflict (account_id) do update` pattern on `subscriptions`. Reuse it as the reference pattern.
- `src/pages/Pricing.js` — replace the `mailto:` upgrade link with a real button.
- `src/components/UpgradeModal.js` — "See plans" can stay linking to `/pricing`; no change needed there.

## New pieces

1. **Edge function `create-checkout-session`** — authenticated, reads the caller's `auth.uid()`, creates a Stripe Checkout Session for the Pro plan at `quantity = active property count` (per-property metric), `success_url`/`cancel_url` back to `/pricing`, returns the session URL for the frontend to redirect to.
2. **Edge function `create-portal-session`** — authenticated, creates a Stripe Billing Portal session for the caller's existing `stripe_customer_id`, returns the URL to redirect to. Needed for "Manage billing" once someone's already on Stripe.
3. **Edge function `stripe-webhook`** — verifies the Stripe signature (never trust an unverified webhook body). Handles `checkout.session.completed` (upsert `subscriptions`, `source='stripe'`), `customer.subscription.updated`/`.deleted` (keep `subscriptions` in sync), and a property-count-changed trigger (or scheduled job) that calls Stripe's subscription-quantity-update API when a landlord adds/removes a property, per the roadmap's "adding a 4th property updates the subscription quantity" acceptance criterion.
4. **`src/pages/Pricing.js`** — real "Upgrade to Pro" button, calls `create-checkout-session`, redirects to the returned URL. Uses the design system's `.btn-primary` primitive (already used for the CTA slot) — no new button style needed.
5. **A small success/return state** (new lightweight page, or a banner on `/pricing` when returning from a successful session) — per the Attio/GitHub references above: a plain-English "You're on Pro now" confirmation stating what changed (property limit removed, branding removed), not a bare redirect back to the same page with no acknowledgment.
6. **"Manage billing" entry point** — a small link (Dashboard or a new lightweight Settings area — exact placement is Manus's call) that calls `create-portal-session` and redirects. Reuse the existing text-link action style (`text-primary-600 hover:text-primary-700 font-medium`), not a new button variant.

## Guardrails that apply here specifically (from `CLAUDE.md`)

- Never hand-roll billing — Stripe Checkout + Billing Portal only, no custom card form anywhere.
- Webhook signature verification is not optional — an unverified webhook is an unauthenticated write path to the `subscriptions` table.
- Schema/migration changes to `subscriptions` or `plans` are **ASK FIRST** — flag the new Stripe Price ID columns explicitly in the PR description. Migration file gets the `PROPOSED_` prefix per the standing convention, never applied by Manus itself.

## Design system compliance (`docs/design-system.md`) — check before shipping

- Reuse `.btn-primary` / `.btn-secondary` / `.card` / `.input-field` — no ad hoc classes.
- Any new "Pro" status indicator reuses `StatusBadge`'s pattern (`src/components/StatusBadge.js`) rather than a new badge component.
- Money amounts render through `Money` (`src/components/Money.js`) — never hand-formatted.
- Text color ladder (900→300) and icon sizing (`w-4 h-4` default) apply to any new UI exactly as documented.

## Verification (Phase C acceptance criterion, from the canonical roadmap)

Stripe test-mode checkout for a 3-property operator bills 3× the per-property price → webhook flips `subscriptions` → entitlement immediately honored; adding a 4th property updates the subscription quantity.

Plus the full `docs/DEFINITION_OF_DONE.md` checklist: schema verified against `docs/SCHEMA_REFERENCE.md` before writing SQL, tests/build actually re-run (not assumed), any new migration named `PROPOSED_` until applied and verified live by Chris or Claude Code.
