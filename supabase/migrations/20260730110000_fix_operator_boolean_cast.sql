-- Fix: "argument of IS NOT TRUE must be type boolean, not type jsonb"
--
-- Every operator-check this session wrote used `raw_app_meta_data -> 'operator'`
-- (the `->` operator, which returns jsonb) and then either cast it with
-- `::boolean` or compared it directly with `IS [NOT] TRUE`. Postgres has no
-- direct jsonb -> boolean cast; you must extract the value as text first
-- with `->>` (which returns text), then `::boolean` on that text works
-- correctly. Fixes every affected function + the account_notes RLS policy —
-- verified against the live "argument of IS NOT TRUE" error before writing
-- this, and every other line below is copied verbatim from the existing
-- migrations (only the ->'operator' -> ->>'operator' lines changed) so as
-- not to introduce any other behavioural change.

create or replace function private.assert_operator()
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (
    select (raw_app_meta_data ->> 'operator')::boolean
    from auth.users
    where id = auth.uid()
  ) is not true then
    raise exception 'operator access required' using errcode = 'P0001';
  end if;
end;
$$;

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
      'has_property', exists (select 1 from public.properties where landlord_id = u.id),
      'has_issued_bill', exists (select 1 from public.bills where landlord_id = u.id)
    )
    order by u.created_at desc
  )
  into v_result
  from auth.users u
  left join public.subscriptions s on s.account_id = u.id and s.status in ('active', 'trialing')
  left join public.plans p on p.id = s.plan_id
  where (u.raw_app_meta_data ->> 'operator')::boolean is not true;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

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
    and (raw_app_meta_data ->> 'operator')::boolean is not true;

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
    where (u.raw_app_meta_data ->> 'operator')::boolean is not true
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

-- account_notes RLS policy: CREATE POLICY has no OR REPLACE, drop + recreate.
drop policy if exists "Operators can read account notes" on public.account_notes;
create policy "Operators can read account notes"
  on public.account_notes for select
  using ((select (raw_app_meta_data ->> 'operator')::boolean from auth.users where id = auth.uid()) is true);
