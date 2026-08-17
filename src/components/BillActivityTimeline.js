import React, { useEffect, useState } from 'react';
import { Clock, Send, Eye, CheckCircle2, RotateCcw, ShieldOff, KeyRound, Mail, Bell, Wallet, FileText } from 'lucide-react';
import { useProperties } from '../contexts/PropertyContext';

// 2026-08-13: surfaces bill_events (already written on every lifecycle
// transition since Phase B, but never displayed to a landlord anywhere
// before this) as a plain activity list — "did they actually get it, did
// they open it, when did the reminder fire" was previously answerable only
// by reading raw DB rows. Parent controls visibility (mount/unmount), same
// pattern as the existing rate-breakdown expandable row — this component
// just fetches once on mount and renders.
const EVENT_META = {
  issued: { label: 'Bill created', icon: FileText },
  sent: { label: 'Emailed to tenant', icon: Send },
  viewed: { label: 'Tenant viewed the bill', icon: Eye },
  claimed_paid: { label: 'Tenant marked it paid', icon: CheckCircle2 },
  confirmed: { label: 'Marked as paid', icon: CheckCircle2 },
  partial_payment_recorded: { label: 'Partial payment recorded', icon: Wallet },
  reissued: { label: 'Bill reissued', icon: RotateCcw },
  token_revoked: { label: 'Link revoked', icon: ShieldOff },
  token_regenerated: { label: 'Link regenerated', icon: KeyRound },
  email_resent: { label: 'Email resent', icon: Mail },
  reminder_sent: { label: 'Overdue reminder sent', icon: Bell },
};

const describeEvent = (event) => {
  const meta = EVENT_META[event.event_type] || { label: event.event_type, icon: Clock };
  let detail = null;
  if (event.event_type === 'reminder_sent' && event.payload?.stage) {
    detail = `(${event.payload.stage} stage, ${event.payload.days_overdue} days overdue)`;
  }
  return { ...meta, detail };
};

const BillActivityTimeline = ({ billId }) => {
  const { fetchBillEvents } = useProperties();
  const [events, setEvents] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchBillEvents(billId)
      .then((rows) => {
        if (!cancelled) setEvents(rows);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load activity');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId]);

  if (loadError) return <p className="text-xs text-danger-600">{loadError}</p>;
  if (events === null) return <p className="text-xs text-secondary-500">Loading activity...</p>;
  if (events.length === 0) return <p className="text-xs text-secondary-500">No activity recorded yet.</p>;

  return (
    <ul className="space-y-1.5">
      {events.map((event) => {
        const { label, icon: Icon, detail } = describeEvent(event);
        return (
          <li key={event.id} className="flex items-start space-x-2 text-xs text-secondary-600">
            <Icon className="w-3.5 h-3.5 text-secondary-400 flex-shrink-0 mt-0.5" />
            <span>
              {label} {detail && <span className="text-secondary-400">{detail}</span>}
              <span className="text-secondary-400 block">{new Date(event.created_at).toLocaleString()}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default BillActivityTimeline;
