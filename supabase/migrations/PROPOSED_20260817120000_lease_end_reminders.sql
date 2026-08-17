-- Lease end date reminders (2026-08-17, Chris's request): tenants.fixed_term_end
-- already existed (added 2026-07-16) but was never surfaced anywhere in the
-- app or read by any code path. This adds the one piece of state needed to
-- send a "4 weeks before lease end" reminder exactly once per lease-end
-- date, without re-sending every day the cron runs while it's still within
-- the 4-week window.
--
-- PROPOSED: apply once reviewed.

alter table public.tenants
  add column if not exists lease_reminder_sent_at timestamptz;

comment on column public.tenants.lease_reminder_sent_at is
  'Set when the "lease ends in 4 weeks" landlord reminder has been sent for the tenant''s CURRENT fixed_term_end. Cleared (via app logic) whenever fixed_term_end changes, so an extension gets its own future reminder.';

-- Schedule the daily cron job for send-lease-reminders, same cron_secret
-- Vault entry and pg_net dispatch pattern already used by
-- send-overdue-reminders (set up 2026-07-20, never itself captured in a
-- migration — this is the first time this pattern is migration-tracked).
-- Offset 30 minutes from the overdue-reminders job (09:00 UTC) so the two
-- don't contend for the same minute.
-- REQUIRES: the send-lease-reminders function must already be deployed
-- (supabase functions deploy send-lease-reminders --no-verify-jwt) before
-- this job's first run does anything useful — scheduling it before deploy
-- is harmless (the call just 404s and pg_net logs the failure).
select cron.schedule(
  'send-lease-reminders',
  '30 9 * * *',
  $$
  select net.http_post(
    url := 'https://trfaqjkkozusxdvqnkgo.functions.supabase.co/send-lease-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
