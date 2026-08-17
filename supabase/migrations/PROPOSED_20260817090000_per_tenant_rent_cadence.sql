-- Per-tenant rent billing cadence (2026-08-17, Chris's explicit call): a
-- tenant on 'weekly' or 'fortnightly' billing now gets their own separately
-- generated bills on that cadence, instead of being folded into the one
-- shared property-wide monthly bill every other tenant gets. 'monthly'
-- tenants are completely unaffected — same shared-bill path as today.
--
-- bills.tenant_id is null for every existing/shared bill (rent or utility)
-- and only ever set on a NEW per-tenant rent bill going forward. It exists
-- purely so bills_unique_rent_period_per_tenant below can dedupe correctly
-- — bills_unique_rent_period (existing) already dedupes the shared path.
--
-- PROPOSED: apply once reviewed. No backfill — every already-generated
-- bill (including ones for currently-weekly/fortnightly tenants) is left
-- exactly as-is; per-tenant generation only ever starts the day *after*
-- the most recent bill that already covers that tenant, so there is no
-- overlap and no gap with existing history.

alter table public.bills
  add column if not exists tenant_id uuid references public.tenants(id) on delete cascade;

comment on column public.bills.tenant_id is
  'Set only for a per-tenant-cadence rent bill (weekly/fortnightly). Null for every shared bill (all utility bills, and monthly-cadence rent bills).';

-- The existing bills_unique_rent_period index only protects the shared
-- path (tenant_id is null) correctly today because every rent bill has
-- tenant_id null. Once per-tenant bills exist, re-scope it explicitly so
-- it keeps meaning "one shared rent bill per property+period" — and add a
-- second index for "one per-tenant rent bill per tenant+period".
drop index if exists public.bills_unique_rent_period;

create unique index bills_unique_rent_period
  on public.bills (property_id, billing_period_start, billing_period_end)
  where bill_type = 'rent' and tenant_id is null;

create unique index bills_unique_rent_period_per_tenant
  on public.bills (tenant_id, billing_period_start, billing_period_end)
  where bill_type = 'rent' and tenant_id is not null;
