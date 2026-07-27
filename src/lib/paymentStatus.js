import { todayLocal } from './dates';

// Centralized so every payment-state chip (splits table, mobile cards,
// tenant view, dashboard work queue) reads the same colors and labels
// instead of each screen hardcoding its own.
export const STATUS_STYLES = {
  pending: 'bg-secondary-100 text-secondary-600',
  viewed: 'bg-warning-100 text-warning-700',
  partial: 'bg-warning-100 text-warning-700',
  paid: 'bg-success-100 text-success-700',
  overdue: 'bg-danger-100 text-danger-700',
  carried_forward: 'bg-secondary-100 text-secondary-500',
};

export const STATUS_LABELS = {
  pending: 'Pending',
  viewed: 'Viewed',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  carried_forward: 'Carried forward',
};

export const statusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.pending;
export const statusLabel = (status) => STATUS_LABELS[status] || STATUS_LABELS.pending;

// "Overdue", "Partial", and "Carried forward" aren't stored statuses —
// they're derived so they can never drift out of sync with today's date /
// the actual amount paid / whether this split's remainder has already been
// rolled into a later bill. A split is only ever pending, viewed, or paid in
// the database; this is what the UI shows on top of that. Carried-forward
// takes precedence over partial/overdue: once a split's shortfall has moved
// to a new bill, showing it as still "overdue" here would look like an
// unresolved problem that's actually been handled.
export const effectiveStatus = (split, bill) => {
  const status = split.status || 'pending';
  if (status === 'paid') return status;
  if (split.carried_forward_into_split_id) return 'carried_forward';
  if (Number(split.amount_paid || 0) > 0) return 'partial';
  if (bill?.due_date && bill.due_date < todayLocal()) return 'overdue';
  return status;
};

// Round 2: a split whose remainder has already been rolled into a later
// bill shouldn't also be counted as its own separate outstanding balance —
// its money is now represented by the new split's (larger) owed_amount.
// Every "what's outstanding" aggregate (dashboard totals, tenant balances,
// the work queue) must filter through this, not just status !== 'paid'.
export const isOutstanding = (split) => split.status !== 'paid' && !split.carried_forward_into_split_id;
