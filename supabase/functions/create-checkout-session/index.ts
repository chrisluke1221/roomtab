// CHR-34 Phase C: create-checkout-session
//
// Creates a Stripe Checkout Session for a landlord upgrading to Pro.
// The session uses mode=subscription with quantity=active_property_count
// so the charge is per-property per-month (or per-year).
//
// Request: POST (authenticated)
//   Body: { period: 'monthly' | 'yearly' }
//
// Response: { url: string }  — frontend redirects to this URL
//
// Security: caller must be authenticated. The Stripe secret key and the
// plan's stripe_price_id are never exposed to the client — all Stripe API
// calls happen here, server-side.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // ── 1. Authenticate the caller ──────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Missing authorization' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const appUrl = Deno.env.get('APP_URL') ?? 'https://settleroo.netlify.app';

    if (!stripeSecretKey) return jsonResponse({ error: 'Stripe not configured' }, 503);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData.user) return jsonResponse({ error: 'Invalid session' }, 401);

    const userId = userData.user.id;
    const userEmail = userData.user.email;

    // ── 2. Parse and validate request body ─────────────────────────────────
    let period: string;
    try {
      const body = await req.json();
      period = body?.period;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }
    if (period !== 'monthly' && period !== 'yearly') {
      return jsonResponse({ error: 'period must be "monthly" or "yearly"' }, 400);
    }

    // ── 3. Load plan + subscription data via service role ───────────────────
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get the pro plan's Stripe price ID for the requested period
    const { data: plan, error: planError } = await adminClient
      .from('plans')
      .select('stripe_price_id_monthly, stripe_price_id_yearly')
      .eq('id', 'pro')
      .single();

    if (planError || !plan) return jsonResponse({ error: 'Plan not found' }, 500);

    const priceId = period === 'yearly'
      ? plan.stripe_price_id_yearly
      : plan.stripe_price_id_monthly;

    if (!priceId) {
      return jsonResponse({
        error: 'Stripe Checkout is not yet configured for this plan. Please contact support.',
      }, 503);
    }

    // Count the caller's active properties — this is the subscription quantity
    const { count: propertyCount, error: countError } = await adminClient
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('landlord_id', userId);

    if (countError) return jsonResponse({ error: 'Could not count properties' }, 500);
    const quantity = Math.max(propertyCount ?? 1, 1); // minimum 1

    // Check if the caller already has a Stripe customer ID — reuse it to
    // avoid creating duplicate customer records in Stripe.
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('account_id', userId)
      .single();

    const existingCustomerId = subscription?.stripe_customer_id ?? null;

    // ── 4. Create Stripe Checkout Session ───────────────────────────────────
    const sessionPayload: Record<string, unknown> = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity }],
      success_url: `${appUrl}/pricing?checkout=success`,
      cancel_url: `${appUrl}/pricing`,
      // Pass the Supabase user ID in metadata so the webhook can look up
      // the account without relying on the customer email (which may differ).
      subscription_data: {
        metadata: { supabase_user_id: userId },
      },
      metadata: { supabase_user_id: userId },
      // Pre-fill the email field in Checkout so the landlord doesn't have
      // to type it again.
      customer_email: existingCustomerId ? undefined : userEmail,
      customer: existingCustomerId ?? undefined,
    };

    // Remove undefined values — Stripe's API rejects them
    Object.keys(sessionPayload).forEach((k) => {
      if (sessionPayload[k] === undefined) delete sessionPayload[k];
    });

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(flattenStripeParams(sessionPayload)).toString(),
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error('Stripe error creating checkout session:', session);
      return jsonResponse({ error: session?.error?.message ?? 'Stripe error' }, 502);
    }

    return jsonResponse({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session unexpected error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

// Stripe's REST API uses form-encoded nested params like
// line_items[0][price]=price_xxx — this helper flattens a JS object into
// that format so we can use fetch without the stripe-node SDK.
function flattenStripeParams(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(result, flattenStripeParams(item as Record<string, unknown>, `${fullKey}[${i}]`));
        } else {
          result[`${fullKey}[${i}]`] = String(item);
        }
      });
    } else if (typeof value === 'object') {
      Object.assign(result, flattenStripeParams(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}
