import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// 2026-08-17: emails the LANDLORD (never the tenant) once a tenant's
// fixed_term_end is within 4 weeks — "does this tenant want to extend?"
// This is a decision only the landlord makes; nothing here writes to
// move_out_date or fixed_term_end automatically. One reminder per lease
// end date: lease_reminder_sent_at gates it, and is cleared by
// updateTenant (PropertyContext.js) whenever fixed_term_end changes, so
// an extension gets its own future reminder.
//
// Cron-triggered, not user-triggered — gated by the same shared-secret
// pattern as send-overdue-reminders, not auth.getUser().
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get('CRON_SECRET');
  const authHeader = req.headers.get('Authorization') || '';
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const appUrl = Deno.env.get('APP_URL') ?? 'https://settleroo.netlify.app';

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const fourWeeksOut = new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: tenantsDue, error: tenantsError } = await admin
      .from('tenants')
      .select('id, name, room, property_id, fixed_term_end, landlord_id, properties(name)')
      .neq('status', 'former')
      .not('fixed_term_end', 'is', null)
      .gte('fixed_term_end', todayStr)
      .lte('fixed_term_end', fourWeeksOut)
      .is('lease_reminder_sent_at', null);

    if (tenantsError) throw tenantsError;
    if (!tenantsDue || tenantsDue.length === 0) {
      return jsonResponse({ sent: 0 });
    }

    let sent = 0;
    for (const tenant of tenantsDue) {
      if (!resendApiKey) continue;

      const { data: landlordUser, error: landlordError } = await admin.auth.admin.getUserById(tenant.landlord_id);
      if (landlordError || !landlordUser?.user?.email) continue;
      const landlordEmail = landlordUser.user.email;

      const daysRemaining = Math.round(
        (new Date(tenant.fixed_term_end).getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
      );
      const tenantName = escapeHtml(tenant.name);
      const propertyName = escapeHtml(tenant.properties?.name || 'your property');
      const tenantLink = `${appUrl}/properties/${tenant.property_id}/tenants/${tenant.id}`;

      const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
          <h2>Lease ending soon</h2>
          <p><strong>${tenantName}</strong>'s lease at ${propertyName} ends on <strong>${tenant.fixed_term_end}</strong> — ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} from now.</p>
          <p>Does ${tenantName} want to extend, or are they moving out?</p>
          <p>
            <a href="${tenantLink}" style="display:inline-block;background:#0d9488;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
              Review on Settleroo
            </a>
          </p>
        </div>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: Deno.env.get('EMAIL_FROM') ?? 'Settleroo <onboarding@resend.dev>',
          to: landlordEmail,
          subject: `${tenantName}'s lease ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
          html,
        }),
      });

      if (resendRes.ok) {
        sent += 1;
        await admin.from('tenants').update({ lease_reminder_sent_at: new Date().toISOString() }).eq('id', tenant.id);
      }
    }

    return jsonResponse({ sent, checked: tenantsDue.length });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
