import React, { useState } from 'react';
import { ExternalLink, Copy, ShieldOff, CheckCircle2, RotateCcw, Mail, MailCheck, AlertTriangle } from 'lucide-react';
import Money from './Money';

// Fast, CSS-only tooltip — replaces the native title= attribute, whose
// browser-default hover delay (~1-1.5s+) reads as sluggish on icon-only
// buttons. group-hover + a short delay/duration keeps it snappy.
const Tip = ({ label, children }) => (
  <span className="relative inline-flex group">
    {children}
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-secondary-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-100 delay-100 group-hover:opacity-100 z-10">
      {label}
    </span>
  </span>
);

// CHR-26: Inline confirmation prompt shown when the landlord tries to send a
// bill email with no attachment. It's a warning, not a hard block — the
// landlord can proceed anyway (some bills are verbal/digital-only).
const NoAttachmentWarning = ({ onConfirm, onCancel }) => (
  <div className="flex items-start space-x-2 bg-warning-50 border border-warning-100 rounded-lg px-3 py-2 text-xs text-secondary-800 max-w-xs">
    <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="font-medium mb-1">No attachment added</p>
      <p className="text-secondary-600 mb-2">
        Tenants usually expect a copy of the bill. Send anyway?
      </p>
      <div className="flex space-x-2">
        <button
          onClick={onConfirm}
          className="px-2 py-1 bg-warning-600 text-white rounded text-xs hover:bg-warning-700"
        >
          Send anyway
        </button>
        <button
          onClick={onCancel}
          className="px-2 py-1 bg-white border border-warning-100 text-secondary-700 rounded text-xs hover:bg-secondary-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// Round 2: inline amount-entry chip for recording a full or partial payment
// — replaces the old instant one-click "mark as paid" toggle, since a
// landlord now needs to say *how much* was paid, not just paid-or-not.
// Follows the design system's inline-edit-chip spec (docs/design-system.md).
const PaymentChip = ({ split, onSave, onCancel }) => {
  const remaining = Number(split.owed_amount) - Number(split.amount_paid || 0);
  const [amount, setAmount] = useState(String(Number(split.amount_paid || 0) > 0 ? split.amount_paid : remaining));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed < 0) {
      setError('Enter a valid amount');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(parsed);
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError("Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-secondary-50 border border-secondary-200 rounded-lg px-3 py-2">
      <div className="flex items-center space-x-2">
        <label className="text-xs text-secondary-600 whitespace-nowrap">
          Amount paid (of <Money dollars={split.owed_amount} />)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          autoFocus
          className="input-field text-sm py-1 px-2 w-24"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-3 py-1">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onCancel} className="btn-secondary text-xs px-3 py-1">
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  );
};

// Shared by the desktop splits table and the mobile stacked-card layout so
// the five per-split actions aren't duplicated in two places.
// CHR-26: billHasAttachment — whether the parent bill has an uploaded file.
//   If false, clicking Send shows a confirmation prompt before proceeding.
const SplitActions = ({ split, sendingSplitId, onRevoke, onSetStatus, onRecordPayment, onSendEmail, billHasAttachment }) => {
  const [revoking, setRevoking] = useState(false);
  const [revokeFeedback, setRevokeFeedback] = useState(null); // 'success' | 'error' | null
  const [statusPending, setStatusPending] = useState(false);
  const [showPaymentChip, setShowPaymentChip] = useState(false);
  // CHR-26: track whether we're showing the no-attachment confirmation prompt
  const [showNoAttachmentWarning, setShowNoAttachmentWarning] = useState(false);

  const handleRevokeClick = async () => {
    setRevoking(true);
    setRevokeFeedback(null);
    try {
      const didRevoke = await onRevoke(split);
      if (didRevoke !== false) {
        setRevokeFeedback('success');
        setTimeout(() => setRevokeFeedback(null), 2500);
      }
    } catch (err) {
      console.error('Failed to revoke link:', err);
      setRevokeFeedback('error');
      setTimeout(() => setRevokeFeedback(null), 3500);
    } finally {
      setRevoking(false);
    }
  };

  const handleStatusClick = async (nextStatus) => {
    setStatusPending(true);
    try {
      await onSetStatus(split.id, nextStatus);
    } catch (err) {
      console.error('Failed to update bill status:', err);
    } finally {
      setStatusPending(false);
    }
  };

  const handleSavePayment = async (amount) => {
    await onRecordPayment(split.id, amount);
    setShowPaymentChip(false);
  };

  // CHR-26: intercept the send click — if no attachment, show the warning
  // prompt first. If the landlord confirms, proceed with the actual send.
  const handleSendClick = () => {
    if (!billHasAttachment) {
      setShowNoAttachmentWarning(true);
    } else {
      onSendEmail(split);
    }
  };

  const handleConfirmSendAnyway = () => {
    setShowNoAttachmentWarning(false);
    onSendEmail(split);
  };

  const handleCancelSend = () => {
    setShowNoAttachmentWarning(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Tip label="View bill breakdown">
          <a
            href={`/bill/${split.access_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary-400 hover:text-primary-600"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </Tip>
        <Tip label="Copy tenant link">
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/bill/${split.access_token}`)}
            className="text-secondary-400 hover:text-primary-600"
          >
            <Copy className="w-4 h-4" />
          </button>
        </Tip>
        <Tip label="Revoke this link (rotates the token)">
          <button
            onClick={handleRevokeClick}
            disabled={revoking}
            className="text-secondary-400 hover:text-danger-600 disabled:opacity-50"
          >
            <ShieldOff className="w-4 h-4" />
          </button>
        </Tip>
        {revokeFeedback === 'success' && (
          <span className="text-xs text-success-700 whitespace-nowrap">Link revoked</span>
        )}
        {revokeFeedback === 'error' && (
          <span className="text-xs text-danger-600 whitespace-nowrap">Couldn't revoke link</span>
        )}
        {split.status === 'paid' ? (
          <Tip label="Reset to no payment recorded">
            <button
              onClick={() => handleStatusClick('pending')}
              disabled={statusPending}
              className="text-secondary-400 hover:text-secondary-700 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${statusPending ? 'animate-spin' : ''}`} />
            </button>
          </Tip>
        ) : split.carried_forward_into_split_id ? (
          // Round 2: this split's remainder already moved to a later bill —
          // recording more payment against it here would be invisible to the
          // aggregates (which correctly exclude it) and confusing to read.
          <Tip label="Resolved via carry-forward — recorded on the newer bill instead">
            <CheckCircle2 className="w-4 h-4 text-secondary-300" />
          </Tip>
        ) : (
          <Tip label={Number(split.amount_paid || 0) > 0 ? 'Update amount paid' : 'Record payment'}>
            <button
              onClick={() => setShowPaymentChip((v) => !v)}
              className={`w-4 h-4 ${Number(split.amount_paid || 0) > 0 ? 'text-warning-600' : 'text-secondary-400 hover:text-success-600'}`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </Tip>
        )}
        <Tip label={split.email_sent_at ? `Sent ${new Date(split.email_sent_at).toLocaleString()} — click to resend` : 'Send bill email'}>
          <button
            onClick={handleSendClick}
            disabled={sendingSplitId === split.id}
            className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded ${
              split.email_sent_at ? 'text-success-700 hover:bg-success-50' : 'text-primary-600 hover:bg-primary-50'
            } disabled:opacity-50`}
          >
            {split.email_sent_at ? <MailCheck className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            <span>{sendingSplitId === split.id ? 'Sending...' : split.email_sent_at ? 'Sent' : 'Send'}</span>
          </button>
        </Tip>
      </div>
      {/* CHR-26: inline no-attachment warning prompt */}
      {showNoAttachmentWarning && (
        <NoAttachmentWarning
          onConfirm={handleConfirmSendAnyway}
          onCancel={handleCancelSend}
        />
      )}
      {showPaymentChip && (
        <PaymentChip split={split} onSave={handleSavePayment} onCancel={() => setShowPaymentChip(false)} />
      )}
    </div>
  );
};

export default SplitActions;
