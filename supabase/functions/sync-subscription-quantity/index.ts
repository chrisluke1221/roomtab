// CHR-34 Phase C: sync-subscription-quantity
//
// Called fire-and-forget from PropertyContext after createProperty or
// deleteProperty succeeds. Updates the Stripe subscription item quantity
// to match the caller's current active property count.
//
// No-ops silently if:
//   - The account has no Stripe subscription (source != 'stripe')
//   - The subscription is not active
//   - STRIPE_SECRET_KEY is not set
//
// This means free-plan and manual-plan accounts are never touched.
//
// Request: POST (authenticated), no body required
// Response: { synced: boolean, quantity?: number }

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

    // If Stripe isn't configured, silently no-op — this function is called
    // fire-and-forget and we don't want to surface errors to the landlord
    // for a billing sync that isn't set up yet.
    if (!stripeSecretKey) return jsonResponse({ synced: false, reason: 'not_configured' });

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData.user) return jsonResponse({ error: 'Invalid session' }, 401);

    const userId = userData.user.id;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // ── 2. Check if this account has an active Stripe subscription ──────────
    const { data: subscription } = await adminClient
      .from('subscriptions')
      .select('stripe_subscription_id, source, status')
      .eq('account_id', userId)
      .single();

    if (
      !subscription ||
      subscription.source !== 'stripe' ||
      subscription.status !== 'active' ||
      !subscription.stripe_subscription_id
    ) {
      // Silently no-op — not a Stripe-managed active subscription
      return jsonResponse({ synced: false, reason: 'not_stripe_active' });
    }

    // ── 3. Count the caller's active properties ─────────────────────────────
    const { count: propertyCount, error: countError } = await adminClient
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('landlord_id', userId);

    if (countError) return jsonResponse({ error: 'Could not count properties' }, 500);
    const quantity = Math.max(propertyCount ?? 1, 1);

    // ── 4. Fetch the subscription from Stripe to get the subscription item ID ─
    const subRes = await fetch(
      `https://api.stripe.com/v1/subscriptions/${subscription.stripe_subscription_id}`,
      { headers: { Authorization: `Bearer ${stripeSecretKey}` } },
    );
    const stripeSub = await subRes.json() as {
      items?: { data: Array<{ id: string; quantity: number }> };
      error?: { message: string };
    };

    if (!subRes.ok) {
      console.error('sync-subscription-quantity: Stripe fetch error', stripeSub.error);
      return jsonResponse({ error: stripeSub.error?.message ?? 'Stripe error' }, 502);
    }

    const itemId = stripeSub.items?.data?.[0]?.id;
    const currentQuantity = stripeSub.items?.data?.[0]?.quantity;

    if (!itemId) {
      console.error('sync-subscription-quantity: no subscription item found');
      return jsonResponse({ error: 'No subscription item' }, 500);
    }

    // Skip the Stripe API call if quantity is already correct — avoids
    // unnecessary Stripe API calls and webhook noise.
    if (currentQuantity === quantity) {
      return jsonResponse({ synced: true, quantity, reason: 'already_correct' });
    }

    // ── 5. Update the subscription item quantity ────────────────────────────
    const updateRes = await fetch(
      `https://api.stripe.com/v1/subscription_items/${itemId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ quantity: String(quantity) }).toString(),
      },
    );

    const updateResult = await updateRes.json() as { error?: { message: string } };
    if (!updateRes.ok) {
      console.error('sync-subscription-quantity: Stripe update error', updateResult.error);
      return jsonResponse({ error: updateResult.error?.message ?? 'Stripe error' }, 502);
    }

    console.log(
      `sync-subscription-quantity: user ${userId} → quantity ${currentQuantity} → ${quantity}`,
    );
    return jsonResponse({ synced: true, quantity });
  } catch (err) {
    console.error('sync-subscription-quantity unexpected error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
