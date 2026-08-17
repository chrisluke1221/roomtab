# 2026-08-13 — Inline tenant editing + bill activity timeline

Two of the four items from Chris's live-usage feedback pass (screenshots of
`/dashboard` and a tenant page on settleroo.netlify.app).

## Inline tenant editing (item 2)

Previously, editing a tenant from `TenantDetail.js` (reached via the
Dashboard's "Who owes you" list) linked to
`/properties/:propertyId?tab=tenants` — landing on the property's full
tenant list, requiring the landlord to find this same tenant again and
click Edit a second time. Confirmed via code that this was a genuine extra
hop, not a misreading: `Dashboard.js`'s tenant rows already link straight
to `TenantDetail.js`, but `TenantDetail.js` itself had no edit capability
of its own.

`TenantDetail.js` now has the exact same inline edit form
`PropertyDetail.js`'s tenant list already used (name, room, occupants,
email, phone, move-in/move-out, rent per week, billing cadence), reusing
`updateTenant`/`addRentRate` from `PropertyContext` and the same
"start a new rate from today" confirm flow for a rate change — no new
mutation logic, just moved the existing form to also render here.

## Bill activity timeline (item 3)

Chris's exact words: reminder status/timeline "is not being tracked so I
don't know when you sent it and how it happens." It *was* being tracked —
`bill_events` has written `issued`/`sent`/`viewed`/`claimed_paid`/
`confirmed`/`reminder_sent`/etc. rows since Phase B — just never displayed
anywhere landlord-facing (only the operator plane's audit trail read it).

New `src/components/BillActivityTimeline.js`: fetches and renders a
bill's `bill_events` rows (landlords already have SELECT RLS on their own
bills' events, no new RPC needed — added `fetchBillEvents(billId)` to
`PropertyContext`). A "View activity" toggle sits next to the existing
"View rate breakdown" toggle on every bill split row (`PropertyDetail.js`
and `TenantDetail.js`, desktop + mobile). `reminder_sent` events show the
escalation stage and days-overdue from their `payload`, matching CHR-41's
arrears autopilot work from earlier today.

## Verification
`CI=true npx react-scripts test` — 51/51 passing (no test changes needed,
neither item touches split/money calculation logic). `CI=true npm run
build` — clean. Chris to confirm live: editing a tenant from their detail
page saves in place without navigating away; expanding "View activity" on
a bill split shows its real event history including the arrears-autopilot
test reminder sent earlier today.
