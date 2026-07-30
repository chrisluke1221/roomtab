import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (cents) =>
  cents == null ? '—' : `$${(cents / 100).toLocaleString('en-AU', { minimumFractionDigits: 0 })}`;

const fmtPct = (v) => (v == null ? '—' : `${v}%`);

const relativeDate = (iso) => {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PLAN_LABELS = { free: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
const PLAN_COLORS = {
  free: 'bg-secondary-100 text-secondary-700',
  pro: 'bg-primary-100 text-primary-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

// ─── MetricTile ───────────────────────────────────────────────────────────────

const MetricTile = ({ label, value, sub, alert }) => (
  <div className={`bg-white rounded-xl border p-5 flex flex-col gap-1 ${alert ? 'border-red-400 bg-red-50' : 'border-secondary-200'}`}>
    <span className="text-xs font-medium text-secondary-500 uppercase tracking-wide">{label}</span>
    <span className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-secondary-900'}`}>{value}</span>
    {sub && <span className="text-xs text-secondary-400">{sub}</span>}
  </div>
);

// ─── OperatorDashboard ────────────────────────────────────────────────────────

export default function OperatorDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [churnOnly, setChurnOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: m, error: me }, { data: a, error: ae }] = await Promise.all([
        supabase.rpc('operator_get_metrics'),
        supabase.rpc('operator_list_accounts'),
      ]);
      if (me) throw me;
      if (ae) throw ae;
      setMetrics(m);
      setAccounts(Array.isArray(a) ? a : []);
    } catch (err) {
      setError(err.message || 'Failed to load operator data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = accounts.filter((a) => {
    if (search && !a.email?.toLowerCase().includes(search.toLowerCase()) &&
        !a.full_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (planFilter !== 'all' && a.plan_id !== planFilter) return false;
    if (churnOnly && !a.churn_risk) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-secondary-500">
        Loading operator data…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-semibold">Error loading operator data</p>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={load} className="mt-3 text-sm underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Operator Console</h1>
          <p className="text-sm text-secondary-500 mt-0.5">
            Signed in as <span className="font-medium">{user?.email}</span>
            {metrics?.computed_at && (
              <span className="ml-2 text-secondary-400">
                · Refreshed {relativeDate(metrics.computed_at)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={load}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* O4 — Metrics tiles */}
      {metrics && (
        <section>
          <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-3">
            Business metrics (last 30 days)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricTile label="Signups (30d)" value={metrics.signups_30d ?? '—'} />
            <MetricTile label="Activated accounts" value={metrics.activated_accounts ?? '—'} sub="≥1 bill issued" />
            <MetricTile label="WAU" value={metrics.wau ?? '—'} sub="Active landlords (7d)" />
            <MetricTile label="Bills (30d)" value={metrics.bills_30d ?? '—'} />
            <MetricTile
              label="Split violations"
              value={metrics.split_violations ?? '—'}
              sub="Must be 0"
              alert={metrics.split_violations > 0}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <MetricTile label="Link open rate" value={fmtPct(metrics.link_open_rate_pct)} sub="Viewed / sent (30d)" />
            <MetricTile label="Confirm rate" value={fmtPct(metrics.confirm_rate_pct)} sub="Confirmed / claimed (30d)" />
            <MetricTile label="MRR" value={fmt(metrics.mrr_cents)} />
            <div className="bg-white rounded-xl border border-secondary-200 p-5">
              <span className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Plan mix</span>
              <div className="mt-2 space-y-1">
                {metrics.plan_mix && Object.entries(metrics.plan_mix).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[plan] || 'bg-secondary-100 text-secondary-700'}`}>
                      {PLAN_LABELS[plan] || plan}
                    </span>
                    <span className="font-semibold text-secondary-800">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* O1 — Accounts list */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide flex-1">
            Accounts ({filtered.length}{filtered.length !== accounts.length ? ` of ${accounts.length}` : ''})
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Search email or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm border border-secondary-200 rounded-lg px-3 py-1.5 w-52 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="text-sm border border-secondary-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="all">All plans</option>
              <option value="free">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <label className="flex items-center gap-1.5 text-sm text-secondary-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={churnOnly}
                onChange={(e) => setChurnOnly(e.target.checked)}
                className="rounded"
              />
              Churn risk only
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-secondary-200 rounded-xl p-8 text-center text-secondary-400 text-sm">
            No accounts match your filters.
          </div>
        ) : (
          <div className="bg-white border border-secondary-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Account</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Plan</th>
                  <th className="text-right px-4 py-3 font-medium text-secondary-600">Properties</th>
                  <th className="text-right px-4 py-3 font-medium text-secondary-600">Tenants</th>
                  <th className="text-right px-4 py-3 font-medium text-secondary-600">Bills (30d)</th>
                  <th className="text-right px-4 py-3 font-medium text-secondary-600">MRR</th>
                  <th className="text-left px-4 py-3 font-medium text-secondary-600">Last active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filtered.map((a) => (
                  <tr key={a.id} className={`hover:bg-secondary-50 transition-colors ${a.churn_risk ? 'bg-amber-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-secondary-900">{a.full_name || '—'}</div>
                      <div className="text-secondary-400 text-xs">{a.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[a.plan_id] || 'bg-secondary-100 text-secondary-700'}`}>
                        {PLAN_LABELS[a.plan_id] || a.plan_id}
                      </span>
                      {a.churn_risk && (
                        <span className="ml-1.5 text-xs text-amber-600 font-medium">⚠ Churn risk</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-secondary-700">{a.properties_count}</td>
                    <td className="px-4 py-3 text-right text-secondary-700">{a.active_tenants_count}</td>
                    <td className="px-4 py-3 text-right text-secondary-700">{a.bills_30d}</td>
                    <td className="px-4 py-3 text-right text-secondary-700">{fmt(a.mrr_cents)}</td>
                    <td className="px-4 py-3 text-secondary-500">{relativeDate(a.last_sign_in_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/operator/accounts/${a.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-xs"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
