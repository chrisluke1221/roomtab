import React from 'react';
import Money from './Money';

// Round 2: shown under a split's owed amount. When this split absorbed a
// carry-forward remainder from an earlier unpaid bill, spells out the
// breakdown ("$50 this bill + $20 carried over") instead of a single opaque
// total — matches Chris's exact water-bill scenario. Also surfaces how much
// has actually been paid so far on a partially-settled split.
const OwedBreakdown = ({ split }) => {
  const carriedOver = Number(split.carried_over_amount || 0);
  const amountPaid = Number(split.amount_paid || 0);
  if (carriedOver <= 0 && amountPaid <= 0) return null;

  return (
    <div className="text-xs text-secondary-500 mt-0.5">
      {carriedOver > 0 && (
        <p>
          <Money dollars={Number(split.owed_amount) - carriedOver} className="font-normal" /> this bill +{' '}
          <Money dollars={carriedOver} className="font-normal" /> carried over
        </p>
      )}
      {amountPaid > 0 && split.status !== 'paid' && (
        <p>
          <Money dollars={amountPaid} className="font-normal text-success-700" /> paid so far
        </p>
      )}
    </div>
  );
};

export default OwedBreakdown;
