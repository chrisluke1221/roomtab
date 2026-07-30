-- Phase B CRM extras (roadmap items 8-9, the last piece of Phase B):
-- founder notes per account, activation-funnel fields, and the data
-- operator_list_accounts already exposes (churn_risk, properties_count,
-- bills_30d) reframed as a real "needs attention" work-queue on the
-- frontend rather than just a filter checkbox.
--
-- Verified against docs/SCHEMA_REFERENCE.md before writing this — new
-- table follows the same RLS pattern as bill_events/operator_audit_log
-- (SECURITY DEFINER RPCs are the only real access path; the RLS policy
-- below is a defense-in-depth backstop, not the primary gate).

create table public.account_notes (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references auth.users(id) on delete cascade,
  operator_id uuid not null references auth.users(id),
  note        text not null,
  created_at  timestamptz not null default now()
);

alter table public.account_notes enable row level security;

create policy "Operators can read account notes"
  on public.account_notes for select
  using ((select (raw_app_meta_data ->> 'operator')::boolean from auth.users where id = auth.uid()) is true);

-- ─────────────────────────────────────────────────────────────────────────────
-- operator_add_account_note(p_account_id, p_note) — O2, audited
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_add_account_note(p_account_id uuid, p_note text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_note public.account_notes;
begin
  perform private.assert_operator();

  if trim(p_note) = '' then
    raise exception 'note cannot be empty' using errcode = 'P0007';
  end if;

  insert into public.account_notes (account_id, operator_id, note)
  values (p_account_id, auth.uid(), p_note)
  returning * into v_note;

  insert into public.operator_audit_log (operator_id, action, target_account, target_object, metadata)
  values (auth.uid(), 'add_account_note', p_account_id, 'note:' || v_note.id::text, '{}'::jsonb);

  return jsonb_build_object('id', v_note.id, 'note', v_note.note, 'created_at', v_note.created_at);
end;
$$;
grant execute on function public.operator_add_account_note(uuid, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Extend operator_list_accounts: activation-funnel fields per account.
-- Both RPCs return a bare `jsonb` (not `returns table`), so CREATE OR
-- REPLACE can add new object keys without a DROP FUNCTION first.
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
      ),
      -- Activation funnel: has this account added a property, and issued a
      -- first real bill? (roadmap item 9 — "signed up -> added property ->
      -- issued first bill"). Derived from existing data, no new columns.
      'has_property', exists (select 1 from public.properties where landlord_id = u.id),
      'has_issued_bill', exists (select 1 from public.bills where landlord_id = u.id)
    )
    order by u.created_at desc
  )
  into v_result
  from auth.users u
  left join public.subscriptions s on s.account_id = u.id and s.status in ('active', 'trialing')
  left join public.plans p on p.id = s.plan_id
  where (u.raw_app_meta_data ->> 'operator')::boolean is not true;  -- exclude operator accounts

  return coalesce(v_result, '[]'::jsonb);
end;
$$;
grant execute on function public.operator_list_accounts() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Extend operator_get_account_detail: include this account's notes.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.operator_get_account_detail(p_account_id uuid)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user     record;
  v_sub      record;
  v_props    jsonb;
  v_overrides jsonb;
  v_events   jsonb;
  v_notes    jsonb;
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

  select jsonb_agg(
    jsonb_build_object(
      'id', n.id, 'note', n.note, 'created_at', n.created_at,
      'operator_email', ou.email
    ) order by n.created_at desc
  ) into v_notes
  from public.account_notes n
  join auth.users ou on ou.id = n.operator_id
  where n.account_id = p_account_id;

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
    'recent_bill_events', coalesce(v_events, '[]'::jsonb),
    'notes',           coalesce(v_notes, '[]'::jsonb)
  );
end;
$$;
grant execute on function public.operator_get_account_detail(uuid) to authenticated;
