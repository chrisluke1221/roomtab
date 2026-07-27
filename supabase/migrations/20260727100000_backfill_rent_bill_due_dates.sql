-- Every auto-generated rent bill was inserted with due_date = null (see
-- generateDueRentBillsInner, src/contexts/PropertyContext.js), which meant
-- it could never be flagged overdue or trigger a reminder — effectiveStatus
-- (src/lib/paymentStatus.js) can't derive "overdue" without a real due_date.
-- New auto-generated rent bills now get due_date = billing_period_end at
-- creation time (same PR); this is the one-time backfill for existing rows
-- so they aren't permanently stuck with no due date. Applies to every rent
-- bill with a null due_date, including any manually created via "Generate
-- for a custom period" with the due-date field left blank — a rent bill
-- with no due date can never become overdue or trigger a reminder either
-- way, so treating both cases the same is intentional here. Only ever
-- writes into a currently-null field; never overwrites an explicit date.
-- Utility bills are untouched (bill_type = 'rent' filter).
update public.bills
set due_date = billing_period_end
where bill_type = 'rent'
  and due_date is null;
