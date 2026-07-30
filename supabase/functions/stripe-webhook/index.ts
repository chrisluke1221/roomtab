// CHR-34 Phase C: stripe-webhook
//
// Receives Stripe webhook events and keeps the `subscriptions` table in sync.
// This is the only place Stripe data enters the database — no other code path
// should write stripe_customer_id, stripe_subscription_id, or source=stripe.
//
// Events handled:
//   checkout.session.completed   → upsert subscription row (plan=pro, status=active)
//   customer.subscription.updated → update status, period, current_period_end
//   customer.subscription.deleted → update status=canceled
//   invoice.payment_failed        → update status=past_due
//
// All other events are acknowledged (200) and ignored.
//
// Security: Stripe-Signature header is verified using HMAC-SHA256 before any
// DB writes. The function returns 400 for invalid signatures so Stripe will
// retry — it does NOT return 200 for bad signatures (which would silently
// drop events).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

// Constant-time string comparison — avoids leaking how many leading bytes of
// a guessed signature matched via response-timing, standard practice for any
// MAC comparison (this is a real-money webhook, not a place to cut corners).
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ── Stripe webhook signature verification ────────────────────────────────────
// Stripe signs webhooks with HMAC-SHA256. The signature header contains a
// timestamp (t=) and one or more signatures (v1=). We verify by recomputing
// the HMAC over `${timestamp}.${rawBody}` and comparing.
async function verifyStripeSignature(
  rawBody: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(
      sigHeader.split(',').flatMap((part) => {
        const [k, ...v] = part.split('=');
        return [[k.trim(), v.join('=')]];
      }),
    );
    const timestamp = parts['t'];
    const signature = parts['v1'];
    if (!timestamp || !signature) return false;

    // Reject events older than 5 minutes to prevent replay attacks
    const eventAge = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (eventAge > 300) return false;

    const signedPayload = `${timestamp}.${rawBody}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
    const computed = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return timingSafeEqual(computed, signature);
  } catch {
    return false;
  }
}

// ── Period detection from Stripe subscription ─────────────────────────────────
// Stripe doesn't have a "period" field — we infer it from the interval on the
// first subscription item's price.
function detectPeriod(stripeSubscription: Record<string, unknown>): 'monthly' | 'yearly' {
  try {
    const items = stripeSubscription.items as { data: Array<{ price: { recurring: { interval: string } } }> };
    const interval = items?.data?.[0]?.price?.recurring?.interval;
    return interval === 'year' ? 'yearly' : 'monthly';
  } catch {
    return 'monthly';
  }
}

// ── Map Stripe subscription status to our status enum ────────────────────────
function mapStatus(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return stripeStatus;
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'past_due'; // conservative fallback
  }
}

Deno.serve(async (req) => {
  // Webhooks are always POST; Stripe sends OPTIONS for nothing
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return jsonResponse({ error: 'Webhook not configured' }, 503);
  }

  // ── 1. Read raw body and verify signature ──────────────────────────────────
  const rawBody = await req.text();
  const sigHeader = req.headers.get('Stripe-Signature') ?? '';

  const isValid = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);
  if (!isValid) {
    console.error('Invalid Stripe signature');
    return jsonResponse({ error: 'Invalid signature' }, 400);
  }

  // ── 2. Parse event ─────────────────────────────────────────────────────────
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const eventType = event.type as string;
  const eventObject = event.data as { object: Record<string, unknown> };
  const obj = eventObject?.object;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // ── 3. Handle events ───────────────────────────────────────────────────────
  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        // The checkout session object contains the subscription ID and customer ID.
        // The supabase_user_id is in session.metadata (we set it in create-checkout-session).
        const session = obj as {
          mode: string;
          metadata: { supabase_user_id?: string };
          customer: string;
          subscription: string;
        };

        if (session.mode !== 'subscription') break; // ignore one-time payments

        const userId = session.metadata?.supabase_user_id;
        if (!userId) {
          console.error('checkout.session.completed: missing supabase_user_id in metadata', session);
          break;
        }

        // Fetch the subscription from Stripe to get period + current_period_end
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
        const subRes = await fetch(
          `https://api.stripe.com/v1/subscriptions/${session.subscription}`,
          { headers: { Authorization: `Bearer ${stripeSecretKey}` } },
        );
        const stripeSub = await subRes.json() as Record<string, unknown>;

        const period = detectPeriod(stripeSub);
        const currentPeriodEnd = stripeSub.current_period_end
          ? new Date((stripeSub.current_period_end as number) * 1000).toISOString()
          : null;

        const { error } = await adminClient.from('subscriptions').upsert(
          {
            account_id: userId,
            plan_id: 'pro',
            status: 'active',
            period,
            source: 'stripe',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            current_period_end: currentPeriodEnd,
          },
          { onConflict: 'account_id' },
        );

        if (error) {
          console.error('checkout.session.completed: DB upsert error', error);
          return jsonResponse({ error: 'DB write failed' }, 500);
        }

        console.log(`checkout.session.completed: activated Pro for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = obj as {
          id: string;
          customer: string;
          status: string;
          current_period_end: number;
          metadata?: { supabase_user_id?: string };
        };

        const period = detectPeriod(obj);
        const currentPeriodEnd = stripeSub.current_period_end
          ? new Date(stripeSub.current_period_end * 1000).toISOString()
          : null;
        const status = mapStatus(stripeSub.status);

        // Look up the account by stripe_subscription_id — more reliable than
        // metadata since the sub ID is stable across updates.
        const { error } = await adminClient
          .from('subscriptions')
          .update({
            status,
            period,
            current_period_end: currentPeriodEnd,
          })
          .eq('stripe_subscription_id', stripeSub.id);

        if (error) {
          console.error('customer.subscription.updated: DB update error', error);
          return jsonResponse({ error: 'DB write failed' }, 500);
        }

        console.log(`customer.subscription.updated: sub ${stripeSub.id} → status=${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = obj as { id: string };

        const { error } = await adminClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            current_period_end: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSub.id);

        if (error) {
          console.error('customer.subscription.deleted: DB update error', error);
          return jsonResponse({ error: 'DB write failed' }, 500);
        }

        console.log(`customer.subscription.deleted: sub ${stripeSub.id} canceled`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = obj as { subscription: string };
        if (!invoice.subscription) break;

        const { error } = await adminClient
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription);

        if (error) {
          console.error('invoice.payment_failed: DB update error', error);
          return jsonResponse({ error: 'DB write failed' }, 500);
        }

        console.log(`invoice.payment_failed: sub ${invoice.subscription} → past_due`);
        break;
      }

      default:
        // Acknowledge and ignore all other events
        console.log(`stripe-webhook: ignoring event type ${eventType}`);
    }
  } catch (err) {
    console.error(`stripe-webhook: error handling ${eventType}:`, err);
    return jsonResponse({ error: 'Handler error' }, 500);
  }

  // Always return 200 to acknowledge receipt (unless we returned early above)
  return jsonResponse({ received: true });
});
