// CHR-34 Phase C: create-portal-session
//
// Creates a Stripe Billing Portal session so a Pro landlord can manage their
// subscription (cancel, update payment method, view invoices) without
// contacting support.
//
// Request: POST (authenticated), no body required
//
// Response: { url: string }  — frontend redirects to this URL
//
// The caller must already have a stripe_customer_id in the subscriptions
// table (i.e. they went through Checkout at least once). If they don't,
// we return a 409 with a clear message.

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

    // ── 2. Look up the caller's Stripe customer ID ──────────────────────────
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: subscription, error: subError } = await adminClient
      .from('subscriptions')
      .select('stripe_customer_id, source, status')
      .eq('account_id', userId)
      .single();

    if (subError || !subscription) {
      return jsonResponse({ error: 'No subscription found for this account' }, 404);
    }

    if (subscription.source !== 'stripe' || !subscription.stripe_customer_id) {
      return jsonResponse({
        error: 'This account is not managed via Stripe. Contact support to manage your plan.',
      }, 409);
    }

    // ── 3. Create Stripe Billing Portal session ─────────────────────────────
    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: subscription.stripe_customer_id,
        return_url: `${appUrl}/pricing`,
      }).toString(),
    });

    const portalSession = await portalRes.json();
    if (!portalRes.ok) {
      console.error('Stripe error creating portal session:', portalSession);
      return jsonResponse({ error: portalSession?.error?.message ?? 'Stripe error' }, 502);
    }

    return jsonResponse({ url: portalSession.url });
  } catch (err) {
    console.error('create-portal-session unexpected error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
