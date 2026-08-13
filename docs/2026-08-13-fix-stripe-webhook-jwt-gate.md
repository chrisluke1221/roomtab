# 2026-08-13 — Found and fixed: stripe-webhook silently rejecting every real Stripe delivery

While chasing down the still-open question from the 2026-07-30 handoff — "did
Phase C's live Stripe test-mode checkout ever actually work?" — found the
likely root cause, not just an unconfirmed test.

## What was wrong

`supabase functions list` showed `stripe-webhook` deployed with
`verify_jwt: true`. That's the Supabase Edge Functions platform gate: any
request without a valid Supabase-issued JWT in `Authorization` is rejected
with 401 **before the function's own code runs at all**.

`stripe-webhook`'s own code (correctly) does real HMAC-SHA256 signature
verification against Stripe's `Stripe-Signature` header — it was never
written to expect a Supabase session, because Stripe calls it directly,
server-to-server, with no Supabase JWT. With `verify_jwt: true` at the
platform level, every real webhook delivery from Stripe would have been
rejected at the gateway, 401, before the function's own (correct) signature
check ever got a chance to run. This is exactly the failure mode the
2026-07-30 handoff's "Landmines" section warned about in general
("a webhook endpoint existing at the right URL doesn't mean it's subscribed
to the right events") — this is the same class of silent-failure risk, one
level lower in the stack.

Confirmed `subscriptions` for the founder's own account was `source='manual'`
with `stripe_customer_id`/`stripe_subscription_id` both `null` — consistent
with a checkout attempt (or several) whose webhook never actually landed.

`send-overdue-reminders` was already correctly deployed with
`verify_jwt: false` (it's called by pg_cron via `net.http_post`, also with no
Supabase JWT, gated instead by its own `CRON_SECRET` check) — so the pattern
was already understood, just not applied to `stripe-webhook` when it was
first deployed.

## Fix

Redeployed `stripe-webhook` with `--no-verify-jwt`. Added explicit
`[functions.stripe-webhook]` and `[functions.send-overdue-reminders]`
sections to `supabase/config.toml` pinning `verify_jwt = false` for both, so
a future plain `supabase functions deploy` (without remembering the CLI
flag) can't silently regress this again.

## Still needed

This fixes the *delivery* problem. It does not by itself confirm the full
Phase C acceptance criterion (checkout → webhook → `subscriptions` flips →
entitlement honored) — that still needs a real test-mode checkout run
end-to-end now that the webhook can actually receive events. That's the
immediate next step, not yet done as of this doc.

## Verification
No app code changed — config + deploy-target change only.
`CI=true npx react-scripts test` + `CI=true npm run build` unaffected, still
green. Confirmed via `supabase functions list` that `stripe-webhook` now
reports `verify_jwt: false`.
