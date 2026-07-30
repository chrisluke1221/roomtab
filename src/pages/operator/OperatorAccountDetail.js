import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

// ─── helpers ──────────────────────────────────────────────────────────────────

const relativeDate = (iso) => {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const EVENT_COLORS = {
  issued: 'bg-blue-100 text-blue-700',
  sent: 'bg-indigo-100 text-indigo-700',
  viewed: 'bg-purple-100 text-purple-700',
  claimed_paid: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  reissued: 'bg-orange-100 text-orange-700',
  token_revoked: 'bg-red-100 text-red-700',
  token_regenerated: 'bg-teal-100 text-teal-700',
  email_resent: 'bg-sky-100 text-sky-700',
  partial_payment_recorded: 'bg-lime-100 text-lime-700',
};

const PLAN_OPTIONS = [
  { id: 'free', label: 'Starter (free)' },
  { id: 'pro', label: 'Pro' },
  { id: 'enterprise', label: 'Enterprise' },
];

// ─── ImpersonationBanner ──────────────────────────────────────────────────────

const ImpersonationBanner = ({ account, onEnd }) => (
  <div className="bg-amber-400 text-amber-900 px-4 py-2 flex items-center justify-between text-sm font-medium sticky top-0 z-50">
    <span>
      👁 Viewing as <strong>{account.email}</strong> — read-only mode. No mutations allowed.
    </span>
    <button
      onClick={onEnd}
      className="ml-4 bg-amber-900 text-amber-100 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-amber-800 transition-colors"
    >
      End impersonation
    </button>
  </div>
);

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, onConfirm, onCancel, danger }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
      <h3 className="font-bold text-secondary-900 text-lg">{title}</h3>
      <p className="text-secondary-600 text-sm">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-secondary-200 text-secondary-700 hover:bg-secondary-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-sm rounded-lg font-medium text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'}`}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ─── OperatorAccountDetail ────────────────────────────────────────────────────

export default function OperatorAccountDetail() {
  const { accountId } = useParams();
  useAuth();
  useNavigate();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Impersonation state (client-side only — read-only view)
  const [impersonating, setImpersonating] = useState(false);

  // Plan switch form
  const [planId, setPlanId] = useState('free');
  const [period, setPeriod] = useState('monthly');
  const [planSaving, setPlanSaving] = useState(false);
  const [planMsg, setPlanMsg] = useState(null);

  // Suspend/unsuspend
  const [suspendConfirm, setSuspendConfirm] = useState(false);
  const [suspending, setSuspending] = useState(false);

  // Token revoke
  const [revokeConfirm, setRevokeConfirm] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Operations feedback
  const [opMsg, setOpMsg] = useState(null);

  // Founder notes
  const [newNote, setNewNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('operator_get_account_detail', {
        p_account_id: accountId,
      });
      if (rpcError) throw rpcError;
      setAccount(data);
      setPlanId(data.plan_id || 'free');
      setPeriod(data.sub_period || 'monthly');
    } catch (err) {
      setError(err.message || 'Failed to load account');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => { load(); }, [load]);

  // O3 — Begin impersonation
  const handleBeginImpersonation = async () => {
    try {
      const { error: rpcError } = await supabase.rpc('operator_begin_impersonation', {
        p_account_id: accountId,
      });
      if (rpcError) throw rpcError;
      setImpersonating(true);
    } catch (err) {
      setOpMsg({ type: 'error', text: err.message });
    }
  };

  const handleEndImpersonation = async () => {
    try {
      await supabase.rpc('operator_end_impersonation', { p_account_id: accountId });
    } catch (_) { /* best-effort */ }
    setImpersonating(false);
  };

  // O2 — Plan switch
  const handleSetPlan = async (e) => {
    e.preventDefault();
    setPlanSaving(true);
    setPlanMsg(null);
    try {
      const { error: rpcError } = await supabase.rpc('operator_set_plan', {
        p_account_id: accountId,
        p_plan_id: planId,
        p_period: period,
      });
      if (rpcError) throw rpcError;
      setPlanMsg({ type: 'success', text: `Plan updated to ${planId} (${period}).` });
      await load();
    } catch (err) {
      setPlanMsg({ type: 'error', text: err.message });
    } finally {
      setPlanSaving(false);
    }
  };

  // O5 — Suspend / unsuspend
  const handleSuspend = async () => {
    setSuspendConfirm(false);
    setSuspending(true);
    try {
      const isSuspended = account?.sub_status === 'canceled';
      const fn = isSuspended ? 'operator_unsuspend_account' : 'operator_suspend_account';
      const { error: rpcError } = await supabase.rpc(fn, { p_account_id: accountId });
      if (rpcError) throw rpcError;
      setOpMsg({ type: 'success', text: isSuspended ? 'Account unsuspended.' : 'Account suspended.' });
      await load();
    } catch (err) {
      setOpMsg({ type: 'error', text: err.message });
    } finally {
      setSuspending(false);
    }
  };

  // O5 — Revoke all tenant tokens
  const handleRevokeTokens = async () => {
    setRevokeConfirm(false);
    setRevoking(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('operator_revoke_tenant_tokens', {
        p_account_id: accountId,
      });
      if (rpcError) throw rpcError;
      setOpMsg({ type: 'success', text: `${data?.tokens_revoked ?? 0} tenant token(s) revoked.` });
    } catch (err) {
      setOpMsg({ type: 'error', text: err.message });
    } finally {
      setRevoking(false);
    }
  };

  // Founder notes
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNoteSaving(true);
    setNoteError(null);
    try {
      const { error: rpcError } = await supabase.rpc('operator_add_account_note', {
        p_account_id: accountId,
        p_note: newNote.trim(),
      });
      if (rpcError) throw rpcError;
      setNewNote('');
      await load();
    } catch (err) {
      setNoteError(err.message || 'Failed to save note');
    } finally {
      setNoteSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-secondary-500">
        Loading account…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={load} className="mt-3 text-sm underline">Retry</button>
        </div>
      </div>
    );
  }

  const isSuspended = account?.sub_status === 'canceled';

  return (
    <>
      {/* O3 — Impersonation banner */}
      {impersonating && (
        <ImpersonationBanner account={account} onEnd={handleEndImpersonation} />
      )}

      {/* Confirm modals */}
      {suspendConfirm && (
        <ConfirmModal
          title={isSuspended ? 'Unsuspend account?' : 'Suspend account?'}
          message={
            isSuspended
              ? `This will restore ${account.email}'s subscription to active.`
              : `This will cancel ${account.email}'s subscription. They will lose access to paid features immediately.`
          }
          onConfirm={handleSuspend}
          onCancel={() => setSuspendConfirm(false)}
          danger={!isSuspended}
        />
      )}
      {revokeConfirm && (
        <ConfirmModal
          title="Revoke all tenant tokens?"
          message={`All tenant bill links for ${account.email}'s properties will stop working immediately. This is irreversible — tenants will need new links.`}
          onConfirm={handleRevokeTokens}
          onCancel={() => setRevokeConfirm(false)}
          danger
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-secondary-500">
          <Link to="/operator" className="hover:text-primary-600">Operator Console</Link>
          <span>›</span>
          <span className="text-secondary-800 font-medium">{account?.email}</span>
        </div>

        {/* Account header */}
        <div className="bg-white border border-secondary-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-secondary-900">{account?.full_name || '(no name)'}</h1>
              <p className="text-secondary-500 text-sm mt-0.5">{account?.email}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-secondary-500">
                <span>Joined {relativeDate(account?.created_at)}</span>
                <span>·</span>
                <span>Last active {relativeDate(account?.last_sign_in_at)}</span>
                <span>·</span>
                <span>{account?.properties?.length ?? 0} properties</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!impersonating ? (
                <button
                  onClick={handleBeginImpersonation}
                  className="text-sm border border-secondary-200 rounded-lg px-3 py-1.5 text-secondary-700 hover:bg-secondary-50 transition-colors"
                >
                  👁 View as this user
                </button>
              ) : (
                <button
                  onClick={handleEndImpersonation}
                  className="text-sm border border-amber-400 rounded-lg px-3 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  End impersonation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Global op feedback */}
        {opMsg && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${opMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {opMsg.text}
            <button onClick={() => setOpMsg(null)} className="ml-3 underline text-xs">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* O2 — Plan switch */}
          <div className="bg-white border border-secondary-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-secondary-900">Plan &amp; subscription</h2>
            <div className="text-sm text-secondary-600 space-y-1">
              <div className="flex justify-between">
                <span>Current plan</span>
                <span className="font-medium text-secondary-900">{account?.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-medium ${isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                  {account?.sub_status || 'none'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Source</span>
                <span className="font-medium text-secondary-900">{account?.sub_source || '—'}</span>
              </div>
              {account?.current_period_end && (
                <div className="flex justify-between">
                  <span>Period ends</span>
                  <span className="font-medium text-secondary-900">{relativeDate(account.current_period_end)}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSetPlan} className="space-y-3 pt-2 border-t border-secondary-100">
              <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Override plan</p>
              <div className="flex gap-2">
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  className="flex-1 text-sm border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="text-sm border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {planMsg && (
                <p className={`text-xs ${planMsg.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {planMsg.text}
                </p>
              )}
              <button
                type="submit"
                disabled={planSaving}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg py-2 transition-colors disabled:opacity-50"
              >
                {planSaving ? 'Saving…' : 'Apply plan change'}
              </button>
            </form>
          </div>

          {/* O5 — Operations panel */}
          <div className="bg-white border border-secondary-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-secondary-900">Operations</h2>
            <div className="space-y-3">
              {/* Suspend / unsuspend */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-secondary-800">
                    {isSuspended ? 'Unsuspend account' : 'Suspend account'}
                  </p>
                  <p className="text-xs text-secondary-400 mt-0.5">
                    {isSuspended
                      ? 'Restore access to paid features.'
                      : 'Immediately cancels subscription. Audited.'}
                  </p>
                </div>
                <button
                  onClick={() => setSuspendConfirm(true)}
                  disabled={suspending}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    isSuspended
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {suspending ? '…' : isSuspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </div>

              <div className="border-t border-secondary-100" />

              {/* Revoke all tokens */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-secondary-800">Revoke all tenant tokens</p>
                  <p className="text-xs text-secondary-400 mt-0.5">
                    All shared bill links stop working immediately. Irreversible.
                  </p>
                </div>
                <button
                  onClick={() => setRevokeConfirm(true)}
                  disabled={revoking}
                  className="text-sm px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  {revoking ? '…' : 'Revoke all'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Properties summary */}
        {account?.properties?.length > 0 && (
          <div className="bg-white border border-secondary-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-secondary-900">Properties</h2>
            <div className="divide-y divide-secondary-100">
              {account.properties.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-secondary-800">{p.name}</span>
                  </div>
                  <div className="flex gap-4 text-secondary-500 text-xs">
                    <span>{p.tenant_count} active tenant{p.tenant_count !== 1 ? 's' : ''}</span>
                    <span>{p.bill_count_30d} bills (30d)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entitlement overrides */}
        {account?.entitlement_overrides?.length > 0 && (
          <div className="bg-white border border-secondary-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-secondary-900">Entitlement overrides</h2>
            <div className="divide-y divide-secondary-100">
              {account.entitlement_overrides.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-mono text-xs bg-secondary-100 px-2 py-0.5 rounded">{o.key}</span>
                    <span className="ml-2 text-secondary-700">{JSON.stringify(o.value)}</span>
                  </div>
                  <div className="text-xs text-secondary-400">
                    {o.expires_at ? `Expires ${relativeDate(o.expires_at)}` : 'No expiry'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Founder notes (roadmap item 9) */}
        <div className="bg-white border border-secondary-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-secondary-900">Founder notes</h2>
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this account…"
              className="flex-1 text-sm border border-secondary-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <button
              type="submit"
              disabled={noteSaving || !newNote.trim()}
              className="text-sm px-4 py-2 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {noteSaving ? 'Saving…' : 'Add'}
            </button>
          </form>
          {noteError && <p className="text-xs text-red-600">{noteError}</p>}
          {account?.notes?.length > 0 ? (
            <div className="divide-y divide-secondary-100">
              {account.notes.map((n) => (
                <div key={n.id} className="py-3 text-sm">
                  <p className="text-secondary-800">{n.note}</p>
                  <p className="text-xs text-secondary-400 mt-1">
                    {n.operator_email} · {relativeDate(n.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-secondary-400">No notes yet.</p>
          )}
        </div>

        {/* Recent bill events — O5 audit trail */}
        {account?.recent_bill_events?.length > 0 && (
          <div className="bg-white border border-secondary-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-secondary-900">Recent bill events</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {account.recent_bill_events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 text-sm">
                  <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${EVENT_COLORS[ev.event_type] || 'bg-secondary-100 text-secondary-600'}`}>
                    {ev.event_type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-secondary-500 text-xs">{relativeDate(ev.created_at)}</span>
                    {ev.payload && Object.keys(ev.payload).length > 0 && (
                      <p className="text-secondary-400 text-xs mt-0.5 truncate">
                        {JSON.stringify(ev.payload)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-secondary-300 whitespace-nowrap">{ev.actor_type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
