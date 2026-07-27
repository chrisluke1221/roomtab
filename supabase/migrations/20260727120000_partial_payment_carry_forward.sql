-- Round 2 (2026-07-27): partial payment tracking + automatic carry-forward.
-- Chris's water-bill scenario: a tenant paid $80 of a $100 electricity/gas
-- bill (owes $20). A new $50/person water bill for the same tenant should
-- show as $70 owed, with an explicit "$50 this bill + $20 carried over"
-- breakdown — not a silent overwrite of either bill's numbers.
--
-- status stays pending/viewed/paid (no constraint change) — "partial" is a
-- derived state (0 < amount_paid < owed_amount), same pattern effectiveStatus
-- (src/lib/paymentStatus.js) already uses for "overdue". Tagging an old
-- split with carried_forward_into_split_id is metadata only — it never
-- touches that split's own owed_amount, so it doesn't violate the "never
-- modify a bill's split after it's been sent" guardrail in CLAUDE.md.
alter table public.bill_splits
  add column if not exists amount_paid numeric not null default 0,
  add column if not exists carried_over_amount numeric not null default 0,
  add column if not exists carried_forward_into_split_id uuid references public.bill_splits(id);

-- Landlord-recorded payment (full or partial) and the reset-to-pending
-- action stay plain RLS-scoped table updates from the client, matching every
-- other landlord-owned-row mutation in this codebase (setBillSplitStatus,
-- updateBill, etc.) — no new RPC needed, since this isn't crossing a
-- security boundary the way the token-based functions below are.

-- Tenant-side "I've paid" self-confirmation now also records the full owed
-- amount as paid, so amount_paid stays consistent with status for the
-- carry-forward remainder calculation below.
create or replace function public.mark_bill_split_paid(p_token uuid)
returns void language sql security definer set search_path = '' as $$
  update public.bill_splits
  set status = 'paid', paid_at = now(), amount_paid = owed_amount
  where access_token = p_token;
$$;

-- Extend the tenant-facing token lookup with amount_paid/carried_over_amount
-- and, when this split absorbed a carried-forward remainder, which bill(s)
-- it came from — so the tenant page can show "$20 carried over from your
-- Electricity/Gas bill (Jul)" instead of a single opaque total.
drop function if exists public.get_bill_split_by_token(uuid);

create function public.get_bill_split_by_token(p_token uuid)
returns table (
  id uuid,
  bill_id uuid,
  tenant_name text,
  room text,
  number_of_occupants int,
  occupancy_days int,
  person_days int,
  percentage numeric,
  owed_amount numeric,
  amount_paid numeric,
  carried_over_amount numeric,
  carry_forward_sources jsonb,
  occupancy_start date,
  occupancy_end date,
  status text,
  viewed_at timestamptz,
  paid_at timestamptz,
  bill_type text,
  total_amount numeric,
  billing_period_start date,
  billing_period_end date,
  due_date date,
  bill_total_person_days bigint,
  bill_tenant_count bigint,
  attachment_path text,
  attachment_name text,
  attachment_type text,
  rate_breakdown jsonb,
  property_name text,
  landlord_name text,
  landlord_email text,
  peer_splits jsonb
)
language sql security definer set search_path = '' as $$
  select bs.id, bs.bill_id, bs.tenant_name, bs.room, bs.number_of_occupants,
    bs.occupancy_days, bs.person_days, bs.percentage, bs.owed_amount,
    bs.amount_paid, bs.carried_over_amount,
    coalesce(sources.carry_forward_sources, '[]'::jsonb),
    bs.occupancy_start, bs.occupancy_end, bs.status, bs.viewed_at, bs.paid_at,
    b.bill_type, b.total_amount, b.billing_period_start, b.billing_period_end, b.due_date,
    totals.total_person_days, totals.tenant_count,
    b.attachment_path, b.attachment_name, b.attachment_type,
    bs.rate_breakdown,
    p.name as property_name,
    coalesce(au.raw_user_meta_data->>'full_name', au.email) as landlord_name,
    au.email as landlord_email,
    peers.peer_splits
  from public.bill_splits bs
  join public.bills b on b.id = bs.bill_id
  join public.properties p on p.id = b.property_id
  join auth.users au on au.id = p.landlord_id
  join (
    select bill_id, sum(person_days) as total_person_days, count(*) as tenant_count
    from public.bill_splits
    group by bill_id
  ) totals on totals.bill_id = bs.bill_id
  join (
    select bill_id,
      jsonb_agg(
        jsonb_build_object(
          'id', s2.id,
          'tenant_name', s2.tenant_name,
          'occupancy_days', s2.occupancy_days,
          'person_days', s2.person_days,
          'percentage', s2.percentage
        )
        order by s2.tenant_name
      ) as peer_splits
    from public.bill_splits s2
    group by bill_id
  ) peers on peers.bill_id = bs.bill_id
  left join (
    select src.carried_forward_into_split_id as split_id,
      jsonb_agg(
        jsonb_build_object(
          'bill_type', src_bill.bill_type,
          'billing_period_start', src_bill.billing_period_start,
          'billing_period_end', src_bill.billing_period_end,
          'amount', src.owed_amount - src.amount_paid
        )
        order by src_bill.billing_period_start
      ) as carry_forward_sources
    from public.bill_splits src
    join public.bills src_bill on src_bill.id = src.bill_id
    where src.carried_forward_into_split_id is not null
    group by src.carried_forward_into_split_id
  ) sources on sources.split_id = bs.id
  where bs.access_token = p_token
    and bs.expires_at > now();
$$;
grant execute on function public.get_bill_split_by_token(uuid) to anon, authenticated;
