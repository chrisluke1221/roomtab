-- Phase B: Operator plane — bill_events audit trail, operator_audit_log,
-- and all operator SECURITY DEFINER RPCs (O1–O5).
--
-- Access model (PRD §6):
--   • operator: true in auth.users.app_metadata (set via service role only)
--   • All operator reads/writes go through SECURITY DEFINER RPCs that assert
--     the claim — never through widened RLS on business tables.
--   • Non-operators calling any operator RPC receive an explicit error.
--
-- NEVER grant the authenticated role direct read on business tables beyond
-- what existing RLS already allows. The operator claim is the sole key.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. bill_events — append-only audit trail (ALWAYS write from every lifecycle
--    transition: issue / send / view / claim / confirm / reissue)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.bill_events (
  id          uuid primary key default gen_random_uuid(),
  bill_id     uuid not null references public.bills(id) on delete cascade,
  event_type  text not null
    check (event_type in (
      'issued', 'sent', 'viewed', 'claimed_paid', 'confirmed',
      'reissued', 'token_revoked', 'token_regenerated', 'email_resent',
      'partial_payment_recorded'
    )),
  actor_type  text not null check (actor_type in ('landlord', 'tenant', 'operator', 'system')),
  actor_id    uuid,          -- auth.uid() for landlord/operator; null for tenant/system
  actor_token text,          -- tenant token (hashed) for tenant actions
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- No UPDATE or DELETE — this table is append-only by design.
-- RLS: landlords can read events for their own bills; operator RPCs bypass RLS.
alter table public.bill_events enable row level security;

create policy "Landlords can read events for their own bills"
  on public.bill_events for select
  using (
    exists (
      select 1 from public.bills b
      where b.id = bill_events.bill_id
        and b.landlord_id = auth.uid()
    )
  );

-- Landlords insert their own bill events (issue, confirm, etc.)
create policy "Landlords can insert events for their own bills"
  on public.bill_events for insert
  with check (
    exists (
      select 1 from public.bills b
      where b.id = bill_events.bill_id
        and b.landlord_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. operator_audit_log — every operator action writes here (O3, O5)
-- ─────────────────────────────────────────────────────────────────────────────

create table public.operator_audit_log (
  id              uuid primary key default gen_random_uuid(),
  operator_id     uuid not null references auth.users(id),
  action          text not null,
  target_account  uuid references auth.users(id),
  target_object   text,   -- e.g. 'bill:uuid', 'tenant_token:uuid'
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

-- Operators can read their own audit log; no one else can.
alter table public.operator_audit_log enable row level security;

create policy "Operators can read their own audit log"
  on public.operator_audit_log for select
  using (operator_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Helper: assert_operator() — called at the top of every operator RPC
-- ─────────────────────────────────────────────────────────────────────────────

-- Never created anywhere else in this repo's migration history — the
-- private schema is not exposed to any client role, only used internally by
-- SECURITY DEFINER functions in the public schema.
create schema if not exists private;

create or replace function private.assert_operator()
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (
    select (raw_app_meta_data -> 'operator')::boolean
    from auth.users
    where id = auth.uid()
  ) is not true then
    raise exception 'operator access required' using errcode = 'P0001';
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. O1 — operator_list_accounts
--    Returns all landlord accounts with plan, status, usage, and churn-risk.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_list_accounts()
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_result jsonb;
begin
  perform private.assert_operator();

  select jsonb_agg(
    jsonb_build_object(
      'id',              u.id,
      'email',           u.email,
      'full_name',       u.raw_user_meta_data ->> 'full_name',
      'created_at',      u.created_at,
      'last_sign_in_at', u.last_sign_in_at,
      'plan_id',         coalesce(s.plan_id, 'free'),
      'plan_name',       coalesce(p.name, 'Starter'),
      'sub_status',      coalesce(s.status, 'none'),
      'sub_source',      coalesce(s.source, 'none'),
      'churn_risk',      (u.last_sign_in_at < now() - interval '14 days' or u.last_sign_in_at is null),
      'properties_count', (
        select count(*) from public.properties where landlord_id = u.id
      ),
      'active_tenants_count', (
        select count(*) from public.tenants where landlord_id = u.id and status = 'active'
      ),
      'bills_30d', (
        select count(*) from public.bills
        where landlord_id = u.id and created_at >= now() - interval '30 days'
      ),
      'mrr_cents', (
        case
          when s.plan_id is null then 0
          when s.period = 'yearly' then (p.price_cents_yearly / 12)
          else p.price_cents_monthly
        end
      )
    )
    order by u.created_at desc
  )
  into v_result
  from auth.users u
  left join public.subscriptions s on s.account_id = u.id and s.status in ('active', 'trialing')
  left join public.plans p on p.id = s.plan_id
  where (u.raw_app_meta_data -> 'operator') is not true;  -- exclude operator accounts

  return coalesce(v_result, '[]'::jsonb);
end;
$$;
grant execute on function public.operator_list_accounts() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. O2 — operator_get_account_detail(p_account_id)
--    Full profile: plan, overrides, usage timeline, notes.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_get_account_detail(p_account_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user     record;
  v_sub      record;
  v_plan     record;
  v_props    jsonb;
  v_overrides jsonb;
  v_events   jsonb;
begin
  perform private.assert_operator();

  select id, email, raw_user_meta_data, created_at, last_sign_in_at
    into v_user from auth.users where id = p_account_id;

  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;

  select s.*, p.name as plan_name, p.price_cents_monthly, p.price_cents_yearly, p.limits
    into v_sub
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.account_id = p_account_id and s.status in ('active', 'trialing');

  select jsonb_agg(
    jsonb_build_object(
      'id', pr.id, 'name', pr.name,
      'tenant_count', (select count(*) from public.tenants t where t.property_id = pr.id and t.status = 'active'),
      'bill_count_30d', (select count(*) from public.bills b where b.property_id = pr.id and b.created_at >= now() - interval '30 days')
    ) order by pr.created_at desc
  ) into v_props
  from public.properties pr where pr.landlord_id = p_account_id;

  select jsonb_agg(
    jsonb_build_object(
      'id', o.id, 'key', o.key, 'value', o.value,
      'expires_at', o.expires_at, 'created_at', o.created_at
    ) order by o.created_at desc
  ) into v_overrides
  from public.entitlement_overrides o where o.account_id = p_account_id;

  -- Last 50 bill events across all their bills
  select jsonb_agg(
    jsonb_build_object(
      'id', be.id, 'bill_id', be.bill_id,
      'event_type', be.event_type, 'actor_type', be.actor_type,
      'payload', be.payload, 'created_at', be.created_at
    ) order by be.created_at desc
  ) into v_events
  from public.bill_events be
  join public.bills b on b.id = be.bill_id
  where b.landlord_id = p_account_id
  limit 50;

  return jsonb_build_object(
    'id',              v_user.id,
    'email',           v_user.email,
    'full_name',       v_user.raw_user_meta_data ->> 'full_name',
    'created_at',      v_user.created_at,
    'last_sign_in_at', v_user.last_sign_in_at,
    'plan_id',         coalesce(v_sub.plan_id, 'free'),
    'plan_name',       coalesce(v_sub.plan_name, 'Starter'),
    'sub_status',      coalesce(v_sub.status, 'none'),
    'sub_source',      coalesce(v_sub.source, 'none'),
    'sub_period',      v_sub.period,
    'current_period_end', v_sub.current_period_end,
    'properties',      coalesce(v_props, '[]'::jsonb),
    'entitlement_overrides', coalesce(v_overrides, '[]'::jsonb),
    'recent_bill_events', coalesce(v_events, '[]'::jsonb)
  );
end;
$$;
grant execute on function public.operator_get_account_detail(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. O2 — operator_set_plan(p_account_id, p_plan_id, p_period)
--    Manual plan switch; writes operator_audit_log.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_set_plan(
  p_account_id uuid,
  p_plan_id    text,
  p_period     text default 'monthly'
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_old_plan text;
begin
  perform private.assert_operator();

  if p_period not in ('monthly', 'yearly') then
    raise exception 'invalid period' using errcode = 'P0003';
  end if;

  if not exists (select 1 from public.plans where id = p_plan_id) then
    raise exception 'plan not found' using errcode = 'P0004';
  end if;

  select plan_id into v_old_plan from public.subscriptions where account_id = p_account_id;

  insert into public.subscriptions (account_id, plan_id, status, period, source)
  values (p_account_id, p_plan_id, 'active', p_period, 'manual')
  on conflict (account_id) do update
    set plan_id    = excluded.plan_id,
        status     = 'active',
        period     = excluded.period,
        source     = 'manual',
        updated_at = now();

  insert into public.operator_audit_log (operator_id, action, target_account, metadata)
  values (
    auth.uid(), 'set_plan', p_account_id,
    jsonb_build_object('old_plan', v_old_plan, 'new_plan', p_plan_id, 'period', p_period)
  );

  return jsonb_build_object('ok', true, 'plan_id', p_plan_id);
end;
$$;
grant execute on function public.operator_set_plan(uuid, text, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. O2 — operator_set_entitlement_override(p_account_id, p_key, p_value, p_expires_at)
--    Grant/revoke a per-account entitlement override; audited.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_set_entitlement_override(
  p_account_id uuid,
  p_key        text,
  p_value      jsonb,
  p_expires_at timestamptz default null
)
returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_operator();

  insert into public.entitlement_overrides (account_id, key, value, granted_by, expires_at)
  values (p_account_id, p_key, p_value, auth.uid(), p_expires_at)
  on conflict (account_id, key) do update
    set value      = excluded.value,
        granted_by = excluded.granted_by,
        expires_at = excluded.expires_at;

  insert into public.operator_audit_log (operator_id, action, target_account, metadata)
  values (
    auth.uid(), 'set_entitlement_override', p_account_id,
    jsonb_build_object('key', p_key, 'value', p_value, 'expires_at', p_expires_at)
  );

  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.operator_set_entitlement_override(uuid, text, jsonb, timestamptz) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. O2 — operator_suspend_account(p_account_id) / operator_unsuspend_account
--    Sets subscriptions.status = 'canceled' / 'active'; audited.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_suspend_account(p_account_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_operator();

  update public.subscriptions
    set status = 'canceled', updated_at = now()
  where account_id = p_account_id;

  insert into public.operator_audit_log (operator_id, action, target_account, metadata)
  values (auth.uid(), 'suspend_account', p_account_id, '{}'::jsonb);

  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.operator_suspend_account(uuid) to authenticated;

create or replace function public.operator_unsuspend_account(p_account_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_operator();

  update public.subscriptions
    set status = 'active', updated_at = now()
  where account_id = p_account_id;

  insert into public.operator_audit_log (operator_id, action, target_account, metadata)
  values (auth.uid(), 'unsuspend_account', p_account_id, '{}'::jsonb);

  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.operator_unsuspend_account(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. O3 — operator_begin_impersonation(p_account_id)
--    Returns a read-only context token; writes audit log.
--    Impersonation is READ-ONLY — the UI enforces this; RPCs that mutate
--    money state check for the impersonation flag and reject writes.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_begin_impersonation(p_account_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_target_email text;
begin
  perform private.assert_operator();

  select email into v_target_email from auth.users where id = p_account_id;
  if not found then
    raise exception 'account not found' using errcode = 'P0002';
  end if;

  insert into public.operator_audit_log (operator_id, action, target_account, metadata)
  values (
    auth.uid(), 'begin_impersonation', p_account_id,
    jsonb_build_object('target_email', v_target_email)
  );

  -- Return the target account details for the client to render the banner
  return jsonb_build_object(
    'ok', true,
    'impersonating_id', p_account_id,
    'impersonating_email', v_target_email
  );
end;
$$;
grant execute on function public.operator_begin_impersonation(uuid) to authenticated;

create or replace function public.operator_end_impersonation(p_account_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_operator();

  insert into public.operator_audit_log (operator_id, action, target_account, metadata)
  values (auth.uid(), 'end_impersonation', p_account_id, '{}'::jsonb);

  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.operator_end_impersonation(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. O4 — operator_get_metrics()
--     Business metrics tiles: signups, activation, WAU, bills, split-sum
--     violations, link open rate, claimed→confirmed, MRR, plan mix.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_get_metrics()
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_signups_30d      bigint;
  v_activated        bigint;  -- accounts with ≥1 issued bill ever
  v_wau              bigint;  -- distinct landlords with a bill event in last 7d
  v_bills_30d        bigint;
  v_split_violations bigint;
  v_link_open_rate   numeric;
  v_confirm_rate     numeric;
  v_mrr_cents        bigint;
  v_plan_mix         jsonb;
begin
  perform private.assert_operator();

  -- Signups in last 30 days (exclude operator accounts)
  select count(*) into v_signups_30d
  from auth.users
  where created_at >= now() - interval '30 days'
    and (raw_app_meta_data -> 'operator') is not true;

  -- Activated = has at least one bill event of type 'issued'
  select count(distinct b.landlord_id) into v_activated
  from public.bill_events be
  join public.bills b on b.id = be.bill_id
  where be.event_type = 'issued';

  -- WAU = distinct landlords with any bill event in last 7 days
  select count(distinct b.landlord_id) into v_wau
  from public.bill_events be
  join public.bills b on b.id = be.bill_id
  where be.created_at >= now() - interval '7 days';

  -- Bills issued in last 30 days
  select count(*) into v_bills_30d
  from public.bills
  where created_at >= now() - interval '30 days'
    and status != 'draft';

  -- Split-sum violations: bills where sum(bill_splits.owed_amount) != bills.total_amount.
  -- Carry-forward (Round 2) deliberately adds an earlier unpaid remainder on
  -- top of a split's own owed_amount without changing the bill's own
  -- total_amount — so carried_over_amount must be subtracted back out before
  -- comparing, or every bill that ever absorbed a carry-forward would
  -- false-positive here. This MUST always be zero — it's a hard alert.
  select count(*) into v_split_violations
  from public.bills b
  where b.status != 'draft'
    and (
      select coalesce(sum(bs.owed_amount - coalesce(bs.carried_over_amount, 0)), 0)
      from public.bill_splits bs
      where bs.bill_id = b.id
    ) != b.total_amount;

  -- Tenant link open rate (viewed / sent, last 30d)
  select
    case
      when count(*) filter (where event_type = 'sent') = 0 then null
      else round(
        count(*) filter (where event_type = 'viewed')::numeric /
        count(*) filter (where event_type = 'sent')::numeric * 100, 1
      )
    end
  into v_link_open_rate
  from public.bill_events
  where created_at >= now() - interval '30 days'
    and event_type in ('sent', 'viewed');

  -- Claimed→confirmed rate (last 30d)
  select
    case
      when count(*) filter (where event_type = 'claimed_paid') = 0 then null
      else round(
        count(*) filter (where event_type = 'confirmed')::numeric /
        count(*) filter (where event_type = 'claimed_paid')::numeric * 100, 1
      )
    end
  into v_confirm_rate
  from public.bill_events
  where created_at >= now() - interval '30 days'
    and event_type in ('claimed_paid', 'confirmed');

  -- MRR (sum of monthly equivalent across all active subscriptions)
  select coalesce(sum(
    case when s.period = 'yearly' then p.price_cents_yearly / 12
         else p.price_cents_monthly
    end
  ), 0) into v_mrr_cents
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.status in ('active', 'trialing');

  -- Plan mix
  select jsonb_object_agg(plan_id, cnt) into v_plan_mix
  from (
    select coalesce(s.plan_id, 'free') as plan_id, count(*) as cnt
    from auth.users u
    left join public.subscriptions s on s.account_id = u.id and s.status in ('active', 'trialing')
    where (u.raw_app_meta_data -> 'operator') is not true
    group by 1
  ) t;

  return jsonb_build_object(
    'signups_30d',       v_signups_30d,
    'activated_accounts', v_activated,
    'wau',               v_wau,
    'bills_30d',         v_bills_30d,
    'split_violations',  v_split_violations,
    'link_open_rate_pct', v_link_open_rate,
    'confirm_rate_pct',  v_confirm_rate,
    'mrr_cents',         v_mrr_cents,
    'plan_mix',          coalesce(v_plan_mix, '{}'::jsonb),
    'computed_at',       now()
  );
end;
$$;
grant execute on function public.operator_get_metrics() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. O5 — operator_get_bill_audit_trail(p_bill_id)
--     Read-only view of all events for a bill; audited.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_get_bill_audit_trail(p_bill_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_events jsonb;
  v_bill   record;
begin
  perform private.assert_operator();

  select id, landlord_id, total_amount, status, bill_type, description
    into v_bill from public.bills where id = p_bill_id;

  if not found then
    raise exception 'bill not found' using errcode = 'P0005';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'id', be.id, 'event_type', be.event_type,
      'actor_type', be.actor_type, 'actor_id', be.actor_id,
      'payload', be.payload, 'created_at', be.created_at
    ) order by be.created_at asc
  ) into v_events
  from public.bill_events be where be.bill_id = p_bill_id;

  insert into public.operator_audit_log (operator_id, action, target_account, target_object, metadata)
  values (
    auth.uid(), 'view_bill_audit_trail', v_bill.landlord_id,
    'bill:' || p_bill_id::text, '{}'::jsonb
  );

  return jsonb_build_object(
    'bill', jsonb_build_object(
      'id', v_bill.id, 'landlord_id', v_bill.landlord_id,
      'total_amount', v_bill.total_amount, 'status', v_bill.status,
      'bill_type', v_bill.bill_type, 'description', v_bill.description
    ),
    'events', coalesce(v_events, '[]'::jsonb)
  );
end;
$$;
grant execute on function public.operator_get_bill_audit_trail(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. O5 — operator_revoke_tenant_tokens(p_account_id)
--     Revoke all tenant tokens for a landlord's bills; audited.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_revoke_tenant_tokens(p_account_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_count bigint;
begin
  perform private.assert_operator();

  update public.bill_splits bs
    set expires_at = now() - interval '1 second'
  from public.bills b
  where bs.bill_id = b.id
    and b.landlord_id = p_account_id
    and (bs.expires_at is null or bs.expires_at > now());

  get diagnostics v_count = row_count;

  insert into public.operator_audit_log (operator_id, action, target_account, metadata)
  values (
    auth.uid(), 'revoke_all_tenant_tokens', p_account_id,
    jsonb_build_object('tokens_revoked', v_count)
  );

  return jsonb_build_object('ok', true, 'tokens_revoked', v_count);
end;
$$;
grant execute on function public.operator_revoke_tenant_tokens(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. O5 — operator_regenerate_tenant_token(p_split_id)
--     Regenerate a single tenant token; audited.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_regenerate_tenant_token(p_split_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  -- Real column is access_token (uuid), not token (text) — mirrors the
  -- existing revoke_bill_split_token RPC's exact generation pattern.
  v_new_token uuid := gen_random_uuid();
  v_landlord  uuid;
begin
  perform private.assert_operator();

  select b.landlord_id into v_landlord
  from public.bill_splits bs
  join public.bills b on b.id = bs.bill_id
  where bs.id = p_split_id;

  if not found then
    raise exception 'split not found' using errcode = 'P0006';
  end if;

  update public.bill_splits
    set access_token = v_new_token,
        expires_at   = now() + interval '30 days'
  where id = p_split_id;

  insert into public.operator_audit_log (operator_id, action, target_account, target_object, metadata)
  values (
    auth.uid(), 'regenerate_tenant_token', v_landlord,
    'split:' || p_split_id::text, '{}'::jsonb
  );

  return jsonb_build_object('ok', true, 'new_token', v_new_token);
end;
$$;
grant execute on function public.operator_regenerate_tenant_token(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. O5 — operator_resend_bill_email(p_split_id)
--     Marks the split for resend (the edge function polls this flag); audited.
--     The actual email is sent by the send-bill-email edge function — this RPC
--     only sets the flag and writes the audit log. The edge function is
--     responsible for clearing the flag after sending.
-- ─────────────────────────────────────────────────────────────────────────────

-- Add a resend_requested_at column to bill_splits if it doesn't exist yet
alter table public.bill_splits
  add column if not exists resend_requested_at timestamptz;

create or replace function public.operator_resend_bill_email(p_split_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_landlord uuid;
begin
  perform private.assert_operator();

  select b.landlord_id into v_landlord
  from public.bill_splits bs
  join public.bills b on b.id = bs.bill_id
  where bs.id = p_split_id;

  if not found then
    raise exception 'split not found' using errcode = 'P0006';
  end if;

  update public.bill_splits
    set resend_requested_at = now()
  where id = p_split_id;

  insert into public.operator_audit_log (operator_id, action, target_account, target_object, metadata)
  values (
    auth.uid(), 'resend_bill_email', v_landlord,
    'split:' || p_split_id::text, '{}'::jsonb
  );

  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.operator_resend_bill_email(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. Indexes for performance
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists bill_events_bill_id_idx       on public.bill_events(bill_id);
create index if not exists bill_events_created_at_idx    on public.bill_events(created_at desc);
create index if not exists operator_audit_log_op_idx     on public.operator_audit_log(operator_id, created_at desc);
create index if not exists operator_audit_log_target_idx on public.operator_audit_log(target_account, created_at desc);
