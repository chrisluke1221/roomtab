#!/usr/bin/env node
/**
 * scripts/seed.js — Phase B development seed
 *
 * Creates a deterministic, repeatable dataset for testing the operator plane:
 *   • 1 operator account (app_metadata.operator = true)
 *   • 2 landlord accounts (alice@seed.dev, bob@seed.dev)
 *   • 3 properties (2 for Alice, 1 for Bob)
 *   • 8 tenants across the 3 properties
 *   • 8 bills (mix of electricity, water, internet, rent)
 *   • 1 rent-rate change mid-tenancy (tests the rate-correction guard)
 *   • 1 reissue scenario (tenant added after bill was sent)
 *   • bill_events rows for every lifecycle step
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/seed.js
 *
 * The script is idempotent: it deletes any existing seed data (identified by
 * the SEED_TAG in the property name) before re-inserting, so you can run it
 * multiple times safely.
 *
 * Requirements:
 *   npm install @supabase/supabase-js dotenv   (already in dependencies)
 */

'use strict';

// Load .env.local if present (never commit real keys)
try { require('dotenv').config({ path: '.env.local' }); } catch (_) {}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '\n❌  Missing env vars.\n' +
    '    Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running.\n'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_TAG = '[seed]';

// ─── date helpers ─────────────────────────────────────────────────────────────

const today = new Date();
const fmt = (d) => d.toISOString().slice(0, 10);

const monthStart = (offset = 0) => {
  const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  return fmt(d);
};
const monthEnd = (offset = 0) => {
  const d = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
  return fmt(d);
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const rpc = async (fn, args = {}) => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(`RPC ${fn}: ${error.message}`);
  return data;
};

const insert = async (table, rows, { upsert = false } = {}) => {
  const q = upsert
    ? supabase.from(table).upsert(rows, { onConflict: 'id' }).select()
    : supabase.from(table).insert(rows).select();
  const { data, error } = await q;
  if (error) throw new Error(`insert ${table}: ${error.message}`);
  return data;
};

const del = async (table, column, values) => {
  if (!values.length) return;
  const { error } = await supabase.from(table).delete().in(column, values);
  if (error) throw new Error(`delete ${table}: ${error.message}`);
};

// ─── upsert auth user (service-role) ─────────────────────────────────────────

const upsertUser = async ({ email, password = 'Seed1234!', appMeta = {}, userMeta = {} }) => {
  // List existing users and find by email
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;
  const existing = users.find((u) => u.email === email);

  if (existing) {
    // Update app_metadata if needed
    if (Object.keys(appMeta).length) {
      const { error } = await supabase.auth.admin.updateUserById(existing.id, {
        app_metadata: { ...existing.app_metadata, ...appMeta },
      });
      if (error) throw error;
    }
    return existing;
  }

  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: appMeta,
    user_metadata: userMeta,
  });
  if (error) throw error;
  return user;
};

// ─── cleanup ──────────────────────────────────────────────────────────────────

const cleanup = async (landlordIds) => {
  if (!landlordIds.length) return;
  console.log('  Cleaning up existing seed data…');

  // bill_events → bill_splits → bills → tenants → rent_rates → properties
  const { data: props } = await supabase
    .from('properties').select('id').in('landlord_id', landlordIds);
  const propIds = (props || []).map((p) => p.id);

  const { data: bills } = propIds.length
    ? await supabase.from('bills').select('id').in('property_id', propIds)
    : { data: [] };
  const billIds = (bills || []).map((b) => b.id);

  if (billIds.length) {
    await del('bill_events', 'bill_id', billIds);
    await del('bill_splits', 'bill_id', billIds);
    await del('bills', 'id', billIds);
  }
  if (propIds.length) {
    await del('rent_rates', 'landlord_id', landlordIds);
    await del('tenants', 'property_id', propIds);
    await del('properties', 'id', propIds);
  }
};

// ─── main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱  Settleroo Phase B seed\n');

  // 1. Users
  console.log('1/6  Creating users…');
  const operator = await upsertUser({
    email: 'operator@seed.dev',
    userMeta: { full_name: 'Seed Operator' },
    appMeta: { operator: true },
  });
  const alice = await upsertUser({
    email: 'alice@seed.dev',
    userMeta: { full_name: 'Alice Landlord' },
  });
  const bob = await upsertUser({
    email: 'bob@seed.dev',
    userMeta: { full_name: 'Bob Landlord' },
  });
  console.log(`   operator: ${operator.id}`);
  console.log(`   alice:    ${alice.id}`);
  console.log(`   bob:      ${bob.id}`);

  // 2. Cleanup
  console.log('2/6  Cleanup…');
  await cleanup([alice.id, bob.id]);

  // 3. Properties
  console.log('3/6  Creating properties…');
  const [aliceProp1, aliceProp2, bobProp1] = await insert('properties', [
    { name: `${SEED_TAG} Alice — Fitzroy House`, address: '10 Smith St, Fitzroy VIC 3065', landlord_id: alice.id },
    { name: `${SEED_TAG} Alice — Carlton Flat`, address: '5 Lygon St, Carlton VIC 3053', landlord_id: alice.id },
    { name: `${SEED_TAG} Bob — Collingwood Studio`, address: '22 Johnston St, Collingwood VIC 3066', landlord_id: bob.id },
  ]);
  console.log(`   ${aliceProp1.name}`);
  console.log(`   ${aliceProp2.name}`);
  console.log(`   ${bobProp1.name}`);

  // 4. Tenants
  console.log('4/6  Creating tenants…');
  const [t1, t2, t3, t4, t5, t6, t7, t8] = await insert('tenants', [
    // Alice prop 1 — 3 tenants, one moved in mid-month
    {
      property_id: aliceProp1.id, landlord_id: alice.id,
      name: 'Tenant A1', email: 'a1@seed.dev', room: 'Room 1',
      move_in_date: monthStart(-2), status: 'active', number_of_occupants: 1,
    },
    {
      property_id: aliceProp1.id, landlord_id: alice.id,
      name: 'Tenant A2', email: 'a2@seed.dev', room: 'Room 2',
      move_in_date: monthStart(-2), status: 'active', number_of_occupants: 2,
    },
    {
      property_id: aliceProp1.id, landlord_id: alice.id,
      name: 'Tenant A3 (mid-month)', email: 'a3@seed.dev', room: 'Room 3',
      // Moved in on the 15th — tests occupancy-day proration
      move_in_date: fmt(new Date(today.getFullYear(), today.getMonth() - 1, 15)),
      status: 'active', number_of_occupants: 1,
    },
    // Alice prop 2 — 2 tenants
    {
      property_id: aliceProp2.id, landlord_id: alice.id,
      name: 'Tenant B1', email: 'b1@seed.dev', room: 'Room 1',
      move_in_date: monthStart(-3), status: 'active', number_of_occupants: 1,
    },
    {
      property_id: aliceProp2.id, landlord_id: alice.id,
      name: 'Tenant B2', email: 'b2@seed.dev', room: 'Room 2',
      move_in_date: monthStart(-3), status: 'active', number_of_occupants: 1,
    },
    // Bob prop 1 — 3 tenants, one moved out last month
    {
      property_id: bobProp1.id, landlord_id: bob.id,
      name: 'Tenant C1', email: 'c1@seed.dev', room: 'Room 1',
      move_in_date: monthStart(-4), status: 'active', number_of_occupants: 1,
    },
    {
      property_id: bobProp1.id, landlord_id: bob.id,
      name: 'Tenant C2', email: 'c2@seed.dev', room: 'Room 2',
      move_in_date: monthStart(-4), status: 'active', number_of_occupants: 1,
    },
    {
      property_id: bobProp1.id, landlord_id: bob.id,
      name: 'Tenant C3 (moved out)', email: 'c3@seed.dev', room: 'Room 3',
      move_in_date: monthStart(-4),
      move_out_date: monthEnd(-1),
      status: 'former', number_of_occupants: 1,
    },
  ]);

  // 5. Rent rates
  console.log('5/6  Creating rent rates…');
  // Alice prop 1 — T1 has a rate change mid-history (tests rate-correction guard)
  await insert('rent_rates', [
    // T1: original rate, then a corrected rate
    {
      tenant_id: t1.id, landlord_id: alice.id,
      amount_cents: 180000, frequency: 'monthly',
      effective_from: monthStart(-3), effective_to: monthEnd(-2),
    },
    {
      tenant_id: t1.id, landlord_id: alice.id,
      amount_cents: 190000, frequency: 'monthly',
      effective_from: monthStart(-1),
    },
    { tenant_id: t2.id, landlord_id: alice.id, amount_cents: 160000, frequency: 'monthly', effective_from: monthStart(-2) },
    { tenant_id: t3.id, landlord_id: alice.id, amount_cents: 150000, frequency: 'monthly', effective_from: fmt(new Date(today.getFullYear(), today.getMonth() - 1, 15)) },
    // Alice prop 2
    { tenant_id: t4.id, landlord_id: alice.id, amount_cents: 140000, frequency: 'monthly', effective_from: monthStart(-3) },
    { tenant_id: t5.id, landlord_id: alice.id, amount_cents: 140000, frequency: 'monthly', effective_from: monthStart(-3) },
    // Bob prop 1
    { tenant_id: t6.id, landlord_id: bob.id, amount_cents: 120000, frequency: 'monthly', effective_from: monthStart(-4) },
    { tenant_id: t7.id, landlord_id: bob.id, amount_cents: 120000, frequency: 'monthly', effective_from: monthStart(-4) },
    { tenant_id: t8.id, landlord_id: bob.id, amount_cents: 110000, frequency: 'monthly', effective_from: monthStart(-4), effective_to: monthEnd(-1) },
  ]);

  // 6. Bills + bill_events
  console.log('6/6  Creating bills and events…');

  // Helper: insert a bill + splits + events
  const createBill = async ({ property_id, landlord_id, bill_type, total_amount, period_start, period_end, description = null, splits, status = 'pending', locked_at = null }) => {
    const [bill] = await insert('bills', [{
      property_id, landlord_id, bill_type, total_amount,
      billing_period_start: period_start, billing_period_end: period_end,
      description, locked_at,
    }]);

    const splitRows = splits.map((s) => ({
      bill_id: bill.id, landlord_id,
      tenant_id: s.tenant_id, tenant_name: s.tenant_name,
      room: s.room, number_of_occupants: s.number_of_occupants || 1,
      occupancy_days: s.occupancy_days, person_days: s.person_days || s.occupancy_days,
      percentage: s.percentage, owed_amount: s.owed_amount,
      occupancy_start: period_start, occupancy_end: period_end,
      status: s.status || 'pending',
      paid_at: s.status === 'paid' ? new Date().toISOString() : null,
    }));
    const insertedSplits = await insert('bill_splits', splitRows);

    // issued event
    await insert('bill_events', [{
      bill_id: bill.id, event_type: 'issued',
      actor_type: 'landlord', actor_id: landlord_id,
      payload: { bill_type, total_amount, period_start, period_end },
    }]);

    return { bill, splits: insertedSplits };
  };

  // Bill 1 — Alice prop 1, electricity, last month, all 3 tenants, one paid
  const { bill: b1, splits: b1s } = await createBill({
    property_id: aliceProp1.id, landlord_id: alice.id,
    bill_type: 'electricity', total_amount: 210,
    period_start: monthStart(-1), period_end: monthEnd(-1),
    locked_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    splits: [
      { tenant_id: t1.id, tenant_name: t1.name, room: t1.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 35, owed_amount: 73.50 },
      { tenant_id: t2.id, tenant_name: t2.name, room: t2.room, number_of_occupants: 2, occupancy_days: 31, person_days: 62, percentage: 42, owed_amount: 88.20, status: 'paid' },
      { tenant_id: t3.id, tenant_name: t3.name, room: t3.room, number_of_occupants: 1, occupancy_days: 17, person_days: 17, percentage: 23, owed_amount: 48.30 },
    ],
  });
  // sent + viewed events for t1's split
  await insert('bill_events', [
    { bill_id: b1.id, event_type: 'sent', actor_type: 'landlord', actor_id: alice.id, payload: { split_id: b1s[0].id } },
    { bill_id: b1.id, event_type: 'viewed', actor_type: 'tenant', actor_id: null, payload: { split_id: b1s[0].id } },
    { bill_id: b1.id, event_type: 'confirmed', actor_type: 'landlord', actor_id: alice.id, payload: { split_id: b1s[1].id, amount_paid: 88.20 } },
  ]);

  // Bill 2 — Alice prop 1, internet (flat split), last month
  await createBill({
    property_id: aliceProp1.id, landlord_id: alice.id,
    bill_type: 'internet', total_amount: 90,
    period_start: monthStart(-1), period_end: monthEnd(-1),
    splits: [
      { tenant_id: t1.id, tenant_name: t1.name, room: t1.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 33.33, owed_amount: 30 },
      { tenant_id: t2.id, tenant_name: t2.name, room: t2.room, number_of_occupants: 2, occupancy_days: 31, person_days: 31, percentage: 33.33, owed_amount: 30 },
      { tenant_id: t3.id, tenant_name: t3.name, room: t3.room, number_of_occupants: 1, occupancy_days: 17, person_days: 17, percentage: 33.34, owed_amount: 30 },
    ],
  });

  // Bill 3 — Alice prop 1, water, 2 months ago
  await createBill({
    property_id: aliceProp1.id, landlord_id: alice.id,
    bill_type: 'water', total_amount: 155,
    period_start: monthStart(-2), period_end: monthEnd(-2),
    splits: [
      { tenant_id: t1.id, tenant_name: t1.name, room: t1.room, number_of_occupants: 1, occupancy_days: 30, person_days: 30, percentage: 50, owed_amount: 77.50, status: 'paid' },
      { tenant_id: t2.id, tenant_name: t2.name, room: t2.room, number_of_occupants: 2, occupancy_days: 30, person_days: 60, percentage: 50, owed_amount: 77.50, status: 'paid' },
    ],
  });

  // Bill 4 — Alice prop 2, electricity, last month
  await createBill({
    property_id: aliceProp2.id, landlord_id: alice.id,
    bill_type: 'electricity', total_amount: 130,
    period_start: monthStart(-1), period_end: monthEnd(-1),
    splits: [
      { tenant_id: t4.id, tenant_name: t4.name, room: t4.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 50, owed_amount: 65 },
      { tenant_id: t5.id, tenant_name: t5.name, room: t5.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 50, owed_amount: 65 },
    ],
  });

  // Bill 5 — Bob prop 1, electricity, last month (3 tenants, one moved out)
  await createBill({
    property_id: bobProp1.id, landlord_id: bob.id,
    bill_type: 'electricity', total_amount: 180,
    period_start: monthStart(-1), period_end: monthEnd(-1),
    locked_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    splits: [
      { tenant_id: t6.id, tenant_name: t6.name, room: t6.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 40, owed_amount: 72 },
      { tenant_id: t7.id, tenant_name: t7.name, room: t7.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 40, owed_amount: 72 },
      { tenant_id: t8.id, tenant_name: t8.name, room: t8.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 20, owed_amount: 36, status: 'paid' },
    ],
  });

  // Bill 6 — Bob prop 1, internet (flat split), last month
  await createBill({
    property_id: bobProp1.id, landlord_id: bob.id,
    bill_type: 'internet', total_amount: 60,
    period_start: monthStart(-1), period_end: monthEnd(-1),
    splits: [
      { tenant_id: t6.id, tenant_name: t6.name, room: t6.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 33.33, owed_amount: 20 },
      { tenant_id: t7.id, tenant_name: t7.name, room: t7.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 33.33, owed_amount: 20 },
      { tenant_id: t8.id, tenant_name: t8.name, room: t8.room, number_of_occupants: 1, occupancy_days: 31, person_days: 31, percentage: 33.34, owed_amount: 20 },
    ],
  });

  // Bill 7 — Bob prop 1, other (custom description), 2 months ago
  await createBill({
    property_id: bobProp1.id, landlord_id: bob.id,
    bill_type: 'other', total_amount: 45,
    description: 'Shared cleaning supplies',
    period_start: monthStart(-2), period_end: monthEnd(-2),
    splits: [
      { tenant_id: t6.id, tenant_name: t6.name, room: t6.room, number_of_occupants: 1, occupancy_days: 30, person_days: 30, percentage: 33.33, owed_amount: 15, status: 'paid' },
      { tenant_id: t7.id, tenant_name: t7.name, room: t7.room, number_of_occupants: 1, occupancy_days: 30, person_days: 30, percentage: 33.33, owed_amount: 15, status: 'paid' },
      { tenant_id: t8.id, tenant_name: t8.name, room: t8.room, number_of_occupants: 1, occupancy_days: 30, person_days: 30, percentage: 33.34, owed_amount: 15, status: 'paid' },
    ],
  });

  // Bill 8 — Alice prop 1, needs_reissue scenario
  // Simulates: bill was sent, then a new tenant was added → needs_reissue = true
  const [reissueBill] = await insert('bills', [{
    property_id: aliceProp1.id, landlord_id: alice.id,
    bill_type: 'gas', total_amount: 95,
    billing_period_start: monthStart(0), billing_period_end: monthEnd(0),
    locked_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    needs_reissue: true,
  }]);
  await insert('bill_splits', [
    {
      bill_id: reissueBill.id, landlord_id: alice.id,
      tenant_id: t1.id, tenant_name: t1.name, room: t1.room, number_of_occupants: 1,
      occupancy_days: 31, person_days: 31, percentage: 50, owed_amount: 47.50,
      occupancy_start: monthStart(0), occupancy_end: monthEnd(0),
    },
    {
      bill_id: reissueBill.id, landlord_id: alice.id,
      tenant_id: t2.id, tenant_name: t2.name, room: t2.room, number_of_occupants: 2,
      occupancy_days: 31, person_days: 31, percentage: 50, owed_amount: 47.50,
      occupancy_start: monthStart(0), occupancy_end: monthEnd(0),
    },
  ]);
  await insert('bill_events', [
    { bill_id: reissueBill.id, event_type: 'issued', actor_type: 'landlord', actor_id: alice.id, payload: { bill_type: 'gas', total_amount: 95 } },
    { bill_id: reissueBill.id, event_type: 'sent', actor_type: 'landlord', actor_id: alice.id, payload: { note: 'sent before t3 was added' } },
    { bill_id: reissueBill.id, event_type: 'reissued', actor_type: 'system', actor_id: null, payload: { reason: 'roster_change', new_tenant_id: t3.id } },
  ]);

  console.log('\n✅  Seed complete.\n');
  console.log('   Accounts:');
  console.log(`   • operator@seed.dev  (password: Seed1234!)  — app_metadata.operator = true`);
  console.log(`   • alice@seed.dev     (password: Seed1234!)  — 2 properties, 5 tenants`);
  console.log(`   • bob@seed.dev       (password: Seed1234!)  — 1 property, 3 tenants`);
  console.log('\n   Sign in as operator@seed.dev and navigate to /operator to test the console.\n');
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
