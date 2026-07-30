-- Phase C (CHR-34): Add Stripe price IDs to the plans table so the
-- create-checkout-session edge function can look up the correct Stripe
-- price without hardcoding it.
--
-- These columns are nullable. They are populated by the operator (Chris)
-- via the Stripe dashboard → copy the price ID → operator_set_plan or a
-- direct service-role UPDATE. App code never writes them.
--
-- PROPOSED: apply this migration once Chris has created the Stripe products
-- and price objects in test mode and has the price IDs ready to insert.
-- The edge functions read these columns at call time, so the function code
-- can be deployed before the columns are populated — it will return a
-- clear "plan not configured for Stripe checkout" error until the IDs are set.

alter table public.plans
  add column if not exists stripe_price_id_monthly text,
  add column if not exists stripe_price_id_yearly  text;

comment on column public.plans.stripe_price_id_monthly is
  'Stripe Price ID for the monthly billing period (e.g. price_xxx). Null = plan not available via Stripe Checkout.';
comment on column public.plans.stripe_price_id_yearly is
  'Stripe Price ID for the yearly billing period (e.g. price_yyy). Null = yearly not available via Stripe Checkout.';
